import { useState, useEffect, useRef, useCallback } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import { LocationData, LocationSettings } from '@/types/api'
import { isIOSDevice, iOSLocationUtils, LocationCompatibility } from '@/lib/utils'

interface UseLocationTrackingOptions {
  rideId: string
}

function getInitialSharingEnabled(settings: LocationSettings | null): boolean {
  return settings?.location_sharing_enabled ?? false
}

export function useLocationTracking({ rideId }: UseLocationTrackingOptions) {
  const [locations, setLocations] = useState<LocationData[]>([])
  const [locationSettings, setLocationSettings] = useState<LocationSettings | null>(null)
  const [isSharingEnabled, setIsSharingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggleLoading, setIsToggleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [isIOS] = useState(isIOSDevice())
  const [isCompatible] = useState(LocationCompatibility.isSupported())

  const api = useApi()
  const { user } = useUser()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasCheckedPermission = useRef(false)

  // Log compatibility info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      LocationCompatibility.getCompatibilityInfo()
    }
  }, [])

  // Standard permission checking
  const checkGeolocationPermission = useCallback(async () => {
    console.log('📍 [HOOK DEBUG] Starting permission check')
    
    try {
      const permission = await iOSLocationUtils.checkLocationPermission()
      console.log('📍 [HOOK DEBUG] Permission check result:', permission)
      setPermissionState(permission)
      return permission
    } catch (err) {
      console.error('📍 [HOOK DEBUG] Permission check failed:', err)
      setPermissionState('unknown')
      return 'unknown'
    }
  }, [])

  // Standard location request
  const requestLocation = useCallback(async (): Promise<GeolocationPosition | null> => {
    console.log('📍 [HOOK DEBUG] Starting location request')
    
    try {
      const position = await iOSLocationUtils.requestLocationWithRetry()
      console.log('📍 [HOOK DEBUG] Location request successful:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      })
      return position
    } catch (err) {
      console.error('📍 [HOOK DEBUG] Location request failed:', err)
      throw err
    }
  }, [])

  // Fetch location settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.getLocationSettings()
        setLocationSettings(settings)
        console.log('📍 Location settings loaded:', settings)
        
        // Set initial sharing state based on onboarding preference
        if (!hasCheckedPermission.current) {
          const initialSharing = getInitialSharingEnabled(settings)
          setIsSharingEnabled(initialSharing)
          console.log('📍 Initial location sharing state:', initialSharing)
        }
      } catch (err) {
        console.error('Failed to fetch location settings:', err)
        setError('Failed to fetch location settings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [api])

  // Check geolocation permission after location settings are loaded
  useEffect(() => {
    if (locationSettings && typeof window !== 'undefined') {
      console.log('📍 [HOOK DEBUG] Location settings loaded, checking permission')
      
      checkGeolocationPermission().then((permission) => {
        hasCheckedPermission.current = true
        console.log('📍 [HOOK DEBUG] Permission check completed:', permission)
        console.log('📍 [HOOK DEBUG] Onboarding preference:', locationSettings.location_sharing_enabled)
        
        // Use standard permission logic for all devices
        if (permission === 'denied') {
          console.log('📍 [HOOK DEBUG] Permission denied, disabling location sharing')
          setIsSharingEnabled(false)
        } else {
          const onboardingPreference = locationSettings.location_sharing_enabled ?? false
          console.log('📍 [HOOK DEBUG] Permission granted/prompt, using onboarding preference:', onboardingPreference)
          setIsSharingEnabled(onboardingPreference)
        }
      }).catch((err) => {
        console.error('📍 [HOOK DEBUG] Permission check failed:', err)
        // If permission check fails, assume we can prompt
        const onboardingPreference = locationSettings.location_sharing_enabled ?? false
        console.log('📍 [HOOK DEBUG] Using fallback onboarding preference:', onboardingPreference)
        setIsSharingEnabled(onboardingPreference)
      })
    }
  }, [locationSettings, checkGeolocationPermission])

  // Main interval for location updates
  useEffect(() => {
    console.log('📍 [INTERVAL DEBUG] Location tracking interval effect triggered')
    console.log('📍 [INTERVAL DEBUG] Conditions:', {
      isSharingEnabled,
      hasUser: !!user,
      isCompatible
    })
    
    if (!isSharingEnabled || !user || !isCompatible) {
      console.log('📍 [INTERVAL DEBUG] Stopping location tracking - conditions not met')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    console.log('📍 [INTERVAL DEBUG] Starting location tracking interval')

    const updateLocation = async () => {
      console.log('📍 [INTERVAL DEBUG] Starting location update')
      
      try {
        const position = await requestLocation()
        if (position) {
          console.log('📍 [INTERVAL DEBUG] Position received, updating via API...')
          
          await api.updateUserLocation(
            rideId,
            position.coords.latitude,
            position.coords.longitude
          )
          console.log('📍 [INTERVAL DEBUG] Location updated successfully via API')
          
          // Fetch latest locations
          try {
            const latestLocations = await api.getLatestLocations(rideId)
            setLocations(Array.isArray(latestLocations) ? latestLocations : [])
            setError(null) // Clear any previous errors
            console.log('📍 [INTERVAL DEBUG] Latest locations fetched successfully:', latestLocations.length, 'locations')
          } catch (fetchError) {
            console.error('📍 [INTERVAL DEBUG] Failed to fetch latest locations:', fetchError)
          }
        }
      } catch (err) {
        console.error('📍 [INTERVAL DEBUG] Location update error:', err)
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to update location'
        setError(errorMessage)
        
        // For permission errors, stop the interval
        if (err instanceof Error && 
            (err.message.includes('denied') || err.message.includes('Permission denied'))) {
          console.log('📍 [INTERVAL DEBUG] Permission error detected - stopping location tracking')
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return
        }
      }
    }

    // Initial location update
    console.log('📍 [INTERVAL DEBUG] Triggering initial location update')
    updateLocation()

    // Set up interval for subsequent updates
    const intervalMs = 5000 // 5 seconds for all devices
    console.log('📍 [INTERVAL DEBUG] Setting up', intervalMs/1000, '-second interval for location updates')
    intervalRef.current = setInterval(updateLocation, intervalMs)

    return () => {
      console.log('📍 [INTERVAL DEBUG] Cleaning up location tracking interval')
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isSharingEnabled, rideId, api, user, requestLocation, isCompatible])

  // Toggle location sharing
  const toggleLocationSharing = async (enabled: boolean) => {
    console.log('📍 [TOGGLE DEBUG] Starting location sharing toggle')
    console.log('📍 [TOGGLE DEBUG] Requested state:', enabled)
    
    // Clear any previous errors when user tries to toggle
    if (error) {
      setError(null)
    }
    
    setIsToggleLoading(true)
    
    try {
      if (enabled) {
        // Check permission first before enabling
        console.log('📍 [TOGGLE DEBUG] Checking location permission before enabling')
        const permission = await checkGeolocationPermission()
        
        if (permission === 'denied') {
          throw new Error('Location access denied. Please allow location access in your browser settings.')
        }
        
        // Request location permission when enabling
        console.log('📍 [TOGGLE DEBUG] Requesting location permission')
        await requestLocation()
        console.log('📍 [TOGGLE DEBUG] Location permission granted')
      }
      
      // Update settings
      console.log('📍 [TOGGLE DEBUG] Updating location settings via API...')
      await api.updateLocationSettings(enabled)
      setIsSharingEnabled(enabled)
      setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
      setError(null)
      console.log('📍 [TOGGLE DEBUG] Location sharing settings updated successfully')
    } catch (err) {
      console.error('📍 [TOGGLE DEBUG] Failed to update location sharing settings:', err)
      
      // Handle specific permission errors
      if (err instanceof Error) {
        if (err.message.includes('denied') || err.message.includes('Permission denied')) {
          setError('Location access denied. Please allow location access in your browser settings and try again.')
          // Don't update local state for permission errors
          setIsSharingEnabled(false)
          setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: false } : null)
        } else {
          setError(err.message)
          // For other errors, update the local state to match user intent
          setIsSharingEnabled(enabled)
          setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
        }
      } else {
        setError('Failed to update location sharing settings')
        // For unknown errors, update the local state to match user intent
        setIsSharingEnabled(enabled)
        setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
      }
    } finally {
      setIsToggleLoading(false)
    }
  }

  // Manual location request
  const requestManualLocation = useCallback(async () => {
    try {
      const position = await requestLocation()
      if (position && isSharingEnabled) {
        await api.updateUserLocation(
          rideId,
          position.coords.latitude,
          position.coords.longitude
        )
        const latestLocations = await api.getLatestLocations(rideId)
        setLocations(Array.isArray(latestLocations) ? latestLocations : [])
        setError(null)
      }
    } catch (err) {
      console.error('📍 Manual location request failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to get location')
    }
  }, [requestLocation, isSharingEnabled, api, rideId])

  return {
    locations,
    locationSettings,
    isSharingEnabled,
    isLoading,
    isToggleLoading,
    error,
    permissionState,
    isIOS,
    isCompatible,
    toggleLocationSharing,
    requestLocation: requestManualLocation
  }
} 