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
  Save
} from 'lucide-react'
import { useMatchingService, type MatchingPreferences as Prefs } from '@/services/matching'

const defaults: Prefs = {
  maxDetourMinutes: 15,
  preferredGroupSize: 4,
  driverPreference: 'flexible',
  scheduleFlexibilityMinutes: 30,
  maxPickupDistanceMiles: 5.0,
  minCompatibilityScore: 0.7,
  notificationPreferences: { email: true, push: true, sms: false },
  userDemographics: { ageRange: '26-35', gender: 'prefer_not_to_say', occupation: '', studentStatus: 'not_student', company: '' },
  demographicPreferences: { agePreferences: ['18-25','26-35','36-45','46-55','56-65','65+'], genderPreferences: ['any'], studentPreference: 'both', occupationPreferences: [] }
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

export function MatchingPreferences() {
  const matching = useMatchingService()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(defaults)

  const load = useCallback(async () => {
    try {
      const p = await matching.getPreferences()
      setPrefs(p)
    } catch {
      setPrefs(defaults)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setLoading(true)
    try {
      await matching.updatePreferences(prefs)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  const update = (key: keyof Prefs, value: any) => setPrefs(prev => ({ ...prev, [key]: value }))
  const updateNotif = (key: keyof Prefs['notificationPreferences'], value: boolean) => setPrefs(prev => ({ ...prev, notificationPreferences: { ...prev.notificationPreferences, [key]: value } }))

  const updateUserDemo = (key: keyof Prefs['userDemographics'], value: any) => setPrefs(prev => ({ ...prev, userDemographics: { ...prev.userDemographics, [key]: value } }))
  const toggleArrayPref = (key: keyof Prefs['demographicPreferences'], value: string) => setPrefs(prev => {
    const current = prev.demographicPreferences[key] as string[]
    const exists = current.includes(value)
    const next = exists ? current.filter(v => v !== value) : [...current, value]
    return { ...prev, demographicPreferences: { ...prev.demographicPreferences, [key]: next } }
  })
  const updateDemoPref = (key: keyof Prefs['demographicPreferences'], value: any) => setPrefs(prev => ({ ...prev, demographicPreferences: { ...prev.demographicPreferences, [key]: value } }))

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
                <Input id="max_detour" type="number" value={prefs.maxDetourMinutes} onChange={(e) => update('maxDetourMinutes', parseInt(e.target.value))} min={0} max={60} />
                <p className="text-xs text-gray-500 mt-1">How much extra time you&apos;re willing to spend picking up others</p>
              </div>
              <div>
                <Label htmlFor="pickup_distance">Maximum Pickup Distance (miles)</Label>
                <Input id="pickup_distance" type="number" step="0.5" value={prefs.maxPickupDistanceMiles} onChange={(e) => update('maxPickupDistanceMiles', parseFloat(e.target.value))} min={0} max={25} />
                <p className="text-xs text-gray-500 mt-1">Maximum distance to travel for pickup</p>
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
                <MatchingSelect value={prefs.preferredGroupSize.toString()} onValueChange={(v) => update('preferredGroupSize', parseInt(v))}>
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
                <MatchingSelect value={prefs.driverPreference} onValueChange={(v) => update('driverPreference', v)}>
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
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule & Match Quality
            </CardTitle>
            <CardDescription>Set your schedule flexibility and minimum compatibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flexibility">Schedule Flexibility (minutes)</Label>
                <Input id="flexibility" type="number" value={prefs.scheduleFlexibilityMinutes} onChange={(e) => update('scheduleFlexibilityMinutes', parseInt(e.target.value))} min={0} max={120} />
                <p className="text-xs text-gray-500 mt-1">How much your departure time can vary</p>
              </div>
              <div>
                <Label htmlFor="compatibility">Minimum Compatibility Score</Label>
                <Input id="compatibility" type="number" step="0.01" value={prefs.minCompatibilityScore} onChange={(e) => update('minCompatibilityScore', parseFloat(e.target.value))} min={0} max={1} />
                <p className="text-xs text-gray-500 mt-1">Value between 0.0 and 1.0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Your Demographics</CardTitle>
            <CardDescription>Tell us about yourself to improve matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Age Range</Label>
                <MatchingSelect value={prefs.userDemographics.ageRange} onValueChange={(v) => updateUserDemo('ageRange', v)}>
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
                <MatchingSelect value={prefs.userDemographics.gender} onValueChange={(v) => updateUserDemo('gender', v)}>
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    {USER_GENDER_OPTIONS.map(g => (<MatchingSelectItem key={g} value={g}>{g}</MatchingSelectItem>))}
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              <div>
                <Label>Occupation</Label>
                <Input value={prefs.userDemographics.occupation} onChange={(e) => updateUserDemo('occupation', e.target.value)} placeholder="e.g., Software Engineer" />
              </div>
              <div>
                <Label>Student Status</Label>
                <MatchingSelect value={prefs.userDemographics.studentStatus} onValueChange={(v) => updateUserDemo('studentStatus', v)}>
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    {USER_STUDENT_STATUS.map(s => (<MatchingSelectItem key={s} value={s}>{s}</MatchingSelectItem>))}
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              <div className="md:col-span-2">
                <Label>Company/School (optional)</Label>
                <Input value={prefs.userDemographics.company} onChange={(e) => updateUserDemo('company', e.target.value)} placeholder="e.g., Acme Corp or State University" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Who you prefer to ride with</CardTitle>
            <CardDescription>Choose demographics you&apos;re comfortable carpooling with</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Preferred Age Ranges</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AGE_RANGES.map(r => {
                    const selected = prefs.demographicPreferences.agePreferences.includes(r)
                    return (
                      <Button key={r} type="button" variant={selected ? 'default' : 'outline'} size="sm" onClick={() => toggleArrayPref('agePreferences', r)}>
                        {r}
                      </Button>
                    )
                  })}
                </div>
              </div>
              <div>
                <Label>Preferred Genders</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PREF_GENDER_OPTIONS.map(g => {
                    const selected = prefs.demographicPreferences.genderPreferences.includes(g)
                    return (
                      <Button key={g} type="button" variant={selected ? 'default' : 'outline'} size="sm" onClick={() => toggleArrayPref('genderPreferences', g)}>
                        {g}
                      </Button>
                    )
                  })}
                </div>
              </div>
              <div>
                <Label>Student Preference</Label>
                <MatchingSelect value={prefs.demographicPreferences.studentPreference} onValueChange={(v) => updateDemoPref('studentPreference', v)}>
                  <MatchingSelectTrigger>
                    <MatchingSelectValue />
                  </MatchingSelectTrigger>
                  <MatchingSelectContent>
                    {PREF_STUDENT_OPTIONS.map(o => (<MatchingSelectItem key={o.value} value={o.value}>{o.label}</MatchingSelectItem>))}
                  </MatchingSelectContent>
                </MatchingSelect>
              </div>
              <div>
                <Label>Preferred Occupations (comma separated)</Label>
                <Input value={prefs.demographicPreferences.occupationPreferences.join(', ')} onChange={(e) => updateDemoPref('occupationPreferences', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="e.g., Engineer, Teacher" />
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
                <Switch checked={prefs.notificationPreferences.email} onCheckedChange={(c) => updateNotif('email', c)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified in the app</p>
                </div>
                <Switch checked={prefs.notificationPreferences.push} onCheckedChange={(c) => updateNotif('push', c)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Get notified via text message</p>
                </div>
                <Switch checked={prefs.notificationPreferences.sms} onCheckedChange={(c) => updateNotif('sms', c)} />
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