// PURE MOCK DATA - NO API CALLS - FOR DEMO ONLY

// Interfaces
export interface UserMatchingPreferences {
  maxDetourMinutes: number
  preferredGroupSize: number
  maxPickupDistance: number
  preferredGender: string[]
  preferredAgeRange: {
    min: number
    max: number
  }
  smokingPreference: string
  musicPreference: string
  conversationPreference: string
  userDemographics: {
    age: number
    gender: string
    occupation: string
    interests: string[]
  }
  demographicPreferences: {
    ageRange: {
      min: number
      max: number
    }
    genderPreferences: string[]
    occupationPreferences: string[]
  }
}

export interface MatchingPreferences {
  maxDetourMinutes: number
  preferredGroupSize: number
  maxPickupDistance: number
  preferredGender: string[]
  preferredAgeRange: {
    min: number
    max: number
  }
  smokingPreference: string
  musicPreference: string
  conversationPreference: string
  // Additional fields used by UI
  driverPreference: string
  scheduleFlexibilityMinutes: number
  maxPickupDistanceMiles: number
  minCompatibilityScore: number
  notificationPreferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
  userDemographics: {
    age: number
    gender: string
    occupation: string
    interests: string[]
    // Additional optional UI fields
    ageRange?: string
    studentStatus?: string
    company?: string
  }
  demographicPreferences: {
    ageRange: {
      min: number
      max: number
    }
    genderPreferences: string[]
    occupationPreferences: string[]
    // Additional optional UI fields
    agePreferences?: string[]
    studentPreference?: string
  }
}

export interface PotentialMatch {
  id: string
  user1Id: string
  user2: {
    id: string
    name: string
    displayName: string
    profile_picture?: string
    preferences: {
      userDemographics: {
        ageRange: string
        gender: string
        occupation: string
        studentStatus: string
        company: string
      }
    }
    schedule: {
      departureTime: string
      frequency: string
    }
  }
  compatibilityScore: number
  routeOverlapPercentage: number
  totalDistanceMiles: number
  estimatedSavingsPerMonth: number
  matchReasons: string[]
  matchScore: {
    locationScore: number
    scheduleScore: number
    demographicScore: number
    routeScore: number
  }
  created_at: string
  expires_at: string
}

export interface MatchFilters {
  minScore?: number
  maxDistance?: number
  ageRanges?: string[]
  genders?: string[]
  studentPreference?: string
  driverPreference?: string
}

export interface MatchRequest {
  id: string
  from_user: {
    id: string
    name: string
    display_name: string
  }
  to_user: {
    id: string
    name: string
    display_name: string
  }
  status: "pending" | "accepted" | "rejected" | "expired"
  message: string
  created_at: string
  expires_at: string
}

export interface MatchScore {
  user_id: string
  compatibility_score: number
  route_overlap: number
  estimated_detour_minutes: number
  match_reasons: string[]
  totalScore: number
}

export interface UserProfile {
  id: string
  name: string
  displayName: string
  display_name: string
  profile_picture?: string
  age: number
  gender: string
  occupation: string
  interests: string[]
  rating: number
  total_rides: number
  verified: boolean
  homeLocation?: {
    latitude: number
    longitude: number
  }
  schedule?: {
    departureTime: string
    flexibilityMinutes: number
    daysOfWeek: string[]
  }
  preferences?: {
    maxDetourMinutes: number
    maxPickupDistanceMiles: number
    preferredGroupSize: number
    driverPreference: string
    demographicPreferences: {
      agePreferences: string[]
      genderPreferences: string[]
      occupationPreferences: string[]
      studentPreference: string
    }
  }
  currentGroupSize?: number
}

export interface MatchingStats {
  total_matches_generated: number
  match_acceptance_rate: number
  average_compatibility_score: number
  total_carpools_formed: number
  total_savings: number
  average_route_overlap: number
  most_common_match_reasons: string[]
  geographic_distribution: {
    nearby: number
    medium_distance: number
    far: number
  }
  time_to_acceptance: number
  monthly_trends: {
    month: string
    matches: number
    acceptances: number
  }[]
}

