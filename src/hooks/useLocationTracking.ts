import { useState, useEffect, useRef } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import { LocationData, LocationSettings } from '@/types/api'

interface UseLocationTrackingOptions {
  rideId: string
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

  // Fetch location settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.getLocationSettings()
        setLocationSettings(settings)
        setIsSharingEnabled(settings.location_sharing_enabled)
      } catch (err) {
        setError('Failed to fetch location settings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [api])

  // Main interval for POST and GET
  useEffect(() => {
    if (!isSharingEnabled || !user) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      // 1. Get current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // 2. POST: update user location
            await api.updateUserLocation(
              rideId,
              position.coords.latitude,
              position.coords.longitude
            )
            // 3. GET: fetch all latest locations
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
    // Cleanup
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