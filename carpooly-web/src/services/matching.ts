// Mock-only matching service and types (no network calls)

export interface MatchingPreferences {
  maxDetourMinutes: number
  preferredGroupSize: number
  maxPickupDistanceMiles: number
  driverPreference: string
  scheduleFlexibilityMinutes: number
  minCompatibilityScore: number
  notificationPreferences: { email: boolean; push: boolean; sms: boolean }
  userDemographics: { ageRange: string; gender: string; occupation: string; studentStatus: string; company: string }
  demographicPreferences: { agePreferences: string[]; genderPreferences: string[]; studentPreference: string; occupationPreferences: string[] }
}

export interface PotentialMatch {
  id: string
  user2: { id: string; name: string; displayName: string; preferences: { userDemographics: { ageRange: string; gender: string; occupation: string } }; schedule: { departureTime: string; frequency: string } }
  compatibilityScore: number
  routeOverlapPercentage: number
  totalDistanceMiles: number
  estimatedSavingsPerMonth: number
  matchReasons: string[]
  matchScore: { locationScore: number; scheduleScore: number; demographicScore: number; routeScore: number }
  created_at: string
  expires_at: string
}

export interface MatchRequest {
  id: string
  from_user: { id: string; name: string; display_name: string }
  to_user: { id: string; name: string; display_name: string }
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  message: string
  created_at: string
  expires_at: string
}

export interface MatchFilters { minScore?: number; maxDistance?: number; ageRanges?: string[]; genders?: string[] }

const prefs: MatchingPreferences = {
  maxDetourMinutes: 15,
  preferredGroupSize: 4,
  driverPreference: 'flexible',
  scheduleFlexibilityMinutes: 30,
  maxPickupDistanceMiles: 5,
  minCompatibilityScore: 70,
  notificationPreferences: { email: true, push: true, sms: false },
  userDemographics: { ageRange: '26-35', gender: 'prefer_not_to_say', occupation: '', studentStatus: 'not_student', company: '' },
  demographicPreferences: { agePreferences: ['18-25', '26-35', '36-45', '46-55'], genderPreferences: ['any'], studentPreference: 'both', occupationPreferences: [] }
}

const potential: PotentialMatch[] = [
  {
    id: 'm1',
    user2: { id: 'u1', name: 'Sarah Johnson', displayName: 'Sarah J.', preferences: { userDemographics: { ageRange: '26-35', gender: 'female', occupation: 'Software Engineer' } }, schedule: { departureTime: '08:30', frequency: 'daily' } },
    compatibilityScore: 0.89,
    routeOverlapPercentage: 0.85,
    totalDistanceMiles: 12.5,
    estimatedSavingsPerMonth: 120,
    matchReasons: ['Similar route', 'Close pickup'],
    matchScore: { locationScore: 0.92, scheduleScore: 0.88, demographicScore: 0.85, routeScore: 0.9 },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 864e5).toISOString()
  },
  {
    id: 'm2',
    user2: { id: 'u2', name: 'Mike Chen', displayName: 'Mike C.', preferences: { userDemographics: { ageRange: '36-45', gender: 'male', occupation: 'Product Manager' } }, schedule: { departureTime: '08:15', frequency: 'daily' } },
    compatibilityScore: 0.83,
    routeOverlapPercentage: 0.78,
    totalDistanceMiles: 14.2,
    estimatedSavingsPerMonth: 95,
    matchReasons: ['Route overlap', 'Flexible schedule'],
    matchScore: { locationScore: 0.86, scheduleScore: 0.82, demographicScore: 0.8, routeScore: 0.79 },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 6 * 864e5).toISOString()
  },
  {
    id: 'm3',
    user2: { id: 'u3', name: 'Priya Singh', displayName: 'Priya S.', preferences: { userDemographics: { ageRange: '26-35', gender: 'female', occupation: 'Data Scientist' } }, schedule: { departureTime: '09:00', frequency: 'mon-fri' } },
    compatibilityScore: 0.91,
    routeOverlapPercentage: 0.82,
    totalDistanceMiles: 10.1,
    estimatedSavingsPerMonth: 130,
    matchReasons: ['Same destination', 'Similar schedule', 'Close pickup location'],
    matchScore: { locationScore: 0.9, scheduleScore: 0.93, demographicScore: 0.87, routeScore: 0.84 },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 5 * 864e5).toISOString()
  },
  {
    id: 'm4',
    user2: { id: 'u4', name: 'Diego Alvarez', displayName: 'Diego A.', preferences: { userDemographics: { ageRange: '18-25', gender: 'male', occupation: 'Student' } }, schedule: { departureTime: '07:45', frequency: 'daily' } },
    compatibilityScore: 0.76,
    routeOverlapPercentage: 0.7,
    totalDistanceMiles: 18.4,
    estimatedSavingsPerMonth: 80,
    matchReasons: ['Near your route', 'Morning schedule'],
    matchScore: { locationScore: 0.78, scheduleScore: 0.74, demographicScore: 0.7, routeScore: 0.72 },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 4 * 864e5).toISOString()
  },
  {
    id: 'm5',
    user2: { id: 'u5', name: 'Emily Carter', displayName: 'Emily C.', preferences: { userDemographics: { ageRange: '36-45', gender: 'female', occupation: 'Nurse' } }, schedule: { departureTime: '06:30', frequency: 'shift' } },
    compatibilityScore: 0.8,
    routeOverlapPercentage: 0.77,
    totalDistanceMiles: 22.0,
    estimatedSavingsPerMonth: 140,
    matchReasons: ['Similar schedule window', 'Good route overlap'],
    matchScore: { locationScore: 0.82, scheduleScore: 0.8, demographicScore: 0.76, routeScore: 0.78 },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3 * 864e5).toISOString()
  }
]

