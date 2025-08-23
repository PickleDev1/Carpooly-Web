import { useAuth } from '@clerk/nextjs'

const API_URL = process.env.NEXT_PUBLIC_API_URL

console.log('🔐 Matching Service: API_URL:', API_URL)
console.log('🔐 Matching Service: API_URL exists:', !!API_URL)

export interface MatchingPreferences {
  max_detour_minutes: number
  preferred_group_size: number
  driver_preference: 'driver_only' | 'passenger_only' | 'flexible'
  schedule_flexibility_minutes: number
  max_pickup_distance_miles: number
  min_compatibility_score: number
  notification_preferences: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface PotentialMatch {
  id: string
  user: {
    id: string
    name: string
    display_name: string
    home_location: { lat: number; lng: number }
    destination_location?: { lat: number; lng: number } // Optional since backend uses home_location for both
  }
  compatibility_score: number
  route_overlap_percentage: number
  total_distance_miles: number
  estimated_savings_per_month: number
  match_reasons: string[]
  schedule_compatibility: {
    departure_time: string
    frequency: string
    flexibility_minutes: number
  }
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
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/preferences`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferences')
      }
      
      return response.json()
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

    // Find potential matches
    async findMatches(forceRefresh?: boolean, maxResults?: number): Promise<{ matches_found: number, message: string }> {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/find-matches`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          force_refresh: forceRefresh,
          max_results: maxResults || 10
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to find matches')
      }
      
      return response.json()
    },

    // Get potential matches
    async getPotentialMatches(): Promise<{
      pending_matches: PotentialMatch[]
      accepted_matches: PotentialMatch[]
      expired_matches: PotentialMatch[]
    }> {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/matching/potential-matches`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to fetch potential matches')
      }
      
      return response.json()
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
      const response = await fetch(`${API_URL}/api/matching/requests`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }
      
      return response.json()
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
    }
  }
} 