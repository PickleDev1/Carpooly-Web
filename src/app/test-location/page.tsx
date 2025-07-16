'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { iOSLocationUtils } from '@/lib/utils'

export default function TestLocationPage() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<string>('unknown')

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

  const testNativeGeolocation = async () => {
    setIsLoading(true)
    setError(null)
    setLocation(null)

    try {
      console.log('📍 Testing native geolocation...')
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(new Error(err.message)),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        )
      })

      setLocation(position)
      console.log('📍 Native geolocation successful:', position)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('📍 Native geolocation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Location Test Page</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Device Info</CardTitle>
            <CardDescription>Current device and browser information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Server side'}</div>
              <div><strong>Geolocation Supported:</strong> {typeof window !== 'undefined' && navigator.geolocation ? 'Yes' : 'No'}</div>
              <div><strong>Permissions API:</strong> {typeof window !== 'undefined' && navigator.permissions ? 'Yes' : 'No'}</div>
              <div><strong>HTTPS:</strong> {typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost') ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission Status</CardTitle>
            <CardDescription>Current location permission status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div><strong>Current Permission:</strong> {permission}</div>
              <Button onClick={checkPermission} variant="outline">
                Check Permission
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Tests</CardTitle>
            <CardDescription>Test different location request methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testBasicLocation} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Basic Location (via utils)'}
              </Button>
              
              <Button 
                onClick={testNativeGeolocation} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Native Geolocation'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {location && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Location Success</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Latitude:</strong> {location.coords.latitude}</div>
                <div><strong>Longitude:</strong> {location.coords.longitude}</div>
                <div><strong>Accuracy:</strong> {location.coords.accuracy} meters</div>
                <div><strong>Timestamp:</strong> {new Date(location.timestamp).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 