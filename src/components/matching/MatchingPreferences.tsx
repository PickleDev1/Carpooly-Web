'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MatchingSelect, MatchingSelectContent, MatchingSelectItem, MatchingSelectTrigger, MatchingSelectValue } from '@/components/ui/matching-select'
import { 
  Settings, 
  Clock, 
  Users,
  Route,
  Save,
  MapPin
} from 'lucide-react'
import { useMatchingService, type MatchingPreferences as Prefs } from '@/services/matching'
import { useToast } from '@/components/ui/toast'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'

const defaults: Prefs = {
  user_id: '',
  max_detour_minutes: 15,
  preferred_group_size: 4,
  driver_preference: 'flexible',
  schedule_flexibility_minutes: 30,
  max_pickup_distance_miles: 5.0,
  min_compatibility_score: 0.7,
  // New required destination fields
  destination_latitude: 0,
  destination_longitude: 0,
  // New optional schedule fields
  arrival_time: undefined,
  commute_days: undefined,
  notification_preferences: { email: true, push: true, sms: false },
  user_demographics: { age_range: '26-35', gender: 'prefer_not_to_say', occupation: '', student_status: 'not_student', company: '' },
  demographic_preferences: { age_preferences: ['18-25','26-35','36-45','46-55','56-65','65+'], gender_preferences: ['any'], student_preference: 'both', occupation_preferences: [] },
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const AGE_RANGES = ['18-25','26-35','36-45','46-55','56-65','65+']
const USER_GENDER_OPTIONS = ['male','female','non-binary','prefer_not_to_say']
const PREF_GENDER_OPTIONS = ['any','male','female','non-binary','prefer_not_to_say']
const USER_STUDENT_STATUS = ['undergraduate','graduate','not_student']
const PREF_STUDENT_OPTIONS = [
  { value: 'both', label: 'Students or professionals' },
  { value: 'students_only', label: 'Students only' },
  { value: 'professionals_only', label: 'Professionals only' }
]

export function MatchingPreferences({ onSaved }: { onSaved?: () => void }) {
  const matching = useMatchingService()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(defaults)
  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const [savedScheduleInfo, setSavedScheduleInfo] = useState<{
    arrivalTime?: string
    commuteDays?: string[]
  }>({})

  const load = useCallback(async () => {
    try {
      const p = await matching.getPreferences()
      setPrefs(p)
      
      // Load saved destination address from localStorage
      const savedAddress = localStorage.getItem('carpooly-saved-destination-address')
      if (savedAddress) {
        setDestinationAddress(savedAddress)
      }
      
      // Load saved schedule info from localStorage
      const savedSchedule = localStorage.getItem('carpooly-saved-schedule')
      if (savedSchedule) {
        try {
          const scheduleData = JSON.parse(savedSchedule)
          setSavedScheduleInfo(scheduleData)
        } catch (err) {
          console.warn('Failed to parse saved schedule data:', err)
        }
      }
      
      // If we have coordinates but no address, try to reverse geocode
      if (p.destination_latitude && p.destination_latitude !== 0 && 
          p.destination_longitude && p.destination_longitude !== 0) {
        try {
          const geocoder = new window.google.maps.Geocoder()
          const result = await geocoder.geocode({
            location: { lat: p.destination_latitude, lng: p.destination_longitude }
          })
          if (result.results && result.results[0]) {
            setDestinationAddress(result.results[0].formatted_address)
          }
        } catch (err) {
          console.warn('Failed to reverse geocode destination:', err)
        }
      }
    } catch {
      setPrefs(defaults)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setLoading(true)
    try {
      console.log('💾 Saving preferences:', prefs)
      console.log('📍 Destination coordinates being saved:', { 
        lat: prefs.destination_latitude, 
        lng: prefs.destination_longitude 
      })
      await matching.updatePreferences(prefs)
      
      // Save destination address to localStorage
      if (destinationAddress) {
        localStorage.setItem('carpooly-saved-destination-address', destinationAddress)
      }
      
      // Save schedule info to localStorage
      const scheduleData = {
        arrivalTime: prefs.arrival_time,
        commuteDays: prefs.commute_days
      }
      localStorage.setItem('carpooly-saved-schedule', JSON.stringify(scheduleData))
      setSavedScheduleInfo(scheduleData)
      
      setSaved(true)
      showToast('Preferences saved successfully')
      onSaved?.()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('❌ Error saving preferences:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      showToast(`Failed to save preferences: ${errorMessage}`)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = (key: keyof Prefs, value: any) => setPrefs((prev: Prefs) => ({ ...prev, [key]: value }))
  const updateNotif = (key: keyof Prefs['notification_preferences'], value: boolean) => setPrefs((prev: Prefs) => ({ ...prev, notification_preferences: { ...prev.notification_preferences, [key]: value } }))

  const updateUserDemo = (key: keyof Prefs['user_demographics'], value: any) => setPrefs((prev: Prefs) => ({ ...prev, user_demographics: { ...prev.user_demographics, [key]: value } }))
  const toggleArrayPref = (key: keyof Prefs['demographic_preferences'], value: string) => setPrefs((prev: Prefs) => {
    const current = (prev.demographic_preferences?.[key] as string[]) || []
    const exists = current.includes(value)
    const next = exists ? current.filter(v => v !== value) : [...current, value]
    return { ...prev, demographic_preferences: { ...prev.demographic_preferences, [key]: next } }
  })
  const updateDemoPref = (key: keyof Prefs['demographic_preferences'], value: any) => setPrefs((prev: Prefs) => ({ ...prev, demographic_preferences: { ...prev.demographic_preferences, [key]: value } }))

  const handleDestinationSelect = (location: { address: string; lat: number; lng: number }) => {
    setDestinationAddress(location.address)
    setPrefs((prev: Prefs) => ({
      ...prev,
      destination_latitude: location.lat,
      destination_longitude: location.lng
    }))
  }

  const formatCommuteDays = (days: string[]) => {
    if (!days || days.length === 0) return 'None selected'
    const dayNames = {
      'mon': 'Monday',
      'tue': 'Tuesday', 
      'wed': 'Wednesday',
      'thu': 'Thursday',
      'fri': 'Friday',
      'sat': 'Saturday',
      'sun': 'Sunday'
    }
    return days.map(day => dayNames[day as keyof typeof dayNames] || day).join(', ')
  }

  const formatArrivalTime = (time: string) => {
    if (!time) return 'Not set'
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Matching Preferences</h2>
        <p className="text-gray-600">Customize how we find your perfect carpool partners</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Route Preferences
            </CardTitle>
            <CardDescription>Set your preferences for route flexibility and pickup distance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_detour">Maximum Detour (minutes)</Label>
                <Input id="max_detour" type="number" value={prefs.max_detour_minutes} onChange={(e) => update('max_detour_minutes', parseInt(e.target.value))} min={0} max={60} />
                <p className="text-xs text-gray-500 mt-1">How much extra time you&apos;re willing to spend picking up others</p>
              </div>
              <div>
                <Label htmlFor="pickup_distance">Maximum Pickup Distance (miles)</Label>
                <Input id="pickup_distance" type="number" step="0.5" value={prefs.max_pickup_distance_miles} onChange={(e) => update('max_pickup_distance_miles', parseFloat(e.target.value))} min={0} max={25} />
                <p className="text-xs text-gray-500 mt-1">Maximum distance to travel for pickup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Destination (Required)
            </CardTitle>
            <CardDescription>Set your work destination to find compatible carpool partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="destination_address">Work Destination Address</Label>
              <AddressAutocomplete
                onSelect={handleDestinationSelect}
                placeholder="Enter your work address (e.g., 123 Main St, San Francisco, CA)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Start typing to search for your work address</p>
            </div>
            {destinationAddress && (
              <div className="p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {destinationAddress}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Coordinates: {prefs.destination_latitude.toFixed(6)}, {prefs.destination_longitude.toFixed(6)}
                </p>
              </div>
            )}
            {!destinationAddress && (prefs.destination_latitude !== 0 || prefs.destination_longitude !== 0) && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Saved Destination:</strong> Coordinates are set but address not available
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Coordinates: {prefs.destination_latitude.toFixed(6)}, {prefs.destination_longitude.toFixed(6)}
                </p>
              </div>
            )}
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Destination is required to find carpool matches. 
                The address will be automatically converted to coordinates for matching.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule (Optional)
            </CardTitle>
            <CardDescription>Set your commute schedule for better matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show saved schedule info if available */}
            {(savedScheduleInfo.arrivalTime || savedScheduleInfo.commuteDays?.length) && (
              <div className="p-3 bg-gray-50 rounded-md mb-4">
                <p className="text-sm font-medium text-gray-800 mb-2">Your Saved Schedule:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Arrival Time:</strong> {formatArrivalTime(savedScheduleInfo.arrivalTime || '')}</p>
                  <p><strong>Commute Days:</strong> {formatCommuteDays(savedScheduleInfo.commuteDays || [])}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">You can edit these settings below</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrival_time">Arrival Time</Label>
                <Input 
                  id="arrival_time" 
                  type="time" 
                  value={prefs.arrival_time || ''} 
                  onChange={(e) => update('arrival_time', e.target.value || undefined)} 
                />
                <p className="text-xs text-gray-500 mt-1">When you typically arrive at work</p>
              </div>
              <div>
                <Label htmlFor="commute_days">Commute Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['mon','tue','wed','thu','fri','sat','sun'].map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={prefs.commute_days?.includes(day) || false}
                        onChange={(e) => {
                          const current = prefs.commute_days || []
                          const updated = e.target.checked 
                            ? [...current, day]
                            : current.filter(d => d !== day)
                          update('commute_days', updated.length > 0 ? updated : undefined)
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{day}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select your regular commute days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group & Role Preferences
            </CardTitle>
            <CardDescription>Set your preferences for carpool group size and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="group_size">Preferred Group Size</Label>
                <MatchingSelect value={prefs.preferred_group_size.toString()} onValueChange={(v) => update('preferred_group_size', parseInt(v))}>
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    {[1,2,3,4,5,6].map(n => (
                      <MatchingSelectItem key={n} value={String(n)}>{n} {n === 1 ? 'person' : 'people'}</MatchingSelectItem>
                    ))}
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              <div>
                <Label htmlFor="driver_preference">Driver Preference</Label>
                <MatchingSelect value={prefs.driver_preference} onValueChange={(v) => update('driver_preference', v)}>
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    <MatchingSelectItem value="driver">Driver</MatchingSelectItem>
                    <MatchingSelectItem value="passenger">Passenger</MatchingSelectItem>
                    <MatchingSelectItem value="flexible">Flexible</MatchingSelectItem>
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">About You</CardTitle>
            <CardDescription>Basic information to help us find compatible matches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Age Range</Label>
                <MatchingSelect value={prefs.user_demographics.age_range} onValueChange={(v) => updateUserDemo('age_range', v)}>
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    {AGE_RANGES.map(r => (<MatchingSelectItem key={r} value={r}>{r}</MatchingSelectItem>))}
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              <div>
                <Label>Gender</Label>
                <MatchingSelect value={prefs.user_demographics.gender} onValueChange={(v) => updateUserDemo('gender', v)}>
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    {USER_GENDER_OPTIONS.map(g => (<MatchingSelectItem key={g} value={g}>{g}</MatchingSelectItem>))}
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              <div>
                <Label>Occupation (optional)</Label>
                <Input value={prefs.user_demographics.occupation} onChange={(e) => updateUserDemo('occupation', e.target.value)} placeholder="e.g., Software Engineer" />
              </div>
              <div className="md:col-span-2">
                <Label>Company (optional)</Label>
                <Input value={prefs.user_demographics.company} onChange={(e) => updateUserDemo('company', e.target.value)} placeholder="e.g., Acme Corp" />
              </div>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose how you want to be notified about new matches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified via email</p>
                </div>
                <Switch checked={prefs.notification_preferences.email} onCheckedChange={(c) => updateNotif('email', c)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified in the app</p>
                </div>
                <Switch checked={prefs.notification_preferences.push} onCheckedChange={(c) => updateNotif('push', c)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified via text message</p>
                </div>
                <Switch checked={prefs.notification_preferences.sms} onCheckedChange={(c) => updateNotif('sms', c)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={loading} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
} 