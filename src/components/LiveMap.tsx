'use client'

import { useLocationTracking } from '@/hooks/useLocationTracking'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MapPin, Users, Settings } from 'lucide-react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { reverseGeocodeWithCache } from '@/lib/utils'

interface LiveMapProps {
  rideId: string
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
}

function getUserInitial(user: any) {
  if (!user) return 'M';
  return user.firstName?.[0]?.toUpperCase() || user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'M';
}

function getMarkerIcon(initial: string, color: string) {
  const svg = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="${color}" />
      <text x="24" y="30" text-anchor="middle" font-size="20" font-family="Arial" fill="white" font-weight="bold">${initial}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function LiveMap({ rideId }: LiveMapProps) {
  const { user, isLoaded } = useUser()
  const {
    locations,
    isSharingEnabled,
    isLoading,
    error,
    toggleLocationSharing
  } = useLocationTracking({ rideId })

  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<Map<string, string>>(new Map())

  // Google Maps API key from env
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Center on first user or default to San Francisco
  const center = useMemo(() => (
    locations.length > 0
      ? { lat: locations[0].latitude, lng: locations[0].longitude }
      : { lat: 37.7749, lng: -122.4194 }
  ), [locations])

  // Fit bounds to all markers
  const onMapLoad = useCallback((map: google.maps.Map) => {
    if (locations.length === 0) return
    const bounds = new window.google.maps.LatLngBounds()
    locations.forEach(loc => bounds.extend({ lat: loc.latitude, lng: loc.longitude }))
    map.fitBounds(bounds)
  }, [locations])

  const { isLoaded: isMapLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
  })

  // Reverse geocoding effect to convert coordinates to addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      const newAddresses = new Map<string, string>()
      
      for (const location of locations) {
        const locationKey = `${location.latitude},${location.longitude}`
        
        if (!addresses.has(locationKey)) {
          try {
            const address = await reverseGeocodeWithCache(location.latitude, location.longitude)
            newAddresses.set(locationKey, address)
          } catch (error) {
            console.error('Failed to reverse geocode location:', error)
            newAddresses.set(locationKey, `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)
          }
        } else {
          newAddresses.set(locationKey, addresses.get(locationKey)!)
        }
      }
      
      setAddresses(newAddresses)
    }

    if (locations.length > 0) {
      fetchAddresses()
    }
  }, [locations, addresses])

  const handleLocationSharingToggle = async (enabled: boolean) => {
    try {
      await toggleLocationSharing(enabled)
    } catch (err) {
      console.error('Failed to toggle location sharing:', err)
    }
  }

  if (!isLoaded || !isMapLoaded) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]" />
      </div>
    )
  }

  if (loadError) {
    return <div className="text-red-600">Failed to load Google Maps</div>
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please sign in to access location tracking</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Location Sharing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Share your location</p>
              <p className="text-sm text-gray-600">
                Allow other members to see your real-time location. Your preference from onboarding is remembered.
              </p>
            </div>
            <Switch
              checked={isSharingEnabled}
              onCheckedChange={handleLocationSharingToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Map */}
      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              onLoad={onMapLoad}
              options={{ streetViewControl: false, mapTypeControl: false }}
            >
              {locations.map((loc, idx) => (
                <Marker
                  key={loc.id}
                  position={{ lat: loc.latitude, lng: loc.longitude }}
                  onClick={() => setSelectedMarker(loc.id)}
                  label={getUserInitial(loc.user_id === user?.id ? user : null)}
                  icon={getMarkerIcon(getUserInitial(loc.user_id === user?.id ? user : null), loc.user_id === user?.id ? '#ec4899' : '#2B5335')}
                >
                  {selectedMarker === loc.id && (
                    <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                      <div>
                        <strong>{loc.user_id === user?.id ? 'You' : `Member ${idx + 1}`}</strong>
                        <br />
                        <div className="text-sm text-gray-600 mt-1">
                          {addresses.get(`${loc.latitude},${loc.longitude}`) || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(loc.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}
            </GoogleMap>
          </div>
        </CardContent>
      </Card>

      {/* Location List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Member Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {locations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No location data available</p>
            ) : (
              locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2B5335] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getUserInitial(location.user_id === user?.id ? user : null)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {location.user_id === user?.id ? 'You' : 'Member'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addresses.get(`${location.latitude},${location.longitude}`) || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(location.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 