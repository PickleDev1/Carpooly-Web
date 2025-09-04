import { PotentialMatch, UserProfile, MatchScore, UserMatchingPreferences, MatchRequest } from '@/services/matching'

// Mock user profiles for testing - enhanced for VC demo
export const mockUserProfiles: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    displayName: 'Sarah J.',
    homeLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'Mission District, San Francisco'
    },
    destinationLocation: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: 'Downtown San Jose'
    },
    schedule: {
      departureTime: '08:30',
      frequency: 'daily',
      flexibilityMinutes: 15,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    isAvailableForMatching: true,
    lastActive: new Date().toISOString(),
    preferences: {
      maxDetourMinutes: 20,
      preferredGroupSize: 3,
      driverPreference: 'flexible',
      scheduleFlexibilityMinutes: 15,
      maxPickupDistanceMiles: 8,
      minCompatibilityScore: 75,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      },
      userDemographics: {
        ageRange: '26-35',
        gender: 'female',
        occupation: 'Software Engineer',
        studentStatus: 'not_student',
        company: 'Tech Corp'
      },
      demographicPreferences: {
        agePreferences: ['26-35', '36-45'],
        genderPreferences: ['any'],
        studentPreference: 'both',
        occupationPreferences: ['Software Engineer', 'Designer', 'Product Manager']
      }
    }
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    displayName: 'Mike C.',
    homeLocation: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: 'North Beach, San Francisco'
    },
    destinationLocation: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: 'Downtown San Jose'
    },
    schedule: {
      departureTime: '08:45',
      frequency: 'daily',
      flexibilityMinutes: 20,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    isAvailableForMatching: true,
    lastActive: new Date().toISOString(),
    preferences: {
      maxDetourMinutes: 25,
      preferredGroupSize: 4,
      driverPreference: 'driver',
      scheduleFlexibilityMinutes: 20,
      maxPickupDistanceMiles: 10,
      minCompatibilityScore: 70,
      notificationPreferences: {
        email: true,
        push: true,
        sms: true
      },
      userDemographics: {
        ageRange: '26-35',
        gender: 'male',
        occupation: 'Product Manager',
        studentStatus: 'not_student',
        company: 'Startup Inc'
      },
      demographicPreferences: {
        agePreferences: ['26-35', '36-45', '46-55'],
        genderPreferences: ['any'],
        studentPreference: 'both',
        occupationPreferences: ['Software Engineer', 'Product Manager', 'Designer']
      }
    }
  },
  {
    id: 'user-3',
    name: 'Emily Rodriguez',
    displayName: 'Emily R.',
    homeLocation: {
      latitude: 37.7949,
      longitude: -122.3994,
      address: 'Marina District, San Francisco'
    },
    destinationLocation: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: 'Downtown San Jose'
    },
    schedule: {
      departureTime: '09:00',
      frequency: 'daily',
      flexibilityMinutes: 30,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    isAvailableForMatching: true,
    lastActive: new Date().toISOString(),
    preferences: {
      maxDetourMinutes: 30,
      preferredGroupSize: 3,
      driverPreference: 'passenger',
      scheduleFlexibilityMinutes: 30,
      maxPickupDistanceMiles: 12,
      minCompatibilityScore: 65,
      notificationPreferences: {
        email: true,
        push: false,
        sms: false
      },
      userDemographics: {
        ageRange: '18-25',
        gender: 'female',
        occupation: 'Graduate Student',
        studentStatus: 'graduate',
        company: 'Stanford University'
      },
      demographicPreferences: {
        agePreferences: ['18-25', '26-35'],
        genderPreferences: ['female', 'any'],
        studentPreference: 'students_only',
        occupationPreferences: ['Student', 'Researcher', 'Academic']
      }
    }
  },
  {
    id: 'user-4',
    name: 'David Kim',
    displayName: 'David K.',
    homeLocation: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: 'Castro District, San Francisco'
    },
    destinationLocation: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: 'Downtown San Jose'
    },
    schedule: {
      departureTime: '07:45',
      frequency: 'daily',
      flexibilityMinutes: 10,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    isAvailableForMatching: true,
    lastActive: new Date().toISOString(),
    preferences: {
      maxDetourMinutes: 15,
      preferredGroupSize: 2,
      driverPreference: 'driver',
      scheduleFlexibilityMinutes: 10,
      maxPickupDistanceMiles: 5,
      minCompatibilityScore: 80,
      notificationPreferences: {
        email: true,
        push: true,
        sms: true
      },
      userDemographics: {
        ageRange: '36-45',
        gender: 'male',
        occupation: 'Senior Engineer',
        studentStatus: 'not_student',
        company: 'Big Tech Corp'
      },
      demographicPreferences: {
        agePreferences: ['26-35', '36-45'],
        genderPreferences: ['any'],
        studentPreference: 'professionals_only',
        occupationPreferences: ['Software Engineer', 'Senior Engineer', 'Tech Lead']
      }
    }
  },
  {
    id: 'user-5',
    name: 'Lisa Thompson',
    displayName: 'Lisa T.',
    homeLocation: {
      latitude: 37.8049,
      longitude: -122.3894,
      address: 'Pacific Heights, San Francisco'
    },
    destinationLocation: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: 'Downtown San Jose'
    },
    schedule: {
      departureTime: '08:15',
      frequency: 'daily',
      flexibilityMinutes: 25,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    isAvailableForMatching: true,
    lastActive: new Date().toISOString(),
    preferences: {
      maxDetourMinutes: 35,
      preferredGroupSize: 5,
      driverPreference: 'flexible',
      scheduleFlexibilityMinutes: 25,
      maxPickupDistanceMiles: 15,
      minCompatibilityScore: 60,
      notificationPreferences: {
        email: false,
        push: true,
        sms: true
      },
      userDemographics: {
        ageRange: '46-55',
        gender: 'female',
        occupation: 'Marketing Director',
        studentStatus: 'not_student',
        company: 'Marketing Solutions Inc'
      },
      demographicPreferences: {
        agePreferences: ['36-45', '46-55', '56-65'],
        genderPreferences: ['female', 'any'],
        studentPreference: 'professionals_only',
        occupationPreferences: ['Marketing', 'Sales', 'Business Development']
      }
    }
  },
  {
    id: 'user-6',
    name: 'Alex Johnson',
    displayName: 'Alex J.',
    homeLocation: {
      latitude: 37.7549,
      longitude: -122.4194,
      address: 'Hayes Valley, San Francisco'
    },
    destinationLocation: {
      latitude: 37.3382,
      longitude: -121.8863,
      address: 'Downtown San Jose'
    },
    schedule: {
      departureTime: '09:30',
      frequency: 'daily',
      flexibilityMinutes: 45,
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    currentGroupSize: 1,
    isAvailableForMatching: true,
    lastActive: new Date().toISOString(),
    preferences: {
      maxDetourMinutes: 40,
      preferredGroupSize: 4,
      driverPreference: 'passenger',
      scheduleFlexibilityMinutes: 45,
      maxPickupDistanceMiles: 18,
      minCompatibilityScore: 55,
      notificationPreferences: {
        email: true,
        push: true,
        sms: false
      },
      userDemographics: {
        ageRange: '18-25',
        gender: 'non-binary',
        occupation: 'UX Designer',
        studentStatus: 'not_student',
        company: 'Design Studio'
      },
      demographicPreferences: {
        agePreferences: ['18-25', '26-35'],
        genderPreferences: ['any'],
        studentPreference: 'both',
        occupationPreferences: ['Designer', 'Creative', 'Artist']
      }
    }
  }
]