// Local mock data used by all async methods below
const mockPotentialMatchesData: PotentialMatch[] = [
  {
    id: 'match-1',
    user1Id: 'current-user',
    user2: {
      id: 'user-1',
      name: 'Sarah Johnson',
      displayName: 'Sarah J.',
      preferences: {
        userDemographics: {
          ageRange: '26-35',
          gender: 'Female',
          occupation: 'Software Engineer',
          studentStatus: 'not_student',
          company: 'Tech Corp'
        }
      },
      schedule: {
        departureTime: '08:30',
        frequency: 'daily'
      }
    },
    compatibilityScore: 0.89,
    routeOverlapPercentage: 0.85,
    totalDistanceMiles: 12.5,
    estimatedSavingsPerMonth: 120,
    matchReasons: ['Similar route', 'Close pickup location', 'Compatible schedule'],
    matchScore: {
      locationScore: 0.92,
      scheduleScore: 0.88,
      demographicScore: 0.85,
      routeScore: 0.90
    },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'match-2',
    user1Id: 'current-user',
    user2: {
      id: 'user-2',
      name: 'Mike Chen',
      displayName: 'Mike C.',
      preferences: {
        userDemographics: {
          ageRange: '26-35',
          gender: 'Male',
          occupation: 'Marketing Manager',
          studentStatus: 'not_student',
          company: 'Marketing Inc'
        }
      },
      schedule: {
        departureTime: '09:00',
        frequency: 'daily'
      }
    },
    compatibilityScore: 0.76,
    routeOverlapPercentage: 0.78,
    totalDistanceMiles: 15.2,
    estimatedSavingsPerMonth: 95,
    matchReasons: ['Similar schedule', 'Close age range', 'Compatible preferences'],
    matchScore: {
      locationScore: 0.80,
      scheduleScore: 0.75,
      demographicScore: 0.78,
      routeScore: 0.82
    },
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockMatchRequestsData: MatchRequest[] = [
  {
    id: 'request-1',
    from_user: {
      id: 'user-1',
      name: 'Sarah Johnson',
      display_name: 'Sarah J.'
    },
    to_user: {
      id: 'current-user',
      name: 'Current User',
      display_name: 'Current User'
    },
    status: 'pending' as const,
    message: 'Hi! I saw we have a similar commute route. Would you like to carpool together?',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'request-2',
    from_user: {
      id: 'user-2',
      name: 'Mike Chen',
      display_name: 'Mike C.'
    },
    to_user: {
      id: 'current-user',
      name: 'Current User',
      display_name: 'Current User'
    },
    status: 'pending' as const,
    message: 'Hey! I noticed we both work in the same area. Interested in sharing rides?',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
  }
]

const mockMatchingPreferencesData: MatchingPreferences = {
  maxDetourMinutes: 20,
  preferredGroupSize: 3,
  maxPickupDistance: 8,
  preferredGender: ['any'],
  preferredAgeRange: { min: 25, max: 40 },
  smokingPreference: 'non_smoking',
  musicPreference: 'flexible',
  conversationPreference: 'casual',
  // UI fields
  driverPreference: 'flexible',
  scheduleFlexibilityMinutes: 30,
  maxPickupDistanceMiles: 5,
  minCompatibilityScore: 70,
  notificationPreferences: { email: true, push: true, sms: false },
  userDemographics: {
    age: 28,
    gender: 'prefer_not_to_say',
    occupation: '',
    interests: ['Technology', 'Music', 'Travel'],
    ageRange: '26-35',
    studentStatus: 'not_student',
    company: ''
  },
  demographicPreferences: {
    ageRange: { min: 25, max: 40 },
    genderPreferences: ['any'],
    occupationPreferences: [],
    agePreferences: ['18-25', '26-35', '36-45', '46-55'],
    studentPreference: 'both'
  }
}

const mockMatchingStatsData: MatchingStats = {
  total_matches_generated: 6,
  match_acceptance_rate: 0.78,
  average_compatibility_score: 0.85,
  total_carpools_formed: 3,
  total_savings: 798,
  average_route_overlap: 0.7,
  most_common_match_reasons: ['close_location', 'similar_schedule'],
  geographic_distribution: { nearby: 4, medium_distance: 2, far: 0 },
  time_to_acceptance: 24,
  monthly_trends: [
    { month: 'Jan', matches: 10, acceptances: 7 },
    { month: 'Feb', matches: 12, acceptances: 9 }
  ]
}

// Async mock service – signatures preserved to match components
export const useMatchingService = () => {
  const service = {
    async getPreferences(): Promise<MatchingPreferences> {
      return mockMatchingPreferencesData
    },

    async updatePreferences(_: Partial<MatchingPreferences>): Promise<void> {
      return
    },

    async findMatches(_: {
      forceRefresh: boolean
      limit: number
      filters?: MatchFilters
    }): Promise<{ success: boolean; matchesFound: number; message: string; processingTimeMs: number }> {
      return {
        success: true,
        matchesFound: mockPotentialMatchesData.length,
        message: `Found ${mockPotentialMatchesData.length} potential matches (mock)`,
        processingTimeMs: 0
      }
    },

    async getPotentialMatches(filters?: MatchFilters): Promise<{
      success: boolean
      pendingMatches: PotentialMatch[]
      acceptedMatches: PotentialMatch[]
      expiredMatches: PotentialMatch[]
      totalAvailable: number
      filtersApplied: MatchFilters
    }> {
      return {
        success: true,
        pendingMatches: mockPotentialMatchesData,
        acceptedMatches: [],
        expiredMatches: [],
        totalAvailable: mockPotentialMatchesData.length,
        filtersApplied: filters || {}
      }
    },

    async sendRequest(_: string, __: string, ___?: string): Promise<void> {
      return
    },

    async respondToRequest(_: string, __: 'accept' | 'reject', ___?: string): Promise<void> {
      return
    },

    async getRequests(): Promise<{ incoming: MatchRequest[]; outgoing: MatchRequest[] }> {
      return { incoming: mockMatchRequestsData, outgoing: [] }
    },

    async updateMatchingSession(_: 'daily' | 'weekly' | 'on_demand', __?: 'active' | 'paused'): Promise<void> {
      return
    },

    async getMatchingSession(): Promise<{ session_type: string; status: string; last_match_run: string; next_match_run: string }> {
      return {
        session_type: 'daily',
        status: 'active',
        last_match_run: new Date().toISOString(),
        next_match_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    },

    async getStats(): Promise<MatchingStats> {
      return mockMatchingStatsData
    },

    async getUserProfile(): Promise<{ profile: UserProfile }> {
      return {
        profile: {
          id: 'demo-user-1',
          name: 'Demo User',
          displayName: 'Demo User',
          display_name: 'Demo User',
          age: 28,
          gender: 'Other',
          occupation: 'Software Engineer',
          interests: ['Technology', 'Music', 'Travel'],
          rating: 4.8,
          total_rides: 45,
          verified: true
        }
      }
    },

    async getAvailableUsers(_: MatchFilters = {}): Promise<{ users: UserProfile[]; totalCount: number }> {
      return {
        users: [
          {
            id: 'demo-user-2',
            name: 'Sarah Johnson',
            displayName: 'Sarah J.',
            display_name: 'Sarah J.',
            age: 26,
            gender: 'Female',
            occupation: 'Designer',
            interests: ['Art', 'Photography', 'Coffee'],
            rating: 4.9,
            total_rides: 32,
            verified: true
          },
          {
            id: 'demo-user-3',
            name: 'Mike Chen',
            displayName: 'Mike C.',
            display_name: 'Mike C.',
            age: 30,
            gender: 'Male',
            occupation: 'Marketing',
            interests: ['Sports', 'Gaming', 'Food'],
            rating: 4.7,
            total_rides: 28,
            verified: true
          }
        ],
        totalCount: 2
      }
    },

    async calculateMatchScores(userIds: string[]): Promise<{ matchScores: MatchScore[] }> {
      return {
        matchScores: userIds.map(id => ({
          user_id: id,
          compatibility_score: Math.random() * 0.4 + 0.6,
          route_overlap: Math.random() * 0.3 + 0.7,
          estimated_detour_minutes: Math.floor(Math.random() * 10) + 5,
          match_reasons: ['Similar route', 'Close pickup location', 'Compatible schedule'],
          totalScore: Math.random() * 0.4 + 0.6
        }))
      }
    }
  }

  return service
}
