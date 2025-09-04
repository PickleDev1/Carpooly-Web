import { mockPotentialMatches, mockMatchingPreferences, mockMatchRequests, mockMatchingStats } from '@/mocks/data/matching'
import { MatchFilters, MatchingPreferences, PotentialMatch, MatchRequest } from './matching'

// DEMO MODE: Fast mock service that bypasses all authentication and API calls
export const useMatchingServiceDemo = () => {
  return {
    // Get user's matching preferences
    async getPreferences(): Promise<MatchingPreferences> {
      console.log("🎬 DEMO MODE: Using mock data for preferences")
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
      return {
        success: true,
        matchesFound: mockPotentialMatches.length,
        message: `Found ${mockPotentialMatches.length} potential matches using mock data`,
        processingTimeMs: 150
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
      console.log("🎬 DEMO MODE: Using mock data for potential matches")
      return {
        success: true,
        pendingMatches: mockPotentialMatches,
        acceptedMatches: [],
        expiredMatches: [],
        totalAvailable: mockPotentialMatches.length,
        filtersApplied: filters || {}
      }
    },

    // Send carpool request
    async sendRequest(toUserId: string, potentialMatchId: string, message?: string): Promise<void> {
      console.log("🎬 DEMO MODE: Mock send request", { toUserId, potentialMatchId, message })
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Accept or reject a carpool request
    async respondToRequest(requestId: string, action: 'accept' | 'reject', message?: string): Promise<void> {
      console.log("🎬 DEMO MODE: Mock respond to request", { requestId, action, message })
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Get match requests
    async getRequests(): Promise<{
      incoming: MatchRequest[]
      outgoing: MatchRequest[]
    }> {
      console.log("🎬 DEMO MODE: Using mock data for match requests")
      return {
        incoming: mockMatchRequests,
        outgoing: []
      }
    },

    // Start or update matching session
    async updateMatchingSession(sessionType: 'daily' | 'weekly' | 'on_demand', status?: 'active' | 'paused'): Promise<void> {
      console.log("🎬 DEMO MODE: Mock update matching session", { sessionType, status })
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Get matching session status
    async getMatchingSession(): Promise<{
      session_id: string
      session_type: string
      status: string
      last_match_run: string
      next_match_run: string
    }> {
      console.log("🎬 DEMO MODE: Mock get matching session")
      return {
        session_id: "demo-session-123",
        session_type: "daily",
        status: "active",
        last_match_run: new Date().toISOString(),
        next_match_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
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
      console.log("🎬 DEMO MODE: Using mock data for matching stats")
      return mockMatchingStats
    },

    // Get user profile for matching
    async getUserProfile(): Promise<{
      success: boolean
      profile: any
    }> {
      console.log("🎬 DEMO MODE: Mock get user profile")
      return {
        success: true,
        profile: {
          id: "demo-user",
          name: "Demo User",
          displayName: "Demo User"
        }
      }
    },

    // Get all available users for matching
    async getAvailableUsers(filters?: MatchFilters): Promise<{
      success: boolean
      users: any[]
      totalCount: number
    }> {
      console.log("🎬 DEMO MODE: Mock get available users")
      return {
        success: true,
        users: [],
        totalCount: 0
      }
    },

    // Calculate match scores for specific users
    async calculateMatchScores(userIds: string[]): Promise<{
      success: boolean
      matchScores: any[]
    }> {
      console.log("🎬 DEMO MODE: Mock calculate match scores")
      return {
        success: true,
        matchScores: []
      }
    }
  }
}