// Enhanced mock match scores with realistic breakdowns
export const mockMatchScores: MatchScore[] = [
  {
    totalScore: 0.89,
    locationScore: 0.95,
    scheduleScore: 0.85,
    demographicScore: 0.90,
    routeScore: 0.80,
    groupSizeScore: 0.95,
    roleCompatibilityScore: 0.95,
    reasons: [
      'Very close pickup location (2.1 miles)',
      'Perfect departure time match (within 15 min)',
      'Age preference match (26-35)',
      'Efficient group size (3 people)',
      'Perfect driver-passenger match',
      'Same travel days (Mon-Fri)'
    ],
    dealbreakers: []
  },
  {
    totalScore: 0.76,
    locationScore: 0.80,
    scheduleScore: 0.75,
    demographicScore: 0.85,
    routeScore: 0.70,
    groupSizeScore: 0.85,
    roleCompatibilityScore: 0.75,
    reasons: [
      'Close pickup location (3.8 miles)',
      'Good departure time match (within 30 min)',
      'Gender preference match',
      'Good group size compatibility',
      'Flexible driver preference'
    ],
    dealbreakers: ['Moderate detour time (18 min)']
  },
  {
    totalScore: 0.72,
    locationScore: 0.65,
    scheduleScore: 0.80,
    demographicScore: 0.75,
    routeScore: 0.60,
    groupSizeScore: 0.80,
    roleCompatibilityScore: 0.85,
    reasons: [
      'Reasonable pickup distance (5.2 miles)',
      'Good departure time match (within 45 min)',
      'Student status match',
      'Academic occupation preference'
    ],
    dealbreakers: ['Pickup distance a bit far', 'Higher detour time (25 min)']
  },
  {
    totalScore: 0.68,
    locationScore: 0.70,
    scheduleScore: 0.65,
    demographicScore: 0.80,
    routeScore: 0.55,
    groupSizeScore: 0.75,
    roleCompatibilityScore: 0.90,
    reasons: [
      'Acceptable pickup distance (6.8 miles)',
      'Professional occupation match',
      'Good role compatibility'
    ],
    dealbreakers: ['Early departure time (7:45 AM)', 'Limited schedule flexibility']
  },
  {
    totalScore: 0.61,
    locationScore: 0.55,
    scheduleScore: 0.70,
    demographicScore: 0.65,
    routeScore: 0.50,
    groupSizeScore: 0.70,
    roleCompatibilityScore: 0.80,
    reasons: [
      'Flexible schedule preference',
      'Large group size preference (5 people)',
      'Marketing occupation match'
    ],
    dealbreakers: ['Long pickup distance (12.3 miles)', 'High detour tolerance needed']
  },
  {
    totalScore: 0.58,
    locationScore: 0.60,
    scheduleScore: 0.65,
    demographicScore: 0.70,
    routeScore: 0.45,
    groupSizeScore: 0.65,
    roleCompatibilityScore: 0.75,
    reasons: [
      'Creative occupation match',
      'Flexible schedule preference',
      'Good demographic compatibility'
    ],
    dealbreakers: ['Late departure time (9:30 AM)', 'Long pickup distance (14.1 miles)']
  }
]

