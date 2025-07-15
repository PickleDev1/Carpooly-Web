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
  const [isToggleLoading, setIsToggleLoading] = useState(false)
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
    console.log('📍 [HOOK DEBUG] Starting permission check in hook at:', new Date().toISOString())
    console.log('📍 [HOOK DEBUG] Is iOS device:', isIOS)
    console.log('📍 [HOOK DEBUG] Current permission state:', permissionState)
    
    const permission = await iOSLocationUtils.checkLocationPermission()
    console.log('📍 [HOOK DEBUG] Permission check result:', permission)
    console.log('📍 [HOOK DEBUG] Previous permission state:', permissionState, '→ New state:', permission)
    
    setPermissionState(permission)
    return permission
  }, [isIOS, permissionState])

  // iOS-specific location request with user gesture handling
  const requestLocationWithUserGesture = useCallback(async (): Promise<GeolocationPosition | null> => {
    console.log('📍 [HOOK DEBUG] Starting location request with user gesture at:', new Date().toISOString())
    console.log('📍 [HOOK DEBUG] Is iOS device:', isIOS)
    console.log('📍 [HOOK DEBUG] Current permission state:', permissionState)
    console.log('📍 [HOOK DEBUG] Is sharing enabled:', isSharingEnabled)
    
    try {
      // For iOS, ensure we're in a user gesture context
      if (isIOS) {
        console.log('📍 [HOOK DEBUG] iOS detected - ensuring user gesture context for location request')
      }
      
      const position = await iOSLocationUtils.requestLocation()
      console.log('📍 [HOOK DEBUG] Location request successful:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      })
      return position
    } catch (err) {
      console.error('📍 [HOOK DEBUG] Location request failed:', err)
      console.log('📍 [HOOK DEBUG] Error type:', typeof err)
      console.log('📍 [HOOK DEBUG] Error instanceof Error:', err instanceof Error)
      if (err instanceof Error) {
        console.log('📍 [HOOK DEBUG] Error message:', err.message)
        console.log('📍 [HOOK DEBUG] Error stack:', err.stack)
      }
      
      // For iOS, provide more specific error handling
      if (isIOS) {
        if (err instanceof Error) {
          if (err.message.includes('denied') || err.message.includes('Permission denied')) {
            console.log('📍 [HOOK DEBUG] iOS permission denied detected')
            throw new Error('Location access denied. Please allow location access in Safari settings.')
          } else if (err.message.includes('timeout')) {
            console.log('📍 [HOOK DEBUG] iOS timeout detected')
            throw new Error('Location request timed out. Please try again.')
          } else if (err.message.includes('unavailable')) {
            console.log('📍 [HOOK DEBUG] iOS position unavailable detected')
            throw new Error('Location services unavailable. Please check your device settings.')
          }
        }
      }
      
      throw err
    }
  }, [isIOS, permissionState, isSharingEnabled])

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
      console.log('📍 [HOOK DEBUG] Location settings loaded, checking permission at:', new Date().toISOString())
      console.log('📍 [HOOK DEBUG] Location settings:', locationSettings)
      console.log('📍 [HOOK DEBUG] Has checked permission before:', hasCheckedPermission.current)
      
      checkGeolocationPermission().then((permission) => {
        hasCheckedPermission.current = true
        console.log('📍 [HOOK DEBUG] Permission check completed:', permission)
        console.log('📍 [HOOK DEBUG] Onboarding preference:', locationSettings.location_sharing_enabled)
        
        // For iOS, be more lenient with permission states
        if (isIOS) {
          console.log('📍 [HOOK DEBUG] iOS device - using lenient permission logic')
          if (permission === 'denied') {
            console.log('📍 [HOOK DEBUG] iOS permission explicitly denied, but checking if this is a Safari sync issue')
            // For iOS Safari, even if permission shows as 'denied', 
            // it might be a sync issue with Safari settings
            // We'll still allow the user to try enabling location sharing
            const onboardingPreference = locationSettings.location_sharing_enabled ?? false
            console.log('📍 [HOOK DEBUG] iOS Safari sync issue suspected - using onboarding preference:', onboardingPreference)
            setIsSharingEnabled(onboardingPreference)
          } else {
            // For iOS, if permission is 'prompt' or 'granted', use the user's preference
            // This handles cases where iOS permissions API is unreliable
            const onboardingPreference = locationSettings.location_sharing_enabled ?? false
            console.log('📍 [HOOK DEBUG] iOS permission prompt/granted, using onboarding preference:', onboardingPreference)
            setIsSharingEnabled(onboardingPreference)
          }
        } else {
          console.log('📍 [HOOK DEBUG] Non-iOS device - using standard permission logic')
          // For non-iOS devices, use the original logic
          if (permission === 'denied') {
            console.log('📍 [HOOK DEBUG] Permission denied, disabling location sharing')
            setIsSharingEnabled(false)
          } else {
            const onboardingPreference = locationSettings.location_sharing_enabled ?? false
            console.log('📍 [HOOK DEBUG] Permission granted/prompt, using onboarding preference:', onboardingPreference)
            setIsSharingEnabled(onboardingPreference)
          }
        }
      }).catch((err) => {
        console.error('📍 [HOOK DEBUG] Permission check failed:', err)
        console.log('📍 [HOOK DEBUG] Error details:', {
          message: err.message,
          stack: err.stack,
          type: typeof err
        })
        // If permission check fails, assume we can prompt
        const onboardingPreference = locationSettings.location_sharing_enabled ?? false
        console.log('📍 [HOOK DEBUG] Using fallback onboarding preference:', onboardingPreference)
        setIsSharingEnabled(onboardingPreference)
      })
    }
  }, [locationSettings, checkGeolocationPermission, isIOS])

  // Main interval for POST and GET with iOS-specific handling
  useEffect(() => {
    console.log('📍 [INTERVAL DEBUG] Location tracking interval effect triggered at:', new Date().toISOString())
    console.log('📍 [INTERVAL DEBUG] Conditions:', {
      isSharingEnabled,
      hasUser: !!user,
      isCompatible,
      isIOS,
      hasRequestedPermission: hasRequestedPermission.current
    })
    
    if (!isSharingEnabled || !user || !isCompatible) {
      console.log('📍 [INTERVAL DEBUG] Stopping location tracking - conditions not met')
      if (intervalRef.current) {
        console.log('📍 [INTERVAL DEBUG] Clearing existing interval')
        clearInterval(intervalRef.current)
      }
      return
    }

    // For iOS, we need to ensure the first location request happens with user gesture
    if (isIOS && !hasRequestedPermission.current) {
      console.log('📍 [INTERVAL DEBUG] iOS detected - waiting for user gesture before starting location tracking')
      return
    }

    console.log('📍 [INTERVAL DEBUG] Starting location tracking interval')

    const updateLocation = async () => {
      const updateStartTime = Date.now()
      console.log('📍 [INTERVAL DEBUG] Starting location update at:', new Date().toISOString())
      
      try {
        const position = await requestLocationWithUserGesture()
        if (position) {
          console.log('📍 [INTERVAL DEBUG] Position received, validating coordinates...')
          
          // Validate coordinates before sending
          if (isNaN(position.coords.latitude) || isNaN(position.coords.longitude)) {
            console.error('📍 [INTERVAL DEBUG] Invalid coordinates received:', position.coords)
            throw new Error('Invalid location data received')
          }

          // Check coordinate bounds
          if (position.coords.latitude < -90 || position.coords.latitude > 90 ||
              position.coords.longitude < -180 || position.coords.longitude > 180) {
            console.error('📍 [INTERVAL DEBUG] Coordinates out of bounds:', position.coords)
            throw new Error('Location coordinates are out of valid range')
          }

          console.log('📍 [INTERVAL DEBUG] Coordinates validated, updating via API...')
          await api.updateUserLocation(
            rideId,
            position.coords.latitude,
            position.coords.longitude
          )
          console.log('📍 [INTERVAL DEBUG] Location updated successfully via API')
          
          // Fetch latest locations with error handling
          try {
            console.log('📍 [INTERVAL DEBUG] Fetching latest locations...')
            const latestLocations = await api.getLatestLocations(rideId)
            setLocations(Array.isArray(latestLocations) ? latestLocations : [])
            setError(null) // Clear any previous errors
            console.log('📍 [INTERVAL DEBUG] Latest locations fetched successfully:', latestLocations.length, 'locations')
          } catch (fetchError) {
            console.error('📍 [INTERVAL DEBUG] Failed to fetch latest locations:', fetchError)
            // Don't set error here as location update was successful
            // Just log the issue and continue
          }
        }
      } catch (err) {
        const updateElapsed = Date.now() - updateStartTime
        console.error('📍 [INTERVAL DEBUG] Location update error after', updateElapsed, 'ms:', err)
        console.log('📍 [INTERVAL DEBUG] Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          type: typeof err,
          stack: err instanceof Error ? err.stack : undefined
        })
        const errorMessage = err instanceof Error ? err.message : 'Failed to update location'
        setError(errorMessage)
        
        // For network errors, don't stop the interval - let it retry
        // For permission errors, the user will need to manually retry
      }
    }

    // Initial location update
    console.log('📍 [INTERVAL DEBUG] Triggering initial location update')
    updateLocation()

    // Set up interval for subsequent updates with error recovery
    console.log('📍 [INTERVAL DEBUG] Setting up 5-second interval for location updates')
    intervalRef.current = setInterval(updateLocation, 5000)

    return () => {
      console.log('📍 [INTERVAL DEBUG] Cleaning up location tracking interval')
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isSharingEnabled, rideId, api, user, isIOS, requestLocationWithUserGesture, isCompatible])

  // Toggle location sharing with iOS-specific handling
  const toggleLocationSharing = async (enabled: boolean) => {
    console.log('📍 [TOGGLE DEBUG] Starting location sharing toggle at:', new Date().toISOString())
    console.log('📍 [TOGGLE DEBUG] Requested state:', enabled)
    console.log('📍 [TOGGLE DEBUG] Is iOS device:', isIOS)
    console.log('📍 [TOGGLE DEBUG] Current permission state:', permissionState)
    console.log('📍 [TOGGLE DEBUG] Current sharing state:', isSharingEnabled)
    
    // Clear any previous errors when user tries to toggle
    if (error) {
      console.log('📍 [TOGGLE DEBUG] Clearing previous error for retry')
      setError(null)
    }
    
    // Set loading state to prevent multiple toggles
    setIsToggleLoading(true)
    
    try {
      console.log('📍 [TOGGLE DEBUG] Updating location sharing settings to:', enabled)
      
      if (enabled && isIOS) {
        // For iOS, we need to request permission with user gesture
        console.log('📍 [TOGGLE DEBUG] iOS detected - requesting location permission with user gesture')
        hasRequestedPermission.current = true
        
        try {
          // First check if we already have permission
          console.log('📍 [TOGGLE DEBUG] Checking current iOS permission state...')
          const currentPermission = await checkGeolocationPermission()
          console.log('📍 [TOGGLE DEBUG] Current iOS permission state:', currentPermission)
          
          if (currentPermission === 'denied') {
            console.log('📍 [TOGGLE DEBUG] iOS permission shows as denied, but this might be a Safari sync issue')
            console.log('📍 [TOGGLE DEBUG] Attempting to force Safari to re-evaluate permission')
            
            // Try to force Safari to sync the permission
            const syncSuccess = await iOSLocationUtils.forceIOSPermissionSync()
            if (syncSuccess) {
              console.log('📍 [TOGGLE DEBUG] Safari permission sync successful')
            } else {
              console.log('📍 [TOGGLE DEBUG] Safari permission sync failed, but continuing with location request')
            }
          }
          
          // Try to request location to establish user gesture context
          console.log('📍 [TOGGLE DEBUG] Requesting location with user gesture...')
          await requestLocationWithUserGesture()
          console.log('📍 [TOGGLE DEBUG] iOS location permission granted')
          
          // If successful, proceed with enabling sharing
          console.log('📍 [TOGGLE DEBUG] Updating location settings via API...')
          await api.updateLocationSettings(enabled)
          setIsSharingEnabled(enabled)
          setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
          setError(null) // Clear any previous errors
          console.log('📍 [TOGGLE DEBUG] Location sharing settings updated successfully')
        } catch (err) {
          console.error('📍 [TOGGLE DEBUG] iOS location permission denied:', err)
          console.log('📍 [TOGGLE DEBUG] Error details:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            type: typeof err,
            stack: err instanceof Error ? err.stack : undefined
          })
          setError(err instanceof Error ? err.message : 'Location access denied')
          // For iOS, even if location request fails, we should still allow the toggle
          // to complete so the user can try again. The error will be displayed but
          // the toggle state should reflect what the user intended.
          console.log('📍 [TOGGLE DEBUG] iOS location request failed, but allowing toggle to complete')
          await api.updateLocationSettings(enabled)
          setIsSharingEnabled(enabled)
          setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
          console.log('📍 [TOGGLE DEBUG] Location sharing settings updated despite location request failure')
        }
      } else {
        // For non-iOS or disabling, just update settings
        console.log('📍 [TOGGLE DEBUG] Non-iOS device or disabling - updating settings directly')
        await api.updateLocationSettings(enabled)
        setIsSharingEnabled(enabled)
        setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
        setError(null) // Clear any previous errors
              console.log('📍 [TOGGLE DEBUG] Location sharing settings updated successfully')
    }
  } catch (err) {
    console.error('📍 [TOGGLE DEBUG] Failed to update location sharing settings:', err)
    console.log('📍 [TOGGLE DEBUG] Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      type: typeof err,
      stack: err instanceof Error ? err.stack : undefined
    })
    setError('Failed to update location sharing settings')
    // Even if there's an error, we should still update the local state
    // to match what the user intended, so they can try again
    console.log('📍 [TOGGLE DEBUG] Updating local state despite error to allow retry')
    setIsSharingEnabled(enabled)
    setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
  } finally {
    // Always clear loading state
    setIsToggleLoading(false)
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
    isToggleLoading,
    error,
    permissionState,
    isIOS,
    isCompatible,
    toggleLocationSharing,
    requestLocation
  }
} 