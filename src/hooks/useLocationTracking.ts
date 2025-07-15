import { useState, useEffect, useRef } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import { LocationData, LocationSettings } from '@/types/api'

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

  const api = useApi()
  const { user } = useUser()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasCheckedPermission = useRef(false)

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
    if (locationSettings && typeof window !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        hasCheckedPermission.current = true
        console.log('📍 Geolocation permission state:', result.state)
        
        // Only disable sharing if permission is explicitly denied
        // If permission is granted or prompt, respect the user's onboarding preference
        if (result.state === 'denied') {
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
  }, [locationSettings])

  // Main interval for POST and GET
  useEffect(() => {
    if (!isSharingEnabled || !user) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await api.updateUserLocation(
              rideId,
              position.coords.latitude,
              position.coords.longitude
            )
            const latestLocations = await api.getLatestLocations(rideId)
            setLocations(Array.isArray(latestLocations) ? latestLocations : [])
          } catch (err) {
            setError('Failed to update or fetch locations')
          }
        },
        (geoError) => {
          setError('Failed to get your location')
        }
      )
    }, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isSharingEnabled, rideId, api, user])

  // Toggle location sharing
  const toggleLocationSharing = async (enabled: boolean) => {
    try {
      console.log('📍 Updating location sharing settings to:', enabled)
      await api.updateLocationSettings(enabled)
      setIsSharingEnabled(enabled)
      setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
      console.log('📍 Location sharing settings updated successfully')
    } catch (err) {
      console.error('Failed to update location sharing settings:', err)
      setError('Failed to update location sharing settings')
    }
  }

  return {
    locations,
    locationSettings,
    isSharingEnabled,
    isLoading,
    error,
    toggleLocationSharing
  }
} 