// Enhanced mock potential matches with realistic data
export const mockPotentialMatches: PotentialMatch[] = [
  {
    id: 'match-1',
    user1Id: 'current-user',
    user2Id: 'user-1',
    compatibilityScore: 0.89,
    routeOverlapPercentage: 0.94,
    totalDistanceMiles: 2.1,
    estimatedSavingsPerMonth: 187,
    matchReasons: [
      'Very close pickup location (2.1 miles)',
      'Perfect departure time match (within 15 min)',
      'Age preference match (26-35)',
      'Efficient group size (3 people)',
      'Perfect driver-passenger match',
      'Same travel days (Mon-Fri)'
    ],
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user1: mockUserProfiles[0], // This would be the current user
    user2: mockUserProfiles[0],
    matchScore: mockMatchScores[0]
  },
  {
    id: 'match-2',
    user1Id: 'current-user',
    user2Id: 'user-2',
    compatibilityScore: 0.76,
    routeOverlapPercentage: 0.82,
    totalDistanceMiles: 3.8,
    estimatedSavingsPerMonth: 156,
    matchReasons: [
      'Close pickup location (3.8 miles)',
      'Good departure time match (within 30 min)',
      'Gender preference match',
      'Good group size compatibility',
      'Flexible driver preference'
    ],
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user1: mockUserProfiles[0],
    user2: mockUserProfiles[1],
    matchScore: mockMatchScores[1]
  },
  {
    id: 'match-3',
    user1Id: 'current-user',
    user2Id: 'user-3',
    compatibilityScore: 0.72,
    routeOverlapPercentage: 0.71,
    totalDistanceMiles: 5.2,
    estimatedSavingsPerMonth: 142,
    matchReasons: [
      'Reasonable pickup distance (5.2 miles)',
      'Good departure time match (within 45 min)',
      'Student status match',
      'Academic occupation preference'
    ],
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user1: mockUserProfiles[0],
    user2: mockUserProfiles[2],
    matchScore: mockMatchScores[2]
  },
  {
    id: 'match-4',
    user1Id: 'current-user',
    user2Id: 'user-4',
    compatibilityScore: 0.68,
    routeOverlapPercentage: 0.68,
    totalDistanceMiles: 6.8,
    estimatedSavingsPerMonth: 128,
    matchReasons: [
      'Acceptable pickup distance (6.8 miles)',
      'Professional occupation match',
      'Good role compatibility'
    ],
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user1: mockUserProfiles[0],
    user2: mockUserProfiles[3],
    matchScore: mockMatchScores[3]
  },
  {
    id: 'match-5',
    user1Id: 'current-user',
    user2Id: 'user-5',
    compatibilityScore: 0.61,
    routeOverlapPercentage: 0.59,
    totalDistanceMiles: 12.3,
    estimatedSavingsPerMonth: 98,
    matchReasons: [
      'Flexible schedule preference',
      'Large group size preference (5 people)',
      'Marketing occupation match'
    ],
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user1: mockUserProfiles[0],
    user2: mockUserProfiles[4],
    matchScore: mockMatchScores[4]
  },
  {
    id: 'match-6',
    user1Id: 'current-user',
    user2Id: 'user-6',
    compatibilityScore: 0.58,
    routeOverlapPercentage: 0.55,
    totalDistanceMiles: 14.1,
    estimatedSavingsPerMonth: 87,
    matchReasons: [
      'Creative occupation match',
      'Flexible schedule preference',
      'Good demographic compatibility'
    ],
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user1: mockUserProfiles[0],
    user2: mockUserProfiles[5],
    matchScore: mockMatchScores[5]
  }
]

