import { useAuth } from '@clerk/nextjs'
import { mockPotentialMatches, mockMatchingPreferences, mockMatchRequests, mockMatchingStats } from '@/mocks/data/matching'

const API_URL = process.env.NEXT_PUBLIC_API_URL

console.log('🔐 Matching Service: API_URL:', API_URL)
console.log('🔐 Matching Service: API_URL exists:', !!API_URL)

// Enhanced Matching Preferences - matches backend exactly
export interface UserMatchingPreferences {
  maxDetourMinutes: number
  preferredGroupSize: number
  driverPreference: 'driver' | 'passenger' | 'flexible'
  scheduleFlexibilityMinutes: number
  maxPickupDistanceMiles: number
  minCompatibilityScore: number
  notificationPreferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
  userDemographics: {
    ageRange: string
    gender: string
    occupation: string
    studentStatus: string
    company: string
  }
  demographicPreferences: {
    agePreferences: string[]
    genderPreferences: string[]
    studentPreference: string
    occupationPreferences: string[]
  }
}

// Keep old interface for backward compatibility
export interface MatchingPreferences extends UserMatchingPreferences {}

// Enhanced User Profile Interface - matches backend exactly
export interface UserProfile {
  id: string
  name: string
  displayName: string
  homeLocation: {
    latitude: number
    longitude: number
    address: string
  }
  destinationLocation: {
    latitude: number
    longitude: number
    address: string
  }
  schedule: {
    departureTime: string // "08:30"
    frequency: 'daily' | 'weekly' | 'custom'
    flexibilityMinutes: number
    daysOfWeek: string[] // ["monday", "tuesday", ...]
  }
  currentGroupSize: number
  isAvailableForMatching: boolean
  lastActive: string
  preferences: UserMatchingPreferences
}

// Match Score Interface - matches backend exactly
export interface MatchScore {
  totalScore: number
  locationScore: number
  scheduleScore: number
  demographicScore: number
  routeScore: number
  groupSizeScore: number
  roleCompatibilityScore: number
  reasons: string[]
  dealbreakers: string[]
}

// Enhanced Potential Match - matches backend exactly
export interface PotentialMatch {
  id: string
  user1Id: string
  user2Id: string
  compatibilityScore: number
  routeOverlapPercentage: number
  totalDistanceMiles: number
  estimatedSavingsPerMonth: number
  matchReasons: string[]
  status: 'active' | 'expired' | 'accepted' | 'rejected'
  expiresAt: string
  createdAt: string
  updatedAt: string
  user1: UserProfile
  user2: UserProfile
  matchScore: MatchScore
}

// Match Filters - matches backend exactly
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
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  created_at: string
  expires_at: string
}

