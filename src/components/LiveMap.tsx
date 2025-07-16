'use client'

import { useLocationTracking } from '@/hooks/useLocationTracking'
import { useUser } from '@clerk/nextjs'
import { useApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MapPin, Users, Settings, AlertTriangle, Info, Download, Wifi } from 'lucide-react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { reverseGeocodeWithCache, isIOSDevice, Life360LocationUtils } from '@/lib/utils'

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
  const api = useApi()
  const {
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
  } = useLocationTracking({ rideId })

  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<Map<string, string>>(new Map())
  const [showIOSHelp, setShowIOSHelp] = useState(false)
  const [showPWAHelp, setShowPWAHelp] = useState(false)
  const [locationSource, setLocationSource] = useState<'gps' | 'ip' | 'manual' | null>(null)

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

  // Display coordinates as provided by backend (no reverse geocoding)
  useEffect(() => {
    const newAddresses = new Map<string, string>()
    
    for (const location of locations) {
      const locationKey = `${location.latitude},${location.longitude}`
      // Just display coordinates as provided by backend
      newAddresses.set(locationKey, `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)
    }
    
    setAddresses(newAddresses)
  }, [locations])

  const handleLocationSharingToggle = async (enabled: boolean) => {
    console.log('📍 [LIVEMAP DEBUG] User toggled location sharing to:', enabled, 'at:', new Date().toISOString())
    console.log('📍 [LIVEMAP DEBUG] Current state before toggle:', {
      isSharingEnabled,
      permissionState,
      error,
      isIOS,
      isCompatible
    })
    try {
      await toggleLocationSharing(enabled)
      console.log('📍 [LIVEMAP DEBUG] Toggle completed successfully')
    } catch (err) {
      console.error('📍 [LIVEMAP DEBUG] Failed to toggle location sharing:', err)
      console.log('📍 [LIVEMAP DEBUG] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        type: typeof err,
        stack: err instanceof Error ? err.stack : undefined
      })
    }
  }

  // Manual location request handler
  const handleManualLocationRequest = async () => {
    console.log('📍 [LIVEMAP DEBUG] Manual location request triggered by user at:', new Date().toISOString())
    console.log('📍 [LIVEMAP DEBUG] Current state before request:', {
      isSharingEnabled,
      permissionState,
      error,
      isIOS
    })
    try {
      // Use the standard location request function
      await requestLocation()
      console.log('📍 [LIVEMAP DEBUG] Manual location request completed successfully')
    } catch (err) {
      console.error('📍 [LIVEMAP DEBUG] Manual location request failed:', err)
      console.log('📍 [LIVEMAP DEBUG] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        type: typeof err,
        stack: err instanceof Error ? err.stack : undefined
      })
    }
  }

  // Life360-style location request with fallbacks
  const handleLife360LocationRequest = async () => {
    console.log('📍 [LIVEMAP DEBUG] Life360-style location request triggered')
    
    try {
      const location = await Life360LocationUtils.getLocationWithFallbacks()
      setLocationSource(location.source)
      
      console.log('📍 [LIVEMAP DEBUG] Location obtained via Life360 method:', {
        source: location.source,
        accuracy: location.accuracy,
        coordinates: { lat: location.latitude, lng: location.longitude }
      })
      
      // Update location via API if sharing is enabled
      if (isSharingEnabled) {
        await api.updateUserLocation(rideId, location.latitude, location.longitude)
        console.log('📍 [LIVEMAP DEBUG] Location updated via API')
      }
      
      // Show success message based on source
      const sourceMessages = {
        gps: 'GPS location obtained successfully!',
        ip: 'Approximate location obtained from your network. For better accuracy, try enabling GPS.',
        manual: 'Location set manually.'
      }
      
      // You could show a toast notification here
      console.log('📍 [LIVEMAP DEBUG] Success:', sourceMessages[location.source])
      
    } catch (err) {
      console.error('📍 [LIVEMAP DEBUG] Life360 location request failed:', err)
      console.log('📍 [LIVEMAP DEBUG] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        type: typeof err,
        stack: err instanceof Error ? err.stack : undefined
      })
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

  return (
    <div className="space-y-4">
      {/* Device Compatibility Warning */}
      {!isCompatible && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-2">Location Tracking Not Supported</h3>
                <p className="text-sm text-red-700 mb-3">
                  Your device or browser doesn&apos;t support location tracking. This could be due to:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>Using an older browser that doesn&apos;t support geolocation</li>
                  <li>Not using HTTPS (required for location access)</li>
                  <li>Browser security settings blocking location access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Access Help Banner */}
      {isSharingEnabled && permissionState === 'prompt' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900 mb-2">Location Access Required</h3>
                <p className="text-sm text-orange-700 mb-3">
                  To share your location, you need to allow location access when prompted. 
                  If you don&apos;t see a prompt, tap the button below to request location access.
                </p>
                <Button 
                  onClick={handleManualLocationRequest}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Request Location Access
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* iOS Permission Denied Warning */}
      {isIOS && permissionState === 'denied' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-2">Location Access Denied on iOS</h3>
                <p className="text-sm text-red-700 mb-3">
                  Location access has been denied. On iOS Safari, this can happen even when permissions appear to be granted. Here&apos;s how to fix it:
                </p>
                <ol className="text-sm text-red-700 list-decimal list-inside space-y-1">
                  <li>Go to <strong>Settings → Safari → Location</strong></li>
                  <li>Select <strong>&quot;Ask&quot;</strong> or <strong>&quot;Allow&quot;</strong> for this website</li>
                  <li>Go to <strong>Settings → Privacy & Security → Location Services</strong></li>
                  <li>Ensure <strong>Safari</strong> is set to <strong>&quot;While Using&quot;</strong></li>
                  <li>Close Safari completely (swipe up and swipe away)</li>
                  <li>Reopen Safari and refresh this page</li>
                </ol>
                <div className="mt-3">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Issue Warning */}
      {isSharingEnabled && error && (error.includes('denied') || error.includes('Permission denied')) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900 mb-2">Location Permission Issue</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Location access appears to be denied. This can happen when browser permissions aren&apos;t properly configured or when there are temporary permission sync issues.
                </p>
                <div className="text-sm text-yellow-700 mb-3">
                  <p className="font-medium">To enable real-time location tracking:</p>
                  <ol className="list-decimal list-inside space-y-1 space-y-1">
                    <li>Check your browser&apos;s location settings</li>
                    <li>Ensure this website is set to &quot;Allow&quot; location access</li>
                    <li>Toggle location sharing off and on again</li>
                    <li>Close and reopen your browser</li>
                    <li>Refresh this page and try again</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleManualLocationRequest}
                    variant="outline"
                    size="sm"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    Try Real-Time Location
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Life360-style Location Request */}
      {isIOS && permissionState === 'denied' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Wifi className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Try Life360-Style Location</h3>
                <p className="text-sm text-blue-700 mb-3">
                  We can try to get your location using multiple methods, similar to how Life360 works:
                </p>
                <div className="text-sm text-blue-700 mb-3">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>First, try GPS with gentle permission request</li>
                    <li>If that fails, use your network location (approximate)</li>
                    <li>Finally, allow manual location entry</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleLife360LocationRequest}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Try Smart Location
                  </Button>
                  {Life360LocationUtils.isPWAInstallable() && (
                    <Button 
                      onClick={() => setShowPWAHelp(true)}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Install App
                    </Button>
                  )}
                </div>
                {locationSource && (
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                    <strong>Location Source:</strong> {locationSource.toUpperCase()}
                    {locationSource === 'ip' && ' (approximate)'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PWA Installation Help */}
      {showPWAHelp && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 mb-2">Install as App for Better Location Access</h3>
                <p className="text-sm text-green-700 mb-3">
                  Installing this website as an app can provide better location access on iOS Safari:
                </p>
                <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
                  {Life360LocationUtils.getPWAInstallInstructions().map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
                <div className="mt-3">
                  <Button 
                    onClick={() => setShowPWAHelp(false)}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Sharing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share your location</p>
                <p className="text-sm text-gray-600">
                  Allow other members to see your real-time location. Your preference from onboarding is remembered.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isSharingEnabled}
                  onCheckedChange={handleLocationSharingToggle}
                  disabled={isToggleLoading}
                />
                {isToggleLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2B5335]" />
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Location Tracking</p>
                <p>Real-time location tracking requires explicit permission from your browser. The app will only use real-time location when permission is properly granted. Your location is only shared with other carpool participants.</p>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Location Error</p>
                  <p>{error}</p>
                  <div className="mt-2 space-y-2">
                    <Button 
                      onClick={handleManualLocationRequest}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Try Again
                    </Button>
                    <div className="text-xs text-red-600">
                      <p>If you&apos;ve set location to &quot;Allow&quot; in your browser settings:</p>
                      <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>Try toggling location sharing off and on</li>
                        <li>If the toggle gets stuck, refresh the page and try again</li>
                        <li>Check that Location Services are enabled on your device</li>
                        {isIOS && (
                          <>
                            <li>On iOS: Go to <strong>Settings → Safari → Location</strong> and set to <strong>&quot;Ask&quot;</strong></li>
                            <li>Also check <strong>Settings → Privacy & Security → Location Services → Safari</strong></li>
                          </>
                        )}
                        <li>Try closing and reopening your browser</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
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