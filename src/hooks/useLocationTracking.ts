import { useState, useEffect, useRef, useCallback } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import { LocationData, LocationSettings } from '@/types/api'
import { isIOSDevice, iOSLocationUtils, LocationCompatibility } from '@/lib/utils'

interface UseLocationTrackingOptions {
  rideId: string
}

function getInitialSharingEnabled(settings: LocationSettings | null): boolean {
  // Use the user's onboarding preference as the initial state
  // This ensures the toggle starts in the same state they chose during onboarding
  return settings?.location_sharing_enabled ?? false
}

export function useLocationTracking({ rideId }: UseLocationTrackingOptions) {
  const [locations, setLocations] = useState<LocationData[]>([])
  const [locationSettings, setLocationSettings] = useState<LocationSettings | null>(null)
  const [isSharingEnabled, setIsSharingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [isIOS] = useState(isIOSDevice())
  const [isCompatible] = useState(LocationCompatibility.isSupported())

  const api = useApi()
  const { user } = useUser()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasCheckedPermission = useRef(false)
  const hasRequestedPermission = useRef(false)

  // Log compatibility info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      LocationCompatibility.getCompatibilityInfo()
    }
  }, [])

  // Enhanced permission checking for iOS
  const checkGeolocationPermission = useCallback(async () => {
    const permission = await iOSLocationUtils.checkLocationPermission()
    setPermissionState(permission)
    return permission
  }, [])

  // iOS-specific location request with user gesture handling
  const requestLocationWithUserGesture = useCallback(async (): Promise<GeolocationPosition | null> => {
    try {
      // For iOS, ensure we're in a user gesture context
      if (isIOS) {
        console.log('📍 iOS detected - ensuring user gesture context for location request')
      }
      
      const position = await iOSLocationUtils.requestLocation()
      return position
    } catch (err) {
      console.error('📍 Location request failed:', err)
      throw err
    }
  }, [isIOS])

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
      checkGeolocationPermission().then((permission) => {
        hasCheckedPermission.current = true
        console.log('📍 Permission check completed:', permission)
        
        // Only disable sharing if permission is explicitly denied
        if (permission === 'denied') {
          console.log('📍 Permission denied, disabling location sharing')
          setIsSharingEnabled(false)
        } else {
          // Permission granted or prompt - use the user's onboarding preference
          const onboardingPreference = locationSettings.location_sharing_enabled ?? false
          console.log('📍 Permission granted/prompt, using onboarding preference:', onboardingPreference)
          setIsSharingEnabled(onboardingPreference)
        }
      })
    }
  }, [locationSettings, checkGeolocationPermission])

  // Main interval for POST and GET with iOS-specific handling
  useEffect(() => {
    if (!isSharingEnabled || !user || !isCompatible) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    // For iOS, we need to ensure the first location request happens with user gesture
    if (isIOS && !hasRequestedPermission.current) {
      console.log('📍 iOS detected - waiting for user gesture before starting location tracking')
      return
    }

    const updateLocation = async () => {
      try {
        const position = await requestLocationWithUserGesture()
        if (position) {
          // Validate coordinates before sending
          if (isNaN(position.coords.latitude) || isNaN(position.coords.longitude)) {
            console.error('📍 Invalid coordinates received:', position.coords)
            throw new Error('Invalid location data received')
          }

          // Check coordinate bounds
          if (position.coords.latitude < -90 || position.coords.latitude > 90 ||
              position.coords.longitude < -180 || position.coords.longitude > 180) {
            console.error('📍 Coordinates out of bounds:', position.coords)
            throw new Error('Location coordinates are out of valid range')
          }

          await api.updateUserLocation(
            rideId,
            position.coords.latitude,
            position.coords.longitude
          )
          
          // Fetch latest locations with error handling
          try {
            const latestLocations = await api.getLatestLocations(rideId)
            setLocations(Array.isArray(latestLocations) ? latestLocations : [])
            setError(null) // Clear any previous errors
          } catch (fetchError) {
            console.error('📍 Failed to fetch latest locations:', fetchError)
            // Don't set error here as location update was successful
            // Just log the issue and continue
          }
        }
      } catch (err) {
        console.error('📍 Location update error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to update location'
        setError(errorMessage)
        
        // For network errors, don't stop the interval - let it retry
        // For permission errors, the user will need to manually retry
      }
    }

    // Initial location update
    updateLocation()

    // Set up interval for subsequent updates with error recovery
    intervalRef.current = setInterval(updateLocation, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isSharingEnabled, rideId, api, user, isIOS, requestLocationWithUserGesture, isCompatible])

  // Toggle location sharing with iOS-specific handling
  const toggleLocationSharing = async (enabled: boolean) => {
    try {
      console.log('📍 Updating location sharing settings to:', enabled)
      
      if (enabled && isIOS) {
        // For iOS, we need to request permission with user gesture
        console.log('📍 iOS detected - requesting location permission with user gesture')
        hasRequestedPermission.current = true
        
        try {
          // Immediately request location to establish user gesture context
          await requestLocationWithUserGesture()
          console.log('📍 iOS location permission granted')
          
          // If successful, proceed with enabling sharing
          await api.updateLocationSettings(enabled)
          setIsSharingEnabled(enabled)
          setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
          console.log('📍 Location sharing settings updated successfully')
        } catch (err) {
          console.error('📍 iOS location permission denied:', err)
          setError(err instanceof Error ? err.message : 'Location access denied')
          // Don't enable sharing if permission is denied
          return
        }
      } else {
        // For non-iOS or disabling, just update settings
        await api.updateLocationSettings(enabled)
        setIsSharingEnabled(enabled)
        setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
        console.log('📍 Location sharing settings updated successfully')
      }
    } catch (err) {
      console.error('Failed to update location sharing settings:', err)
      setError('Failed to update location sharing settings')
    }
  }

  // Manual location request for iOS (triggered by user gesture)
  const requestLocation = useCallback(async () => {
    if (!isIOS) return

    try {
      hasRequestedPermission.current = true
      const position = await requestLocationWithUserGesture()
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
  }, [isIOS, requestLocationWithUserGesture, isSharingEnabled, api, rideId])

  return {
    locations,
    locationSettings,
    isSharingEnabled,
    isLoading,
    error,
    permissionState,
    isIOS,
    isCompatible,
    toggleLocationSharing,
    requestLocation
  }
} 