'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle
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
  destination_latitude: 0,
  destination_longitude: 0,
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

// Day name mapping for conversion
const DAY_MAPPING = {
  'Monday': 'mon',
  'Tuesday': 'tue',
  'Wednesday': 'wed',
  'Thursday': 'thu',
  'Friday': 'fri',
  'Saturday': 'sat',
  'Sunday': 'sun'
}

const REVERSE_DAY_MAPPING = {
  'mon': 'Monday',
  'tue': 'Tuesday',
  'wed': 'Wednesday',
  'thu': 'Thursday',
  'fri': 'Friday',
  'sat': 'Saturday',
  'sun': 'Sunday'
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Format conversion utilities
const convertTimeToAPI = (time12h: string): string => {
  if (!time12h) return ''
  const [time, period] = time12h.split(' ')
  if (!time || !period) return time12h // Already in 24h format
  const [hours, minutes] = time.split(':')
  let hour24 = parseInt(hours)
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0
  }
  return `${hour24.toString().padStart(2, '0')}:${minutes}:00`
}

const convertTimeFromAPI = (time24h: string | undefined): string => {
  if (!time24h) return ''
  const [hours, minutes] = time24h.split(':')
  const hour24 = parseInt(hours)
  let hour12 = hour24
  let period = 'AM'
  if (hour24 === 0) {
    hour12 = 12
  } else if (hour24 === 12) {
    period = 'PM'
  } else if (hour24 > 12) {
    hour12 = hour24 - 12
    period = 'PM'
  }
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`
}

const convertDaysToAPI = (days: string[]): string[] => {
  return days.map(day => DAY_MAPPING[day as keyof typeof DAY_MAPPING] || day.toLowerCase().substring(0, 3))
}

const convertDaysFromAPI = (days: string[] | undefined): string[] => {
  if (!days) return []
  return days.map(day => REVERSE_DAY_MAPPING[day as keyof typeof REVERSE_DAY_MAPPING] || day)
}

// Error parsing utility
const parseError = (error: any): { field: string | null; message: string } => {
  if (error.field && error.message) {
    return { field: error.field, message: error.message }
  }
  if (error.message) {
    return { field: null, message: error.message }
  }
  if (error.error) {
    return { field: null, message: error.error }
  }
  if (typeof error === 'string') {
    return { field: null, message: error }
  }
  return { field: null, message: 'An error occurred' }
}

export function MatchingPreferences({ onSaved }: { onSaved?: () => void }) {
  console.log('🔄 MatchingPreferences: Component render')
  const matching = useMatchingService()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(defaults)
  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Determine if user has set any advanced preferences (for save logic only)
  // Note: This does NOT auto-expand the section - user must manually toggle
  const shouldExpandAdvanced = useMemo(() => {
    if (!prefs) return false
    // Check if any advanced field has a non-default value
    if (prefs.max_detour_minutes && prefs.max_detour_minutes !== 15) return true
    if (prefs.preferred_group_size && prefs.preferred_group_size !== 4) return true
    if (prefs.driver_preference && prefs.driver_preference !== 'flexible') return true
    if (prefs.schedule_flexibility_minutes && prefs.schedule_flexibility_minutes !== 30) return true
    if (prefs.max_pickup_distance_miles && prefs.max_pickup_distance_miles !== 5.0) return true
    if (prefs.user_demographics && Object.keys(prefs.user_demographics).length > 0) {
      const demo = prefs.user_demographics
      if (demo.age_range && demo.age_range !== '26-35') return true
      if (demo.gender && demo.gender !== 'prefer_not_to_say') return true
      if (demo.occupation && demo.occupation.trim() !== '') return true
      if (demo.company && demo.company.trim() !== '') return true
    }
    if (prefs.demographic_preferences && Object.keys(prefs.demographic_preferences).length > 0) {
      const demoPrefs = prefs.demographic_preferences
      if (demoPrefs.age_preferences && demoPrefs.age_preferences.length > 0) {
        const defaultAges = ['18-25','26-35','36-45','46-55','56-65','65+']
        if (JSON.stringify(demoPrefs.age_preferences.sort()) !== JSON.stringify(defaultAges.sort())) return true
      }
      if (demoPrefs.gender_preferences && demoPrefs.gender_preferences.length > 0 && !demoPrefs.gender_preferences.includes('any')) return true
      if (demoPrefs.student_preference && demoPrefs.student_preference !== 'both') return true
      if (demoPrefs.occupation_preferences && demoPrefs.occupation_preferences.length > 0) return true
    }
    return false
  }, [prefs])

  // Advanced section starts collapsed by default - user must manually expand
  // Removed auto-expansion to reduce overwhelming UI

  useEffect(() => {
    let mounted = true
    
    const load = async () => {
      try {
        const p = await matching.getPreferences()
        if (!mounted) return
        
        // Handle "not configured" response
        if ('configured' in p && p.configured === false) {
          console.warn('Preferences not configured:', p.message)
          setPrefs(defaults)
          return
        }
        
        const prefs = p as Prefs
        console.log('📥 Loaded preferences from backend:', prefs)
        setPrefs(prefs)
        
        // Load destination address
        const savedAddress = localStorage.getItem('carpooly-saved-destination-address')
        const coordsAreValid = !!(prefs.destination_latitude && prefs.destination_longitude && prefs.destination_latitude !== 0 && prefs.destination_longitude !== 0)
        if (savedAddress && coordsAreValid) {
          setDestinationAddress(savedAddress)
        } else if (!coordsAreValid) {
          try { localStorage.removeItem('carpooly-saved-destination-address') } catch {}
          setDestinationAddress('')
        }
        
        // Try reverse geocode if coordinates exist
        if (coordsAreValid && !savedAddress) {
          try {
            const geocoder = new window.google.maps.Geocoder()
            const result = await geocoder.geocode({
              location: { lat: prefs.destination_latitude, lng: prefs.destination_longitude }
            })
            if (result.results && result.results[0]) {
              setDestinationAddress(result.results[0].formatted_address)
            }
          } catch (err) {
            console.warn('Failed to reverse geocode destination:', err)
          }
        }
      } catch {
        if (!mounted) return
        setPrefs(defaults)
      }
    }
    
    load()
    return () => { mounted = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Validate basic preferences
  const validateBasicPreferences = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {}
    
    if (!prefs.destination_latitude || prefs.destination_latitude === 0) {
      errors.destination = 'Please select a destination address'
    }
    
    if (!prefs.destination_longitude || prefs.destination_longitude === 0) {
      errors.destination = 'Please select a destination address'
    }
    
    if (!prefs.arrival_time || prefs.arrival_time.trim() === '') {
      errors.arrival_time = 'Please select an arrival time'
    }
    
    if (!prefs.commute_days || prefs.commute_days.length === 0) {
      errors.commute_days = 'Please select at least one commute day'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  const save = async () => {
    // Validate basic preferences
    const validation = validateBasicPreferences()
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      showToast('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    setValidationErrors({})
    
    try {
        // Prepare payload - only include fields that are set
        // Validation ensures arrival_time and commute_days are set and non-empty, so they will always be included
        const payload: any = {
          destination_latitude: prefs.destination_latitude,
          destination_longitude: prefs.destination_longitude,
          arrival_time: prefs.arrival_time && prefs.arrival_time.trim() !== '' 
            ? (prefs.arrival_time.includes(':') && prefs.arrival_time.split(':').length === 2 
              ? `${prefs.arrival_time}:00` 
              : prefs.arrival_time)
            : undefined,
          // Validation ensures commute_days has at least one element, so this is safe
          commute_days: prefs.commute_days!
        }
        
        // Include destination_address if available (for better UX)
        if (prefs.destination_address) {
          payload.destination_address = prefs.destination_address
        }
        
        // Remove undefined values (though validation should prevent this for required fields)
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined) {
            delete payload[key]
          }
        })
      
      // Only include advanced fields if user has set them (or if they're different from defaults)
      // Check if advanced section was expanded or if values differ from defaults
      if (isAdvancedExpanded || shouldExpandAdvanced) {
        if (prefs.max_detour_minutes !== undefined && prefs.max_detour_minutes !== 15) {
          payload.max_detour_minutes = prefs.max_detour_minutes
        }
        if (prefs.preferred_group_size !== undefined && prefs.preferred_group_size !== 4) {
          payload.preferred_group_size = prefs.preferred_group_size
        }
        if (prefs.driver_preference && prefs.driver_preference !== 'flexible') {
          payload.driver_preference = prefs.driver_preference
        }
        if (prefs.schedule_flexibility_minutes !== undefined && prefs.schedule_flexibility_minutes !== 30) {
          payload.schedule_flexibility_minutes = prefs.schedule_flexibility_minutes
        }
        if (prefs.max_pickup_distance_miles !== undefined && prefs.max_pickup_distance_miles !== 5.0) {
          payload.max_pickup_distance_miles = prefs.max_pickup_distance_miles
        }
        
        // Handle demographics - only send if user has set them
        const hasDemographics = prefs.user_demographics && (
          (prefs.user_demographics.age_range && prefs.user_demographics.age_range !== '26-35') ||
          (prefs.user_demographics.gender && prefs.user_demographics.gender !== 'prefer_not_to_say') ||
          (prefs.user_demographics.occupation && prefs.user_demographics.occupation.trim() !== '') ||
          (prefs.user_demographics.company && prefs.user_demographics.company.trim() !== '')
        )
        
        if (hasDemographics) {
          payload.user_demographics = prefs.user_demographics
        } else {
          // If user cleared demographics, send empty object
          payload.user_demographics = {}
        }
        
        // Handle demographic preferences
        const hasDemoPrefs = prefs.demographic_preferences && (
          (prefs.demographic_preferences.age_preferences && prefs.demographic_preferences.age_preferences.length > 0) ||
          (prefs.demographic_preferences.gender_preferences && prefs.demographic_preferences.gender_preferences.length > 0 && !prefs.demographic_preferences.gender_preferences.includes('any')) ||
          (prefs.demographic_preferences.student_preference && prefs.demographic_preferences.student_preference !== 'both') ||
          (prefs.demographic_preferences.occupation_preferences && prefs.demographic_preferences.occupation_preferences.length > 0)
        )
        
        if (hasDemoPrefs) {
          payload.demographic_preferences = prefs.demographic_preferences
        } else {
          // If user cleared demographic preferences, send empty object
          payload.demographic_preferences = {}
        }
      } else {
        // User never touched advanced section - don't send advanced fields at all
        // Backend will use defaults
      }
      
      console.log('💾 Saving preferences payload:', payload)
      await matching.updatePreferences(payload as Prefs)
      
      // Save destination address to localStorage
      if (destinationAddress) {
        localStorage.setItem('carpooly-saved-destination-address', destinationAddress)
      }
      
      setSaved(true)
      showToast('Preferences saved successfully')
      onSaved?.()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('❌ Error saving preferences:', err)
      const parsedError = parseError(err)
      setValidationErrors({ [parsedError.field || 'general']: parsedError.message })
      showToast(`Failed to save preferences: ${parsedError.message}`)
    } finally {
      setLoading(false)
    }
  }

  const update = (key: keyof Prefs, value: any) => {
    setPrefs((prev: Prefs) => ({ ...prev, [key]: value }))
    // Clear validation error for this field
    if (validationErrors[key as string]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[key as string]
        return next
      })
    }
  }
  
  const updateNotif = (key: keyof Prefs['notification_preferences'], value: boolean) => {
    setPrefs((prev: Prefs) => ({ ...prev, notification_preferences: { ...prev.notification_preferences, [key]: value } }))
  }

  const updateUserDemo = (key: keyof Prefs['user_demographics'], value: any) => {
    setPrefs((prev: Prefs) => ({ ...prev, user_demographics: { ...prev.user_demographics, [key]: value } }))
  }
  
  const toggleArrayPref = (key: keyof Prefs['demographic_preferences'], value: string) => {
    setPrefs((prev: Prefs) => {
      const current = (prev.demographic_preferences?.[key] as string[]) || []
      const exists = current.includes(value)
      const next = exists ? current.filter(v => v !== value) : [...current, value]
      return { ...prev, demographic_preferences: { ...prev.demographic_preferences, [key]: next } }
    })
  }
  
  const updateDemoPref = (key: keyof Prefs['demographic_preferences'], value: any) => {
    setPrefs((prev: Prefs) => ({ ...prev, demographic_preferences: { ...prev.demographic_preferences, [key]: value } }))
  }

  const handleDestinationSelect = useCallback((location: { address: string; lat: number; lng: number }) => {
    console.log('🎯 handleDestinationSelect called with:', location)
    setDestinationAddress(location.address)
    try {
      localStorage.setItem('carpooly-saved-destination-address', location.address)
    } catch (e) {
      console.warn('Failed to persist destination to localStorage:', e)
    }
    
    setPrefs((prev: Prefs) => ({
      ...prev,
      destination_latitude: location.lat,
      destination_longitude: location.lng,
      destination_address: location.address
    }))
    
    // Clear validation error
    if (validationErrors.destination) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next.destination
        return next
      })
    }
  }, [validationErrors])

  // Note: HTML time input already uses 24-hour format, so we can use it directly

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Matching Preferences</h2>
        <p className="text-gray-600">Customize how we find your perfect carpool partners</p>
      </div>

      <div className="space-y-6">
        {/* Basic Preferences Section (Required) */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Basic Preferences (Required)
            </CardTitle>
            <CardDescription>Set your destination, schedule, and commute days to find matches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Destination Address */}
            <div>
              <Label htmlFor="destination_address">
                Destination Address <span className="text-red-500">*</span>
              </Label>
              <AddressAutocomplete
                key="destination-autocomplete"
                onSelect={handleDestinationSelect}
                placeholder="Enter your work address (e.g., 123 Main St, San Francisco, CA)"
                className="mt-1"
              />
              {validationErrors.destination && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.destination}
                </p>
              )}
              {destinationAddress && (prefs.destination_latitude !== 0 && prefs.destination_longitude !== 0) && (
                <div className="p-3 bg-green-50 rounded-md mt-2">
                  <p className="text-sm text-green-800">
                    <strong>Selected:</strong> {destinationAddress}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Start typing to search for your work address</p>
            </div>

            {/* Arrival Time */}
            <div>
              <Label htmlFor="arrival_time">
                Arrival Time <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="arrival_time" 
                type="time" 
                value={prefs.arrival_time ? (prefs.arrival_time.includes(':') ? prefs.arrival_time.split(':').slice(0, 2).join(':') : prefs.arrival_time) : ''} 
                onChange={(e) => {
                  const time24h = e.target.value
                  update('arrival_time', time24h || undefined)
                }}
                className="mt-1"
              />
              {validationErrors.arrival_time && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.arrival_time}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">When you typically arrive at work</p>
            </div>

            {/* Commute Days */}
            <div>
              <Label>
                Commute Days <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {DAY_NAMES.map(day => {
                  const apiDay = DAY_MAPPING[day as keyof typeof DAY_MAPPING]
                  const isChecked = prefs.commute_days?.includes(apiDay) || false
                  return (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = prefs.commute_days || []
                          const updated = e.target.checked 
                            ? [...current, apiDay]
                            : current.filter(d => d !== apiDay)
                          update('commute_days', updated.length > 0 ? updated : undefined)
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{day}</span>
                    </label>
                  )
                })}
              </div>
              {validationErrors.commute_days && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.commute_days}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Select your regular commute days</p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Preferences Section (Collapsible) */}
        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
              className="w-full justify-between p-0 h-auto"
            >
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Preferences (Optional)
              </CardTitle>
              {isAdvancedExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
            <CardDescription>Fine-tune your matching preferences for better results</CardDescription>
          </CardHeader>
          
          {isAdvancedExpanded && (
            <CardContent className="space-y-6 pt-0">
              {/* Route Preferences */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Route Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_detour">Maximum Detour (minutes)</Label>
                    <Input 
                      id="max_detour" 
                      type="number" 
                      value={prefs.max_detour_minutes} 
                      onChange={(e) => update('max_detour_minutes', parseInt(e.target.value) || 15)} 
                      min={5} 
                      max={60} 
                    />
                    <p className="text-xs text-gray-500 mt-1">How much extra time you&apos;re willing to spend picking up others (5-60 minutes)</p>
                  </div>
                  <div>
                    <Label htmlFor="pickup_distance">Maximum Pickup Distance (miles)</Label>
                    <Input 
                      id="pickup_distance" 
                      type="number" 
                      step="0.5" 
                      value={prefs.max_pickup_distance_miles} 
                      onChange={(e) => update('max_pickup_distance_miles', parseFloat(e.target.value) || 5.0)} 
                      min={0} 
                      max={25} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum distance to travel for pickup</p>
                  </div>
                </div>
              </div>

              {/* Group & Role Preferences */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Group & Role Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="group_size">Preferred Group Size</Label>
                    <MatchingSelect 
                      value={prefs.preferred_group_size.toString()} 
                      onValueChange={(v) => update('preferred_group_size', parseInt(v))}
                    >
                      <MatchingSelectTrigger>
                        <MatchingSelectValue />
                      </MatchingSelectTrigger>
                      <MatchingSelectContent>
                        {[2,3,4,5].map(n => (
                          <MatchingSelectItem key={n} value={String(n)}>{n} {n === 1 ? 'person' : 'people'}</MatchingSelectItem>
                        ))}
                      </MatchingSelectContent>
                    </MatchingSelect>
                    <p className="text-xs text-gray-500 mt-1">Preferred carpool size (2-5 people)</p>
                  </div>
                  <div>
                    <Label htmlFor="driver_preference">Driver Preference</Label>
                    <MatchingSelect 
                      value={prefs.driver_preference} 
                      onValueChange={(v) => update('driver_preference', v)}
                    >
                      <MatchingSelectTrigger>
                        <MatchingSelectValue />
                      </MatchingSelectTrigger>
                      <MatchingSelectContent>
                        <MatchingSelectItem value="driver">I&apos;ll drive</MatchingSelectItem>
                        <MatchingSelectItem value="passenger">I&apos;ll be a passenger</MatchingSelectItem>
                        <MatchingSelectItem value="flexible">Flexible</MatchingSelectItem>
                      </MatchingSelectContent>
                    </MatchingSelect>
                  </div>
                </div>
              </div>

              {/* Schedule Flexibility */}
              <div>
                <Label htmlFor="schedule_flexibility">Schedule Flexibility (minutes)</Label>
                <Input 
                  id="schedule_flexibility" 
                  type="number" 
                  value={prefs.schedule_flexibility_minutes} 
                  onChange={(e) => update('schedule_flexibility_minutes', parseInt(e.target.value) || 30)} 
                  min={0} 
                  max={120} 
                />
                <p className="text-xs text-gray-500 mt-1">How flexible is your schedule?</p>
              </div>

              {/* About You */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">About You (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Age Range</Label>
                    <MatchingSelect 
                      value={prefs.user_demographics.age_range} 
                      onValueChange={(v) => updateUserDemo('age_range', v)}
                    >
                      <MatchingSelectTrigger>
                        <MatchingSelectValue />
                      </MatchingSelectTrigger>
                      <MatchingSelectContent>
                        {AGE_RANGES.map(r => (
                          <MatchingSelectItem key={r} value={r}>{r}</MatchingSelectItem>
                        ))}
                      </MatchingSelectContent>
                    </MatchingSelect>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <MatchingSelect 
                      value={prefs.user_demographics.gender} 
                      onValueChange={(v) => updateUserDemo('gender', v)}
                    >
                      <MatchingSelectTrigger>
                        <MatchingSelectValue />
                      </MatchingSelectTrigger>
                      <MatchingSelectContent>
                        {USER_GENDER_OPTIONS.map(g => (
                          <MatchingSelectItem key={g} value={g}>{g.replace('_', ' ')}</MatchingSelectItem>
                        ))}
                      </MatchingSelectContent>
                    </MatchingSelect>
                  </div>
                  <div>
                    <Label>Occupation (optional)</Label>
                    <Input 
                      value={prefs.user_demographics.occupation} 
                      onChange={(e) => updateUserDemo('occupation', e.target.value)} 
                      placeholder="e.g., Software Engineer" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Company (optional)</Label>
                    <Input 
                      value={prefs.user_demographics.company} 
                      onChange={(e) => updateUserDemo('company', e.target.value)} 
                      placeholder="e.g., Acme Corp" 
                    />
                  </div>
                </div>
              </div>

              {/* Demographic Preferences */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Demographic Preferences (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Preferred Ages</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AGE_RANGES.map(range => (
                        <label key={range} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prefs.demographic_preferences.age_preferences?.includes(range) || false}
                            onChange={() => toggleArrayPref('age_preferences', range)}
                            className="rounded"
                          />
                          <span className="text-sm">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Preferred Genders</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PREF_GENDER_OPTIONS.map(gender => (
                        <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prefs.demographic_preferences.gender_preferences?.includes(gender) || false}
                            onChange={() => toggleArrayPref('gender_preferences', gender)}
                            className="rounded"
                          />
                          <span className="text-sm">{gender.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Student Preference</Label>
                    <MatchingSelect 
                      value={prefs.demographic_preferences.student_preference} 
                      onValueChange={(v) => updateDemoPref('student_preference', v)}
                    >
                      <MatchingSelectTrigger>
                        <MatchingSelectValue />
                      </MatchingSelectTrigger>
                      <MatchingSelectContent>
                        {PREF_STUDENT_OPTIONS.map(opt => (
                          <MatchingSelectItem key={opt.value} value={opt.value}>{opt.label}</MatchingSelectItem>
                        ))}
                      </MatchingSelectContent>
                    </MatchingSelect>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-gray-500">Get notified via email</p>
                    </div>
                    <Switch 
                      checked={prefs.notification_preferences.email} 
                      onCheckedChange={(c) => updateNotif('email', c)} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-xs text-gray-500">Get notified in the app</p>
                    </div>
                    <Switch 
                      checked={prefs.notification_preferences.push} 
                      onCheckedChange={(c) => updateNotif('push', c)} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-xs text-gray-500">Get notified via text message</p>
                    </div>
                    <Switch 
                      checked={prefs.notification_preferences.sms} 
                      onCheckedChange={(c) => updateNotif('sms', c)} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
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