// Enhanced mock matching preferences with realistic data
export const mockMatchingPreferences: UserMatchingPreferences = {
  maxDetourMinutes: 25,
  preferredGroupSize: 3,
  driverPreference: 'flexible',
  scheduleFlexibilityMinutes: 20,
  maxPickupDistanceMiles: 10,
  minCompatibilityScore: 70,
  notificationPreferences: {
    email: true,
    push: true,
    sms: false
  },
  userDemographics: {
    ageRange: '26-35',
    gender: 'prefer_not_to_say',
    occupation: 'Software Engineer',
    studentStatus: 'not_student',
    company: 'Tech Company'
  },
  demographicPreferences: {
    agePreferences: ['26-35', '36-45'],
    genderPreferences: ['any'],
    studentPreference: 'both',
    occupationPreferences: ['Software Engineer', 'Designer', 'Product Manager', 'UX Designer']
  }
}

// Mock match requests for demo
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
      display_name: 'You'
    },
    status: 'pending' as const,
    message: 'Hi! I saw we have a great compatibility score. Would love to carpool together!',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
  },
  {
    id: 'request-2',
    from_user: {
      id: 'user-2',
      name: 'Michael Chen',
      display_name: 'Mike C.'
    },
    to_user: {
      id: 'current-user',
      name: 'Current User',
      display_name: 'You'
    },
    status: 'pending' as const,
    message: 'Hey! Our schedules align perfectly. Interested in starting a carpool?',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days from now
  }
]

// Mock stats for demo
export const mockMatchingStats = {
  total_matches_generated: 6,
  match_acceptance_rate: 78,
  average_compatibility_score: 85,
  total_carpools_formed: 3,
  total_savings: 798,
  average_route_overlap: 75,
  most_common_match_reasons: ["Same route", "Similar schedule", "Close location"],
  geographic_distribution: {
    nearby: 4,
    medium_distance: 2,
    far: 0
  },
  time_to_acceptance: 2.5,
  monthly_trends: [
    { month: "Jan", matches: 2, acceptances: 1 },
    { month: "Feb", matches: 4, acceptances: 2 }
  ]
}

// Legacy mock stats for backward compatibility
export const legacyMockMatchingStats = {
  potentialMatches: 6,
  activeRequests: 2,
  carpoolsFormed: 3,
  monthlySavings: 798,
  totalUsers: 1247,
  successRate: 78
} 