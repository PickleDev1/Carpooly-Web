import { useAuth } from '@clerk/nextjs'
import { mockPotentialMatches, mockMatchingPreferences, mockMatchRequests, mockMatchingStats } from '@/mocks/data/matching'

// DEMO MODE: Completely disable all API calls - only return mock data
const API_URL = process.env.NEXT_PUBLIC_API_URL

console.log('🎬 DEMO MODE: Matching service using ONLY mock data - no API calls')

// Enhanced Matching Preferences - matches backend exactly
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

export interface PotentialMatch {
  id: string
  user: {
    id: string
    name: string
    display_name: string
    profile_picture?: string
  }
  compatibility_score: number
  route_overlap: number
  estimated_detour_minutes: number
  pickup_location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  dropoff_location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  schedule: {
    departure_time: string
    return_time?: string
    days: string[]
  }
  preferences: {
    smoking: boolean
    music: string
    conversation: string
  }
  created_at: string
  expires_at: string
}

export interface MatchFilters {
  maxDetourMinutes?: number
  preferredGroupSize?: number
  maxPickupDistance?: number
  preferredGender?: string[]
  preferredAgeRange?: {
    min: number
    max: number
  }
  smokingPreference?: string
  musicPreference?: string
  conversationPreference?: string
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
}

export interface UserProfile {
  id: string
  name: string
  display_name: string
  profile_picture?: string
  age: number
  gender: string
  occupation: string
  interests: string[]
  rating: number
  total_rides: number
  verified: boolean
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

// DEMO MODE: Real matching service that returns ONLY mock data
export const useMatchingService = () => {
  const { getToken } = useAuth()
  
  return {
    // Get user's matching preferences
    async getPreferences(): Promise<MatchingPreferences> {
      console.log("🎬 DEMO MODE: Returning mock preferences")
      return mockMatchingPreferences
    },

    // Update user's matching preferences
    async updatePreferences(preferences: Partial<MatchingPreferences>): Promise<void> {
      console.log("🎬 DEMO MODE: Mock update preferences", preferences)
      // Simulate a small delay for realism
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Find potential matches
    async findMatches(request: {
      forceRefresh: boolean
      limit: number
      filters?: MatchFilters
    }): Promise<{ 
      success: boolean
      matchesFound: number
      message: string
      processingTimeMs: number
    }> {
      console.log("🎬 DEMO MODE: Mock find matches", request)
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        matchesFound: mockPotentialMatches.length,
        message: `Found ${mockPotentialMatches.length} potential matches using mock data`,
        processingTimeMs: 100
      }
    },

    // Get potential matches
    async getPotentialMatches(filters?: MatchFilters): Promise<{
      success: boolean
      pendingMatches: PotentialMatch[]
      acceptedMatches: PotentialMatch[]
      expiredMatches: PotentialMatch[]
      totalAvailable: number
      filtersApplied: MatchFilters
    }> {
      console.log("🎬 DEMO MODE: Returning mock potential matches")
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        pendingMatches: mockPotentialMatches,
        acceptedMatches: [],
        expiredMatches: [],
        totalAvailable: mockPotentialMatches.length,
        filtersApplied: filters || {}
      }
    },

    // Send a match request
    async sendRequest(toUserId: string, potentialMatchId: string, message?: string): Promise<void> {
      console.log("🎬 DEMO MODE: Mock send request", { toUserId, potentialMatchId, message })
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Respond to a match request
    async respondToRequest(requestId: string, action: 'accept' | 'reject', message?: string): Promise<void> {
      console.log("🎬 DEMO MODE: Mock respond to request", { requestId, action, message })
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Get match requests
    async getRequests(): Promise<{ incoming: MatchRequest[]; outgoing: MatchRequest[] }> {
      console.log("🎬 DEMO MODE: Returning mock requests")
      await new Promise(resolve => setTimeout(resolve, 100))
      return { incoming: mockMatchRequests, outgoing: [] }
    },

    // Update matching session
    async updateMatchingSession(sessionType: 'daily' | 'weekly' | 'on_demand', status?: 'active' | 'paused'): Promise<void> {
      console.log("🎬 DEMO MODE: Mock update matching session", { sessionType, status })
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Get matching session
    async getMatchingSession(): Promise<{
      session_type: string
      status: string
      last_match_run: string
      next_match_run: string
    }> {
      console.log("🎬 DEMO MODE: Returning mock matching session")
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        session_type: 'daily',
        status: 'active',
        last_match_run: new Date().toISOString(),
        next_match_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    },

    // Get matching statistics
    async getStats(): Promise<MatchingStats> {
      console.log("🎬 DEMO MODE: Returning mock stats")
      await new Promise(resolve => setTimeout(resolve, 100))
      return mockMatchingStats
    },

    // Get user profile
    async getUserProfile(): Promise<{
      profile: UserProfile
    }> {
      console.log("🎬 DEMO MODE: Returning mock user profile")
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        profile: {
          id: 'demo-user-1',
          name: 'Demo User',
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

    // Get available users
    async getAvailableUsers(filters?: MatchFilters): Promise<{
      users: UserProfile[]
      totalCount: number
    }> {
      console.log("🎬 DEMO MODE: Returning mock available users")
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        users: [
          {
            id: 'demo-user-2',
            name: 'Sarah Johnson',
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

    // Calculate match scores
    async calculateMatchScores(userIds: string[]): Promise<{
      matchScores: MatchScore[]
    }> {
      console.log("🎬 DEMO MODE: Returning mock match scores", userIds)
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        matchScores: userIds.map(id => ({
          user_id: id,
          compatibility_score: Math.random() * 0.4 + 0.6, // 0.6-1.0
          route_overlap: Math.random() * 0.3 + 0.7, // 0.7-1.0
          estimated_detour_minutes: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
          match_reasons: ['Similar route', 'Close pickup location', 'Compatible schedule']
        }))
      }
    }
  }
}