export const useMatchingService = () => {
  const { getToken } = useAuth()

  const getHeaders = async () => {
    const token = await getToken()
    console.log('🔐 Matching Service: Token received:', token ? 'Token exists' : 'No token')
    console.log('🔐 Matching Service: Token length:', token ? token.length : 0)
    console.log('🔐 Matching Service: Token preview:', token ? `${token.substring(0, 20)}...` : 'No token')
    
    if (!token) {
      console.error('🔐 Matching Service: No token available!')
      throw new Error('No authentication token available')
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    
    console.log('🔐 Matching Service: Headers being sent:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': headers['Authorization'] ? 'Bearer [TOKEN]' : 'No Authorization',
    })
    
    return headers
  }

  return {
    // Get user's matching preferences
    async getPreferences(): Promise<MatchingPreferences> {
      try {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/matching/preferences`, { headers })
        
        if (!response.ok) {
          throw new Error('Failed to fetch preferences')
        }
        
        return response.json()
      } catch (error) {
        // Return mock data for development when API fails
        console.log('🔧 API failed, returning mock preferences for development')
        return mockMatchingPreferences
      }
    },

    // Update user's matching preferences
    async updatePreferences(preferences: Partial<MatchingPreferences>): Promise<void> {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/preferences`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(preferences)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }
    },

    // Find potential matches - updated to match backend exactly
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
      try {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/matching/find-matches`, {
          method: 'POST',
          headers,
          body: JSON.stringify(request)
        })
        
        if (!response.ok) {
          throw new Error('Failed to find matches')
        }
        
        return response.json()
      } catch (error) {
        // Return mock data for development when API fails
        console.log('🔧 API failed, returning mock find matches response for development')
        return {
          success: true,
          matchesFound: mockPotentialMatches.length,
          message: `Found ${mockPotentialMatches.length} potential matches using mock data`,
          processingTimeMs: 150
        }
      }
    },

    // Get potential matches - updated to match backend exactly
    async getPotentialMatches(filters?: MatchFilters): Promise<{
      success: boolean
      pendingMatches: PotentialMatch[]
      acceptedMatches: PotentialMatch[]
      expiredMatches: PotentialMatch[]
      totalAvailable: number
      filtersApplied: MatchFilters
    }> {
      const headers = await getHeaders()
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : ''
        const response = await fetch(`${API_URL}/api/matching/potential-matches${queryParams}`, { 
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch potential matches: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds')
        }
        
        // Return mock data for development when API fails
        console.log('🔧 API failed, returning mock data for development')
        return {
          success: true,
          pendingMatches: mockPotentialMatches,
          acceptedMatches: [],
          expiredMatches: [],
          totalAvailable: mockPotentialMatches.length,
          filtersApplied: filters || {}
        }
      }
    },

    // Send carpool request
    async sendRequest(toUserId: string, potentialMatchId: string, message?: string): Promise<void> {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to_user_id: toUserId,
          potential_match_id: potentialMatchId,
          message
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send request')
      }
    },

    // Accept or reject a carpool request
    async respondToRequest(requestId: string, action: 'accept' | 'reject', message?: string): Promise<void> {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/request/${requestId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: action,
          message
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} request`)
      }
    },

    // Get match requests
    async getRequests(): Promise<{
      incoming: MatchRequest[]
      outgoing: MatchRequest[]
    }> {
      const headers = await getHeaders()
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        const response = await fetch(`${API_URL}/api/matching/requests`, { 
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText}`)
        }
        
        return response.json() as Promise<{ incoming: MatchRequest[]; outgoing: MatchRequest[] }>
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds')
        }
        
        // Return mock data for development when API fails
        console.log('🔧 API failed, returning mock requests for development')
        return {
          incoming: mockMatchRequests,
          outgoing: []
        }
      }
    },

    // Start or update matching session
    async updateMatchingSession(sessionType: 'daily' | 'weekly' | 'on_demand', status?: 'active' | 'paused'): Promise<void> {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_type: sessionType,
          status: status || 'active'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update matching session')
      }
    },

    // Get matching session status
    async getMatchingSession(): Promise<{
      session_id: string
      session_type: string
      status: string
      last_match_run: string
      next_match_run: string
    }> {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/session`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to fetch matching session')
      }
      
      return response.json()
    },

    // Get matching statistics
    async getStats(): Promise<{
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
    }> {
      const headers = await getHeaders()
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        const response = await fetch(`${API_URL}/api/matching/stats`, { 
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds')
        }
        throw error
      }
    },

    // NEW: Get user profile for matching - matches backend exactly
    async getUserProfile(): Promise<{
      success: boolean
      profile: UserProfile
    }> {
      const headers = await getHeaders()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      try {
        const response = await fetch(`${API_URL}/api/matching/user-profile`, { 
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds')
        }
        throw error
      }
    },

    // NEW: Get all available users for matching - matches backend exactly
    async getAvailableUsers(filters?: MatchFilters): Promise<{
      success: boolean
      users: UserProfile[]
      totalCount: number
    }> {
      const headers = await getHeaders()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      try {
        const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : ''
        const response = await fetch(`${API_URL}/api/matching/available-users${queryParams}`, { 
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch available users: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 10 seconds')
        }
        throw error
      }
    },

    // NEW: Calculate match scores for specific users - matches backend exactly
    async calculateMatchScores(userIds: string[]): Promise<{
      success: boolean
      matchScores: MatchScore[]
    }> {
      const headers = await getHeaders()
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for calculations
      
      try {
        const response = await fetch(`${API_URL}/api/matching/calculate-scores`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_ids: userIds }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to calculate match scores: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out after 15 seconds')
        }
        throw error
      }
    }
  }
} 