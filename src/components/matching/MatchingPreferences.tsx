'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MatchingSelect, MatchingSelectContent, MatchingSelectItem, MatchingSelectTrigger, MatchingSelectValue } from '@/components/ui/matching-select'
import { 
  Settings, 
  MapPin, 
  Clock, 
  Users,
  Route,
  Save
} from 'lucide-react'
import { useMatchingService, type MatchingPreferences } from '@/services/matching'

const defaultPreferences: MatchingPreferences = {
  max_detour_minutes: 15,
  preferred_group_size: 4,
  driver_preference: 'flexible',
  schedule_flexibility_minutes: 30,
  max_pickup_distance_miles: 5.0,
  min_compatibility_score: 0.7,
  notification_preferences: {
    email: true,
    push: true,
    sms: false
  }
}

export function MatchingPreferences() {
  const [preferences, setPreferences] = useState<MatchingPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const matchingService = useMatchingService()

  const loadPreferences = useCallback(async () => {
    try {
      const data = await matchingService.getPreferences()
      setPreferences(data)
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // Use default preferences for development
      setPreferences(defaultPreferences)
    }
  }, [matchingService])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const handleSave = async () => {
    setLoading(true)
    try {
      await matchingService.updatePreferences(preferences)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (key: keyof MatchingPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const updateNotificationPreference = (key: keyof MatchingPreferences['notification_preferences'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Matching Preferences</h2>
        <p className="text-gray-600">
          Customize how we find your perfect carpool partners
        </p>
      </div>

      <div className="grid gap-6">
        {/* Route Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Route Preferences
            </CardTitle>
            <CardDescription>
              Set your preferences for route flexibility and pickup distance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_detour">Maximum Detour (minutes)</Label>
                <Input
                  id="max_detour"
                  type="number"
                  value={preferences.max_detour_minutes}
                  onChange={(e) => updatePreference('max_detour_minutes', parseInt(e.target.value))}
                  min="5"
                  max="60"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How much extra time you&apos;re willing to spend picking up others
                </p>
              </div>
              
              <div>
                <Label htmlFor="pickup_distance">Maximum Pickup Distance (miles)</Label>
                <Input
                  id="pickup_distance"
                  type="number"
                  step="0.5"
                  value={preferences.max_pickup_distance_miles}
                  onChange={(e) => updatePreference('max_pickup_distance_miles', parseFloat(e.target.value))}
                  min="1"
                  max="20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum distance to travel for pickup
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Preferences
            </CardTitle>
            <CardDescription>
              Set your preferences for carpool group size and role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="group_size">Preferred Group Size</Label>
                <MatchingSelect
                  value={preferences.preferred_group_size.toString()}
                  onValueChange={(value) => updatePreference('preferred_group_size', parseInt(value))}
                >
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    <MatchingSelectItem value="2">2 people</MatchingSelectItem>
                    <MatchingSelectItem value="3">3 people</MatchingSelectItem>
                    <MatchingSelectItem value="4">4 people</MatchingSelectItem>
                    <MatchingSelectItem value="5">5 people</MatchingSelectItem>
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              
              <div>
                <Label htmlFor="driver_preference">Driver Preference</Label>
                <MatchingSelect
                  value={preferences.driver_preference}
                  onValueChange={(value) => updatePreference('driver_preference', value)}
                >
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    <MatchingSelectItem value="driver_only">Driver only</MatchingSelectItem>
                    <MatchingSelectItem value="passenger_only">Passenger only</MatchingSelectItem>
                    <MatchingSelectItem value="flexible">Flexible</MatchingSelectItem>
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule Preferences
            </CardTitle>
            <CardDescription>
              Set your schedule flexibility and compatibility requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flexibility">Schedule Flexibility (minutes)</Label>
                <Input
                  id="flexibility"
                  type="number"
                  value={preferences.schedule_flexibility_minutes}
                  onChange={(e) => updatePreference('schedule_flexibility_minutes', parseInt(e.target.value))}
                  min="0"
                  max="120"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How much your departure time can vary
                </p>
              </div>
              
              <div>
                <Label htmlFor="compatibility">Minimum Compatibility Score</Label>
                <Input
                  id="compatibility"
                  type="number"
                  step="0.1"
                  value={preferences.min_compatibility_score}
                  onChange={(e) => updatePreference('min_compatibility_score', parseFloat(e.target.value))}
                  min="0.1"
                  max="1.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum match quality (0.1 - 1.0)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified about new matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified via email</p>
                </div>
                <Switch
                  checked={preferences.notification_preferences.email}
                  onCheckedChange={(checked) => updateNotificationPreference('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified in the app</p>
                </div>
                <Switch
                  checked={preferences.notification_preferences.push}
                  onCheckedChange={(checked) => updateNotificationPreference('push', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified via text message</p>
                </div>
                <Switch
                  checked={preferences.notification_preferences.sms}
                  onCheckedChange={(checked) => updateNotificationPreference('sms', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
} 