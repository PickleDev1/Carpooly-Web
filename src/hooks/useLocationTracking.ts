import { useState, useEffect, useRef } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import { LocationData, LocationSettings } from '@/types/api'

interface UseLocationTrackingOptions {
  rideId: string
}

function getInitialSharingEnabled(settings: LocationSettings | null): boolean {
  if (typeof window !== 'undefined' && navigator.permissions) {
    // Check geolocation permission
    // This is async, so we will also check in useEffect
    // For now, default to false if permission is not granted
    // (We will update in useEffect)
    return false
  }
  // Fallback to backend setting if available
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
        // Only set sharing enabled if not checked permission yet
        if (!hasCheckedPermission.current) {
          setIsSharingEnabled(getInitialSharingEnabled(settings))
        }
      } catch (err) {
        setError('Failed to fetch location settings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [api])

  // Check geolocation permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        hasCheckedPermission.current = true
        if (result.state === 'granted') {
          setIsSharingEnabled(locationSettings?.location_sharing_enabled ?? false)
        } else {
          setIsSharingEnabled(false)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      await api.updateLocationSettings(enabled)
      setIsSharingEnabled(enabled)
      setLocationSettings(prev => prev ? { ...prev, location_sharing_enabled: enabled } : null)
    } catch (err) {
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