const requests: { incoming: MatchRequest[]; outgoing: MatchRequest[] } = {
  incoming: [
    { id: 'r1', from_user: { id: 'u6', name: 'Alex Rivera', display_name: 'Alex R.' }, to_user: { id: 'me', name: 'You', display_name: 'You' }, status: 'pending', message: 'Hey! Our routes look close. Want to try carpooling this week?', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 2 * 864e5).toISOString() },
    { id: 'r2', from_user: { id: 'u7', name: 'Linda Zhao', display_name: 'Linda Z.' }, to_user: { id: 'me', name: 'You', display_name: 'You' }, status: 'pending', message: 'Hi! I can drive on Tue/Thu. Interested in splitting rides?', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 864e5).toISOString() }
  ],
  outgoing: [
    { id: 'r3', from_user: { id: 'me', name: 'You', display_name: 'You' }, to_user: { id: 'u3', name: 'Priya Singh', display_name: 'Priya S.' }, status: 'pending', message: 'Hi Priya! Looks like we share a route and time.', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 3 * 864e5).toISOString() }
  ]
}

export const useMatchingService = () => {
  const service = {
    async getPreferences(): Promise<MatchingPreferences> { return prefs },
    async updatePreferences(_: Partial<MatchingPreferences>): Promise<void> { return },
    async getPotentialMatches(_: MatchFilters = {}) { return { success: true, pendingMatches: potential, acceptedMatches: [], expiredMatches: [], totalAvailable: potential.length, filtersApplied: {} as MatchFilters } },
    async findMatches(_: { forceRefresh: boolean; limit: number; filters?: MatchFilters }) { return { success: true, matchesFound: potential.length, message: 'ok', processingTimeMs: 0 } },
    async sendRequest(_: string, __: string, ___?: string) { return },
    async respondToRequest(_: string, __: 'accept' | 'reject', ___?: string) { return },
    async getRequests(): Promise<{ incoming: MatchRequest[]; outgoing: MatchRequest[] }> { return requests },
    async getMatchingSession() { return { session_type: 'daily', status: 'active', last_match_run: new Date().toISOString(), next_match_run: new Date(Date.now() + 864e5).toISOString() } },
    async getStats() { return { total_matches_generated: 6, match_acceptance_rate: 0.78, average_compatibility_score: 0.85, total_carpools_formed: 3, total_savings: 798, average_route_overlap: 0.7, most_common_match_reasons: ['close_location', 'similar_schedule'], geographic_distribution: { nearby: 4, medium_distance: 2, far: 0 }, time_to_acceptance: 24, monthly_trends: [{ month: 'Jan', matches: 10, acceptances: 7 }, { month: 'Feb', matches: 12, acceptances: 9 }] } }
  }
  return service
} 