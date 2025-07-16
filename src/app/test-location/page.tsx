'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { iOSLocationUtils, isIOSDevice, LocationCompatibility, Life360LocationUtils, SafariLocationUtils } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, MapPin, Wifi, Download, RefreshCw, Globe, XCircle } from 'lucide-react'

export default function TestLocationPage() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<string>('unknown')
  const [compatibilityInfo, setCompatibilityInfo] = useState<any>(null)
  const [isIOS] = useState(isIOSDevice())
  const [life360Location, setLife360Location] = useState<any>(null)
  const [isLife360Loading, setIsLife360Loading] = useState(false)
  const [showPWAHelp, setShowPWAHelp] = useState(false)
  const [showSafariHelp, setShowSafariHelp] = useState(false)
  const [safariTestResult, setSafariTestResult] = useState<string | null>(null)
  const [isSafari, setIsSafari] = useState(false)
  const [isPWAMode, setIsPWAMode] = useState(false)

  // Check if we're on Safari
  useEffect(() => {
    setIsSafari(SafariLocationUtils.isIOSSafari())
    setIsPWAMode(SafariLocationUtils.isPWAMode())
  }, [])

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

  const testLife360Location = async () => {
    setIsLife360Loading(true)
    setError(null)
    setLife360Location(null)

    try {
      console.log('📍 Testing Life360-style location...')
      const location = await Life360LocationUtils.getLocationWithFallbacks()
      setLife360Location(location)
      console.log('📍 Life360-style location successful:', location)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('📍 Life360-style location failed:', err)
    } finally {
      setIsLife360Loading(false)
    }
  }

  // Safari-specific location test
  const testSafariLocation = async () => {
    setSafariTestResult('Testing Safari location...')
    setError(null)
    
    try {
      console.log('📍 [TEST DEBUG] Starting Safari-specific location test')
      
      // Test Safari permission check
      const permission = await SafariLocationUtils.checkSafariPermission()
      console.log('📍 [TEST DEBUG] Safari permission result:', permission)
      
      if (permission === 'denied') {
        setSafariTestResult('Permission denied. Safari requires user interaction.')
        return
      }
      
      // Test Safari location request
      const position = await SafariLocationUtils.requestSafariLocation()
      
      setSafariTestResult(`✅ Safari location successful! 
        Lat: ${position.coords.latitude.toFixed(6)}
        Lng: ${position.coords.longitude.toFixed(6)}
        Accuracy: ${position.coords.accuracy?.toFixed(0) || 'Unknown'}m`)
      
      // setCurrentLocation({ // This state variable doesn't exist, so this line is commented out
      //   latitude: position.coords.latitude,
      //   longitude: position.coords.longitude,
      //   accuracy: position.coords.accuracy || 0
      // })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setSafariTestResult(`❌ Safari location failed: ${errorMessage}`)
      console.error('📍 [TEST DEBUG] Safari location test failed:', err)
    }
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

        {/* Life360-Style Location Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Life360-Style Location
            </CardTitle>
            <CardDescription>
              Test progressive location requests with fallbacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testLife360Location} 
              disabled={isLife360Loading}
              className="w-full mb-4"
            >
              {isLife360Loading ? 'Testing...' : 'Test Smart Location'}
            </Button>
            
            {life360Location && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="font-medium">{life360Location.source.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latitude:</span>
                  <span className="font-mono">{life360Location.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Longitude:</span>
                  <span className="font-mono">{life360Location.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span>{life360Location.accuracy?.toFixed(1)}m</span>
                </div>
                {life360Location.source === 'ip' && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    ⚠️ Approximate location based on network. For better accuracy, enable GPS.
                  </div>
                )}
              </div>
            )}
            
            {Life360LocationUtils.isPWAInstallable() && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">PWA Installation Available</span>
                </div>
                <p className="text-xs text-green-700 mb-2">
                  Installing as an app may provide better location access on iOS Safari.
                </p>
                <Button 
                  onClick={() => setShowPWAHelp(true)}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Show Instructions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safari-specific testing section */}
        {isSafari && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Safari-Specific Testing
                <Badge variant={isPWAMode ? "default" : "secondary"}>
                  {isPWAMode ? "PWA Mode" : "Browser Mode"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                iOS Safari has unique location permission quirks. This section tests Safari-specific workarounds.
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={testSafariLocation}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Safari Location
                </Button>
                
                <Button 
                  onClick={() => setShowSafariHelp(!showSafariHelp)}
                  variant="outline"
                  size="sm"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Safari Help
                </Button>
              </div>
              
              {safariTestResult && (
                <Alert>
                  <AlertDescription className="whitespace-pre-line">
                    {safariTestResult}
                  </AlertDescription>
                </Alert>
              )}
              
              {showSafariHelp && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">iOS Safari Location Issues:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {SafariLocationUtils.getSafariHelpText().map((text, index) => (
                          <li key={index}>{text}</li>
                        ))}
                      </ul>
                      
                      {!isPWAMode && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="font-semibold text-blue-800">💡 Recommendation:</p>
                          <p className="text-blue-700 text-sm">
                            Install this app as a PWA (Add to Home Screen) for better location access on iOS Safari.
                          </p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

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

      {/* PWA Installation Help Modal */}
      {showPWAHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Install as App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Installing this website as an app can provide better location access on iOS Safari:
                </p>
                <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                  {Life360LocationUtils.getPWAInstallInstructions().map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
                <div className="text-xs text-gray-500 mt-3">
                  <p>After installation, open the app from your home screen for the best experience.</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setShowPWAHelp(false)}
                  variant="outline"
                  size="sm"
                >
                  Got it
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 