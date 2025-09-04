import { PotentialMatch, UserProfile, MatchScore, UserMatchingPreferences, MatchRequest } from '@/services/matching'

// Mock user profiles for testing - enhanced for VC demo
export const mockUserProfiles: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    displayName: 'Sarah J.',
    display_name: 'Sarah J.',
    age: 28,
    gender: 'Female',
    occupation: 'Software Engineer',
    interests: ['Technology', 'Music', 'Travel'],
    rating: 4.8,
    total_rides: 45,
    verified: true,
    homeLocation: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    schedule: {
      departureTime: '08:30',
      flexibilityMinutes: 15,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    preferences: {
      maxDetourMinutes: 20,
      maxPickupDistanceMiles: 8,
      preferredGroupSize: 3,
      driverPreference: 'flexible',
      demographicPreferences: {
        agePreferences: ['26-35', '36-45'],
        genderPreferences: ['any'],
        occupationPreferences: ['Software Engineer', 'Designer'],
        studentPreference: 'both'
      }
    }
  },
  {
    id: 'user-2',
    name: 'Mike Chen',
    displayName: 'Mike C.',
    display_name: 'Mike C.',
    age: 30,
    gender: 'Male',
    occupation: 'Marketing Manager',
    interests: ['Sports', 'Gaming', 'Food'],
    rating: 4.7,
    total_rides: 32,
    verified: true,
    homeLocation: {
      latitude: 37.7849,
      longitude: -122.4094
    },
    schedule: {
      departureTime: '09:00',
      flexibilityMinutes: 10,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    preferences: {
      maxDetourMinutes: 15,
      maxPickupDistanceMiles: 6,
      preferredGroupSize: 4,
      driverPreference: 'prefer_driving',
      demographicPreferences: {
        agePreferences: ['26-35', '36-45'],
        genderPreferences: ['any'],
        occupationPreferences: ['Marketing', 'Sales'],
        studentPreference: 'both'
      }
    }
  }
]

// Mock potential matches with the correct interface
export const mockPotentialMatches: PotentialMatch[] = [
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

// Mock match requests
export const mockMatchRequests: MatchRequest[] = [
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
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString() // 22 hours from now
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
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString() // 23 hours from now
  }
]

// Mock matching preferences
export const mockMatchingPreferences: UserMatchingPreferences = {
  maxDetourMinutes: 20,
  preferredGroupSize: 3,
  maxPickupDistance: 8,
  preferredGender: ['any'],
  preferredAgeRange: {
    min: 25,
    max: 40
  },
  smokingPreference: 'non_smoking',
  musicPreference: 'flexible',
  conversationPreference: 'casual',
  userDemographics: {
    age: 28,
    gender: 'Other',
    occupation: 'Software Engineer',
    interests: ['Technology', 'Music', 'Travel']
  },
  demographicPreferences: {
    ageRange: {
      min: 25,
      max: 40
    },
    genderPreferences: ['any'],
    occupationPreferences: ['Software Engineer', 'Designer', 'Marketing']
  }
}

// Mock matching statistics
export const mockMatchingStats = {
  total_matches_generated: 6,
  match_acceptance_rate: 0.78,
  average_compatibility_score: 0.85,
  total_carpools_formed: 3,
  total_savings: 798,
  average_route_overlap: 0.7,
  most_common_match_reasons: ["close_location", "similar_schedule"],
  geographic_distribution: {
    nearby: 4,
    medium_distance: 2,
    far: 0
  },
  time_to_acceptance: 24,
  monthly_trends: [
    { month: "Jan", matches: 10, acceptances: 7 },
    { month: "Feb", matches: 12, acceptances: 9 }
  ]
}
