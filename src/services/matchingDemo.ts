import { mockPotentialMatches, mockMatchingPreferences, mockMatchRequests, mockMatchingStats } from '@/mocks/data/matching'
import { MatchFilters, MatchingPreferences, PotentialMatch, MatchRequest } from './matching'

// DEMO MODE: Fast mock service that bypasses all authentication and API calls
export const useMatchingServiceDemo = () => {
  return {
    // Get user's matching preferences
    async getPreferences(): Promise<MatchingPreferences> {
      console.log("🎬 DEMO MODE: Using mock data for preferences")
      // Ensure all required fields from MatchingPreferences are present
      const defaults: MatchingPreferences = {
        maxDetourMinutes: 20,
        preferredGroupSize: 3,
        maxPickupDistance: 8,
        preferredGender: ['any'],
        preferredAgeRange: { min: 25, max: 40 },
        smokingPreference: 'non_smoking',
        musicPreference: 'flexible',
        conversationPreference: 'casual',
        driverPreference: 'flexible',
        scheduleFlexibilityMinutes: 30,
        maxPickupDistanceMiles: 5,
        minCompatibilityScore: 70,
        notificationPreferences: { email: true, push: true, sms: false },
        userDemographics: {
          age: 28,
          gender: 'prefer_not_to_say',
          occupation: '',
          interests: [],
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
      const merged: MatchingPreferences = {
        ...defaults,
        ...mockMatchingPreferences,
        userDemographics: {
          ...defaults.userDemographics,
          ...(mockMatchingPreferences as any).userDemographics
        },
        demographicPreferences: {
          ...defaults.demographicPreferences,
          ...(mockMatchingPreferences as any).demographicPreferences
        }
      }
      return merged
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

    // Respond to a carpool request
    async respondToRequest(requestId: string, action: 'accept' | 'reject', message?: string): Promise<void> {
      console.log("🎬 DEMO MODE: Mock respond to request", { requestId, action, message })
      await new Promise(resolve => setTimeout(resolve, 100))
    },

    // Get requests
    async getRequests(): Promise<{ incoming: MatchRequest[]; outgoing: MatchRequest[] }> {
      console.log("🎬 DEMO MODE: Using mock data for requests")
      await new Promise(resolve => setTimeout(resolve, 100))
      return { incoming: mockMatchRequests, outgoing: [] }
    },

    // Get stats
    async getStats() {
      console.log("🎬 DEMO MODE: Using mock data for stats")
      await new Promise(resolve => setTimeout(resolve, 100))
      return mockMatchingStats
    }
  }
}
