'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"
import { Settings, MapPin, Shield, Info } from 'lucide-react'
import { LocationSettings as LocationSettingsType } from '@/types/api'

export function LocationSettings() {
  const [settings, setSettings] = useState<LocationSettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [homeAddress, setHomeAddress] = useState<string>('')
  const [homeLatitude, setHomeLatitude] = useState<string>('')
  const [homeLongitude, setHomeLongitude] = useState<string>('')
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false)

  const api = useApi()
  const { user, isLoaded } = useUser()

  // Fetch current settings
  useEffect(() => {
    // Don't fetch if user is not loaded yet
    if (!isLoaded || !user) return

    const fetchSettings = async () => {
      try {
        const currentSettings = await api.getLocationSettings()
        setSettings(currentSettings)
        setLocationSharingEnabled(currentSettings.location_sharing_enabled)
        setHomeLatitude(currentSettings.home_latitude?.toString() || '')
        setHomeLongitude(currentSettings.home_longitude?.toString() || '')
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to fetch location settings:', err)
        setError('Failed to load location settings')
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [api, isLoaded, user])

  const handleAddressSelect = (locationData: { address: string; lat: number; lng: number }) => {
    setHomeAddress(locationData.address)
    setHomeLatitude(locationData.lat.toString())
    setHomeLongitude(locationData.lng.toString())
  }

  // Show loading if user is not loaded yet
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  // Show error if user is not signed in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Please sign in to access location settings</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const lat = homeLatitude ? parseFloat(homeLatitude) : undefined
      const lng = homeLongitude ? parseFloat(homeLongitude) : undefined

      await api.updateLocationSettings(locationSharingEnabled, lat, lng)
      
      setSuccess('Location settings updated successfully')
      setSettings(prev => prev ? {
        ...prev,
        location_sharing_enabled: locationSharingEnabled,
        home_latitude: lat,
        home_longitude: lng
      } : null)
    } catch (err) {
      console.error('Failed to update location settings:', err)
      setError('Failed to update location settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHomeLatitude(position.coords.latitude.toString())
        setHomeLongitude(position.coords.longitude.toString())
        setSuccess('Current location set as home location')
      },
      (error) => {
        console.error('Geolocation error:', error)
        setError('Failed to get current location')
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Privacy & Security</h3>
              <p className="text-sm text-blue-700">
                Your location data is only shared with carpool members when you enable location sharing 
                and are actively participating in a ride. You can disable location sharing at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Sharing Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable location sharing</p>
              <p className="text-sm text-gray-600">
                Allow other carpool members to see your location during rides
              </p>
            </div>
            <Switch
              checked={locationSharingEnabled}
              onCheckedChange={setLocationSharingEnabled}
            />
          </div>
          
          {locationSharingEnabled && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Info className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-medium">Location sharing is enabled</p>
                <p>Your location will be shared with carpool members when you participate in rides.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Home Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Home Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Set your home location for better carpool matching and route planning.
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <AddressAutocomplete
                onSelect={handleAddressSelect}
                placeholder="Enter your home address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 37.7749"
                  value={homeLatitude}
                  onChange={(e) => setHomeLatitude(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -122.4194"
                  value={homeLongitude}
                  onChange={(e) => setHomeLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGetCurrentLocation}
            className="w-full md:w-auto"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Use Current Location
          </Button>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
} 