'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { iOSLocationUtils, isIOSDevice, LocationCompatibility } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, MapPin } from 'lucide-react'

export default function TestLocationPage() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<string>('unknown')
  const [compatibilityInfo, setCompatibilityInfo] = useState<any>(null)
  const [isIOS] = useState(isIOSDevice())

  const testBasicLocation = async () => {
    setIsLoading(true)
    setError(null)
    setLocation(null)

    try {
      console.log('📍 Testing basic geolocation...')
      const position = await iOSLocationUtils.requestLocation()
      setLocation(position)
      console.log('📍 Basic geolocation successful:', position)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('📍 Basic geolocation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPermission = async () => {
    try {
      const perm = await iOSLocationUtils.checkLocationPermission()
      setPermission(perm)
      console.log('📍 Permission check result:', perm)
    } catch (err) {
      console.error('📍 Permission check failed:', err)
      setPermission('error')
    }
  }

  const checkCompatibility = () => {
    const info = LocationCompatibility.getCompatibilityInfo()
    setCompatibilityInfo(info)
    console.log('📍 Compatibility info:', info)
  }

  const getPermissionStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'text-green-600'
      case 'denied': return 'text-red-600'
      case 'prompt': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getPermissionStatusIcon = (status: string) => {
    switch (status) {
      case 'granted': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'denied': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'prompt': return <Info className="h-5 w-5 text-yellow-600" />
      default: return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Location Testing Tool</h1>
        <p className="text-gray-600">
          Use this page to test and troubleshoot location permissions on your device.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Device Compatibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Device Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkCompatibility} className="w-full mb-4">
              Check Compatibility
            </Button>
            {compatibilityInfo && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Geolocation Supported:</span>
                  <span className={compatibilityInfo.geolocationSupported ? 'text-green-600' : 'text-red-600'}>
                    {compatibilityInfo.geolocationSupported ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Permissions API:</span>
                  <span className={compatibilityInfo.permissionsSupported ? 'text-green-600' : 'text-red-600'}>
                    {compatibilityInfo.permissionsSupported ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>HTTPS/SSL:</span>
                  <span className={compatibilityInfo.isHTTPS ? 'text-green-600' : 'text-red-600'}>
                    {compatibilityInfo.isHTTPS ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>iOS Device:</span>
                  <span className={compatibilityInfo.isIOS ? 'text-blue-600' : 'text-gray-600'}>
                    {compatibilityInfo.isIOS ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Device:</span>
                  <span className={compatibilityInfo.isMobile ? 'text-blue-600' : 'text-gray-600'}>
                    {compatibilityInfo.isMobile ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Permission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkPermission} className="w-full mb-4">
              Check Permission
            </Button>
            {permission !== 'unknown' && (
              <div className="flex items-center gap-2 mb-4">
                {getPermissionStatusIcon(permission)}
                <span className={`font-medium ${getPermissionStatusColor(permission)}`}>
                  {permission.toUpperCase()}
                </span>
              </div>
            )}
            {permission === 'denied' && isIOS && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <p className="font-medium mb-2">iOS Safari Permission Issue</p>
                <p>On iOS Safari, try these steps:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Settings → Safari → Location → Set to &quot;Ask&quot;</li>
                  <li>Settings → Privacy & Security → Location Services → Safari → &quot;While Using&quot;</li>
                  <li>Close Safari completely and reopen</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Test */}
        <Card>
          <CardHeader>
            <CardTitle>Location Test</CardTitle>
            <CardDescription>
              Test if location requests work on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testBasicLocation} 
              disabled={isLoading}
              className="w-full mb-4"
            >
              {isLoading ? 'Testing...' : 'Test Location Request'}
            </Button>
            
            {location && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Latitude:</span>
                  <span className="font-mono">{location.coords.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Longitude:</span>
                  <span className="font-mono">{location.coords.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span>{location.coords.accuracy?.toFixed(1)}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span>{new Date(location.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Common Issues:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Browser location permissions not set</li>
                  <li>Device location services disabled</li>
                  <li>iOS Safari specific permission quirks</li>
                  <li>Network connectivity issues</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">Quick Fixes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Refresh the page</li>
                  <li>Check browser settings</li>
                  <li>Enable device location services</li>
                  <li>Try a different browser</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 