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
  notification_preferences: {
    email: true,
    push: true,
    sms: false
  },
  user_demographics: {
    age_range: '26-35',
    gender: 'prefer_not_to_say',
    occupation: '',
    student_status: 'not_student',
    company: ''
  },
  demographic_preferences: {
    age_preferences: ['18-25', '26-35', '36-45', '46-55'],
    gender_preferences: ['any'],
    student_preference: 'both',
    occupation_preferences: []
  }
}

export function MatchingPreferences() {
  const [preferences, setPreferences] = useState<MatchingPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  console.log('🔧 MatchingPreferences render - preferences state:', preferences)
  
  const matchingService = useMatchingService()

  const loadPreferences = useCallback(async () => {
    try {
      const data = await matchingService.getPreferences()
      // Merge with default preferences to ensure all new fields exist
      const mergedPreferences = {
        ...defaultPreferences,
        ...data,
        // Ensure new demographic fields exist
        user_demographics: {
          ...defaultPreferences.user_demographics,
          ...(data.user_demographics || {})
        },
        demographic_preferences: {
          ...defaultPreferences.demographic_preferences,
          ...(data.demographic_preferences || {})
        }
      }
      setPreferences(mergedPreferences)
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // Use default preferences for development
      setPreferences(defaultPreferences)
    }
  }, [])

  useEffect(() => {
    console.log('🔧 MatchingPreferences component mounted')
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
    console.log('🔧 updatePreference called with:', { key, value, type: typeof value })
    setPreferences(prev => {
      console.log('🔧 Previous state:', prev)
      const newState = { ...prev, [key]: value }
      console.log('🔧 New state after updatePreference:', newState)
      return newState
    })
  }

  const updateNestedPreference = (parentKey: keyof MatchingPreferences, childKey: string, value: any) => {
    console.log('🔧 updateNestedPreference called with:', { parentKey, childKey, value, type: typeof value })
    setPreferences(prev => {
      console.log('🔧 Previous state for nested update:', prev)
      const currentParent = prev[parentKey] as any || {}
      console.log('🔧 Current parent object:', currentParent)
      const newState = {
        ...prev,
        [parentKey]: {
          ...currentParent,
          [childKey]: value
        }
      }
      console.log('🔧 New state after updateNestedPreference:', newState)
      return newState
    })
  }

  const updateNotificationPreference = (key: keyof MatchingPreferences['notification_preferences'], value: boolean) => {
    console.log('🔧 updateNotificationPreference called with:', { key, value })
    setPreferences(prev => {
      console.log('🔧 Previous state for notification update:', prev)
      const newState = {
        ...prev,
        notification_preferences: {
          ...prev.notification_preferences,
          [key]: value
        }
      }
      console.log('🔧 New state after updateNotificationPreference:', newState)
      return newState
    })
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
                  onChange={(e) => {
                    console.log('🔧 max_detour onChange triggered:', e.target.value)
                    updatePreference('max_detour_minutes', parseInt(e.target.value))
                  }}
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
                  onChange={(e) => {
                    console.log('🔧 max_pickup_distance onChange triggered:', e.target.value)
                    updatePreference('max_pickup_distance_miles', parseFloat(e.target.value))
                  }}
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
                  onValueChange={(value) => {
                    console.log('🔧 preferred_group_size onValueChange triggered:', value)
                    updatePreference('preferred_group_size', parseInt(value))
                  }}
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
                  onValueChange={(value) => {
                    console.log('🔧 driver_preference onValueChange triggered:', value)
                    updatePreference('driver_preference', value)
                  }}
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
              Set your schedule flexibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="flexibility">Schedule Flexibility (minutes)</Label>
              <Input
                id="flexibility"
                type="number"
                value={preferences.schedule_flexibility_minutes}
                onChange={(e) => {
                  console.log('🔧 schedule_flexibility onChange triggered:', e.target.value)
                  updatePreference('schedule_flexibility_minutes', parseInt(e.target.value))
                }}
                min="0"
                max="120"
              />
              <p className="text-xs text-gray-500 mt-1">
                How much your departure time can vary
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Demographics
            </CardTitle>
            <CardDescription>
              Tell us about yourself to help with matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age_range">Age Range</Label>
                <MatchingSelect
                  value={preferences.user_demographics?.age_range || '26-35'}
                  onValueChange={(value) => {
                    console.log('🔧 user_demographics age_range onValueChange triggered:', value)
                    updateNestedPreference('user_demographics', 'age_range', value)
                  }}
                >
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    <MatchingSelectItem value="18-25">18-25</MatchingSelectItem>
                    <MatchingSelectItem value="26-35">26-35</MatchingSelectItem>
                    <MatchingSelectItem value="36-45">36-45</MatchingSelectItem>
                    <MatchingSelectItem value="46-55">46-55</MatchingSelectItem>
                    <MatchingSelectItem value="56-65">56-65</MatchingSelectItem>
                    <MatchingSelectItem value="65+">65+</MatchingSelectItem>
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <MatchingSelect
                  value={preferences.user_demographics?.gender || 'prefer_not_to_say'}
                  onValueChange={(value) => {
                    console.log('🔧 user_demographics gender onValueChange triggered:', value)
                    updateNestedPreference('user_demographics', 'gender', value)
                  }}
                >
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    <MatchingSelectItem value="male">Male</MatchingSelectItem>
                    <MatchingSelectItem value="female">Female</MatchingSelectItem>
                    <MatchingSelectItem value="non-binary">Non-binary</MatchingSelectItem>
                    <MatchingSelectItem value="prefer_not_to_say">Prefer not to say</MatchingSelectItem>
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={preferences.user_demographics?.occupation || ''}
                  onChange={(e) => {
                    console.log('🔧 user_demographics occupation onChange triggered:', e.target.value)
                    updateNestedPreference('user_demographics', 'occupation', e.target.value)
                  }}
                  placeholder="e.g., Software Engineer, Student, Teacher"
                />
              </div>
              
              <div>
                <Label htmlFor="student_status">Student Status</Label>
                <MatchingSelect
                  value={preferences.user_demographics?.student_status || 'not_student'}
                  onValueChange={(value) => {
                    console.log('🔧 user_demographics student_status onValueChange triggered:', value)
                    updateNestedPreference('user_demographics', 'student_status', value)
                  }}
                >
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    <MatchingSelectItem value="undergraduate">Undergraduate Student</MatchingSelectItem>
                    <MatchingSelectItem value="graduate">Graduate Student</MatchingSelectItem>
                    <MatchingSelectItem value="not_student">Not a Student</MatchingSelectItem>
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="company">Company/Institution (Optional)</Label>
                <Input
                  id="company"
                  value={preferences.user_demographics?.company || ''}
                  onChange={(e) => {
                    console.log('🔧 user_demographics company onChange triggered:', e.target.value)
                    updateNestedPreference('user_demographics', 'company', e.target.value)
                  }}
                  placeholder="e.g., Google, Stanford University"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demographic Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Demographic Preferences
            </CardTitle>
            <CardDescription>
              What demographics are you comfortable carpooling with?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Age Preferences</Label>
                <div className="space-y-2 mt-2">
                  {(['18-25', '26-35', '36-45', '46-55', '56-65', '65+'] as const).map((age) => (
                    <div key={age} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`age-${age}`}
                        checked={preferences.demographic_preferences?.age_preferences?.includes(age) || false}
                        onChange={(e) => {
                          console.log('🔧 age preference checkbox onChange triggered:', { age, checked: e.target.checked })
                          const currentPreferences = preferences.demographic_preferences?.age_preferences || []
                          const newPreferences = e.target.checked
                            ? [...currentPreferences, age]
                            : currentPreferences.filter(a => a !== age)
                          console.log('🔧 age preferences before update:', currentPreferences)
                          console.log('🔧 age preferences after update:', newPreferences)
                          updateNestedPreference('demographic_preferences', 'age_preferences', newPreferences)
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`age-${age}`} className="text-sm">{age}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Gender Preferences</Label>
                <div className="space-y-2 mt-2">
                  {(['male', 'female', 'non-binary', 'any'] as const).map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`gender-${gender}`}
                        checked={preferences.demographic_preferences?.gender_preferences?.includes(gender) || false}
                        onChange={(e) => {
                          console.log('🔧 gender preference checkbox onChange triggered:', { gender, checked: e.target.checked })
                          const currentPreferences = preferences.demographic_preferences?.gender_preferences || []
                          const newPreferences = e.target.checked
                            ? [...currentPreferences, gender]
                            : currentPreferences.filter(g => g !== gender)
                          console.log('🔧 gender preferences before update:', currentPreferences)
                          console.log('🔧 gender preferences after update:', newPreferences)
                          updateNestedPreference('demographic_preferences', 'gender_preferences', newPreferences)
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`gender-${gender}`} className="text-sm capitalize">{gender}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="student_preference">Student Preference</Label>
                <MatchingSelect
                  value={preferences.demographic_preferences?.student_preference || 'both'}
                  onValueChange={(value) => {
                    console.log('🔧 demographic_preferences student_preference onValueChange triggered:', value)
                    updateNestedPreference('demographic_preferences', 'student_preference', value)
                  }}
                >
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    <MatchingSelectItem value="students_only">Students Only</MatchingSelectItem>
                    <MatchingSelectItem value="professionals_only">Professionals Only</MatchingSelectItem>
                    <MatchingSelectItem value="both">Both Students and Professionals</MatchingSelectItem>
                  </MatchingSelectContent>
                </MatchingSelect>
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
                  onCheckedChange={(checked) => {
                    console.log('🔧 notification email onCheckedChange triggered:', checked)
                    updateNotificationPreference('email', checked)
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified in the app</p>
                </div>
                <Switch
                  checked={preferences.notification_preferences.push}
                  onCheckedChange={(checked) => {
                    console.log('🔧 notification push onCheckedChange triggered:', checked)
                    updateNotificationPreference('push', checked)
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified via text message</p>
                </div>
                <Switch
                  checked={preferences.notification_preferences.sms}
                  onCheckedChange={(checked) => {
                    console.log('🔧 notification sms onCheckedChange triggered:', checked)
                    updateNotificationPreference('sms', checked)
                  }}
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