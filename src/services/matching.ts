/**
 * Enhanced Matching Service with Real API Integration
 * 
 * This service provides comprehensive matching functionality including:
 * - User preference management
 * - Potential match discovery
 * - Match request handling
 * - Session management
 * - Statistics and analytics
 * 
 * All methods now integrate with the real backend API with proper error handling,
 * type safety, and comprehensive logging.
 */

import { useApi } from '@/services/api';
import type {
  MatchingPreferences,
  PotentialMatch,
  MatchRequest,
  MatchingSession,
  MatchingStats,
  MatchFilters,
  MatchRequestsResponse,
  MatchRequestResponse,
  UpdateRequestResponse,
} from '../types/matching';
import type {
  MatchingPreferencesResponse,
  PotentialMatchesResponse,
  FindMatchesResponse,
  MatchingSessionResponse,
  MatchingStatsResponse,
} from '../types/api';

// Re-export types to avoid breaking existing imports from this module
export type { MatchingPreferences, PotentialMatch, MatchRequest, MatchingStats, MatchFilters } from '../types/matching';

/**
 * Custom error class for matching service errors
 * Provides detailed error information for better debugging
 */
export class MatchingServiceError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(message: string, code?: string, status?: number, details?: any) {
    super(message);
    this.name = 'MatchingServiceError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Helper function for consistent error handling across all service methods
 * Provides detailed error information and proper error classification
 */
const handleApiError = (error: any, operation: string): never => {
  console.error(`🔴 Matching Service Error - ${operation}:`, error);
  
  if (error instanceof MatchingServiceError) {
    throw error;
  }

  // Handle different types of errors based on status codes
  if (error.status === 401) {
    throw new MatchingServiceError(
      'Authentication failed. Please sign in again.',
      'AUTH_ERROR',
      401,
      { operation }
    );
  }

  if (error.status === 403) {
    throw new MatchingServiceError(
      'You do not have permission to perform this action.',
      'PERMISSION_ERROR',
      403,
      { operation }
    );
  }

  if (error.status === 404) {
    throw new MatchingServiceError(
      'The requested resource was not found.',
      'NOT_FOUND',
      404,
      { operation }
    );
  }

  if (error.status === 429) {
    throw new MatchingServiceError(
      'Too many requests. Please wait a moment and try again.',
      'RATE_LIMITED',
      429,
      { operation }
    );
  }

  if (error.status >= 500) {
    throw new MatchingServiceError(
      'Server error. Please try again later.',
      'SERVER_ERROR',
      error.status,
      { operation }
    );
  }

  // Handle validation errors (400) with structured payloads
  if (error.status === 400) {
    let parsed: any = undefined
    try {
      parsed = typeof error.message === 'string' ? JSON.parse(error.message) : error.message
    } catch {
      // ignore JSON parse failure
    }

    // Map known backend validation errors for carpool_name
    if (parsed && (parsed.error === 'MISSING_CARPOOL_NAME' || parsed.error === 'EMPTY_CARPOOL_NAME' || parsed.error === 'INVALID_CARPOOL_NAME')) {
      throw new MatchingServiceError(
        parsed.message || 'Invalid input.',
        'VALIDATION_ERROR',
        400,
        parsed
      )
    }

    throw new MatchingServiceError(
      parsed?.message || 'Invalid request.',
      'BAD_REQUEST',
      400,
      parsed
    )
  }

  // Network or other errors
  throw new MatchingServiceError(
    `Failed to ${operation}. Please check your connection and try again.`,
    'NETWORK_ERROR',
    undefined,
    { operation, originalError: error.message }
  );
};

/**
 * Helper function for request logging
 * Provides comprehensive logging for debugging and monitoring
 */
const logRequest = (method: string, endpoint: string, data?: any) => {
  console.log(`🟡 Matching Service - ${method} ${endpoint}`, data ? { data } : '');
};

/**
 * Helper function for response logging
 * Provides comprehensive logging for debugging and monitoring
 */
const logResponse = (method: string, endpoint: string, response: any) => {
  console.log(`🟢 Matching Service - ${method} ${endpoint}`, { 
    success: true, 
    dataKeys: Object.keys(response || {}),
    timestamp: new Date().toISOString()
  });
};

// ----------------------------------------------------------------------------
// Phase 2: Real API Integration - All mock data removed
// ----------------------------------------------------------------------------

export const useMatchingService = () => {
  // Phase 2: Real API Integration - All methods use live backend API
  const api = useApi();

  return {
    /**
     * Get matching preferences
     * GET /api/matching/preferences
     * 
     * Returns user's matching preferences
     */
    async getPreferences(): Promise<MatchingPreferences | { configured: false; message: string }> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/preferences`
      const url = endpoint
      logRequest('GET', url, {})
      
      try {
        const headers = await api.getHeaders()
        const response = await fetch(url, { method: 'GET', headers })
        
        if (!response.ok) {
          const text = await response.text()
          console.error('getPreferences error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        
        const text = await response.text()
        const payload = text ? JSON.parse(text) : null
        
        // Handle "not configured" response
        if (payload && payload.configured === false) {
          return payload as { configured: false; message: string }
        }
        
        // Handle normal preferences response
        if (!payload || !payload.preferences) {
          throw { status: 500, message: 'Invalid preferences response' }
        }
        
        logResponse('GET', url, { ok: true })
        return payload.preferences as MatchingPreferences
      } catch (error: any) {
        return handleApiError(error, 'fetch matching preferences')
      }
    },

    /**
     * Update matching preferences
     * PUT /api/matching/preferences
     * 
     * Updates user's matching preferences
     */
    async updatePreferences(update: Partial<MatchingPreferences>): Promise<MatchingPreferences> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/preferences`
      
      // Send all user-editable fields including new destination and schedule fields
      const payload: any = {
        max_detour_minutes: update.max_detour_minutes,
        preferred_group_size: update.preferred_group_size,
        driver_preference: update.driver_preference === 'flexible' ? 'either' : update.driver_preference,
        schedule_flexibility_minutes: update.schedule_flexibility_minutes,
        max_pickup_distance_miles: update.max_pickup_distance_miles,
        min_compatibility_score: update.min_compatibility_score,
        // New required destination fields
        destination_latitude: update.destination_latitude,
        destination_longitude: update.destination_longitude,
        destination_address: update.destination_address || `${update.destination_latitude},${update.destination_longitude}`,
        // New optional schedule fields
        arrival_time: update.arrival_time,
        commute_days: update.commute_days,
        // Keep existing fields
        notification_preferences: update.notification_preferences,
        user_demographics: update.user_demographics,
        demographic_preferences: update.demographic_preferences,
        is_active: update.is_active,
      }
      
      logRequest('PUT', endpoint, payload)
      
      try {
        const headers = await api.getHeaders()

        console.log('🚀 Matching Service - Sending payload to backend:', payload)
        console.log('🚀 Destination address in payload:', payload.destination_address)
        console.log('🚀 Destination coordinates in payload:', {
          lat: payload.destination_latitude,
          lng: payload.destination_longitude
        })
        

        const response = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify(payload) })
        if (!response.ok) {
          const text = await response.text()
          console.error('updatePreferences error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const responseData = text ? JSON.parse(text) : null
        // Accept either { preferences: ... } or direct object
        const prefs = responseData?.preferences ?? responseData ?? null
        if (!prefs) {
          throw { status: 500, message: 'Invalid update preferences response' }
        }
        logResponse('PUT', endpoint, { ok: true })
        return prefs as MatchingPreferences
      } catch (error: any) {
        return handleApiError(error, 'update matching preferences')
      }
    },

  /**
   * Get potential matches
   * GET /api/matching/potential-matches
   * 
   * Returns potential matches for the user
   */
  async getPotentialMatches(filters: MatchFilters = {}): Promise<PotentialMatchesResponse> {
    const base = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/potential-matches`
    const params = new URLSearchParams()
    
    // Basic filters
    if (filters.min_score !== undefined) params.set('min_score', String(filters.min_score))
    if (filters.max_distance !== undefined) params.set('max_distance', String(filters.max_distance))
    if (filters.limit !== undefined) params.set('limit', String(filters.limit))
    if (filters.offset !== undefined) params.set('offset', String(filters.offset))
    
    // Demographic filters
    if (filters.age_ranges?.length) params.set('age_ranges', filters.age_ranges.join(','))
    if (filters.gender_preferences?.length) params.set('gender_preferences', filters.gender_preferences.join(','))
    if (filters.genders?.length) params.set('genders', filters.genders.join(','))
    
    // Professional filters
    if (filters.student_status?.length) params.set('student_status', filters.student_status.join(','))
    if (filters.occupation_preferences?.length) params.set('occupation_preferences', filters.occupation_preferences.join(','))
    if (filters.occupations?.length) params.set('occupations', filters.occupations.join(','))
    if (filters.student_preference) params.set('student_preference', filters.student_preference)
    
    const endpoint = params.toString() ? `${base}?${params.toString()}` : base
    logRequest('GET', endpoint, { filters })
    try {
      const headers = await api.getHeaders()
      const response = await fetch(endpoint, { method: 'GET', headers })
      if (!response.ok) {
        const text = await response.text()
        console.error('getPotentialMatches error response:', response.status, text)
        throw { status: response.status, message: text }
      }
      const text = await response.text()
      console.log('🔍 Raw response text:', text)
      const data = text ? JSON.parse(text) : {}
      console.log('🔍 Parsed response data:', data)
      console.log('🔍 pending_matches in response:', data.pending_matches)
      console.log('🔍 pending_matches type:', typeof data.pending_matches)
      console.log('🔍 pending_matches length:', data.pending_matches?.length)

      // Handle both wrapped and direct response formats
      const res: PotentialMatchesResponse = data.pending_matches !== undefined
        ? data
        : { pending_matches: [], accepted_matches: [], expired_matches: [] }
      
      console.log('🔍 Final res object:', res)
      console.log('🔍 Final pending_matches:', res.pending_matches)

      logResponse('GET', endpoint, { 
        counts: { 
          pending: res.pending_matches?.length ?? 0, 
          accepted: res.accepted_matches?.length ?? 0, 
          expired: res.expired_matches?.length ?? 0 
        },
        filters: Object.keys(filters).length > 0 ? filters : 'none'
      })
      return res
    } catch (error: any) {
      return handleApiError(error, 'fetch potential matches')
    }
  },

    async findMatches(opts: { max_results?: number; force_refresh?: boolean; filters?: MatchFilters } = {}): Promise<FindMatchesResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/find-matches`
      const body: any = { max_results: opts.max_results ?? 50 } // Increased default to 50
      if (opts.force_refresh !== undefined) body.force_refresh = opts.force_refresh
      if (opts.filters) body.filters = opts.filters
      
      console.log('🔄 findMatches: Request body:', body)
      console.log('🔄 findMatches: Endpoint:', endpoint)
      logRequest('POST', endpoint, body)
      
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
        
        console.log('🔄 findMatches: Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          const text = await response.text()
          console.error('❌ findMatches error response:', response.status, text)
          console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()))
          console.error('❌ Request body sent:', body)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        console.log('🔄 findMatches: Raw response text:', text.substring(0, 500))
        const data = text ? JSON.parse(text) : {}
        console.log('🔄 findMatches: Parsed response data:', data)
        
        // Handle both wrapped and direct response formats
        const res: FindMatchesResponse = data.matches_found !== undefined 
          ? data 
          : { matches_found: 0, message: 'No matches found' }
        
        console.log('🔄 findMatches: Final result:', res)
        logResponse('POST', endpoint, res)
        return res
      } catch (error: any) {
        console.error('❌ findMatches: Exception caught:', error)
        return handleApiError(error, 'find matches')
      }
    },

    /**
     * Get match requests (incoming and outgoing)
     * GET /api/matching/requests
     * 
     * Returns match requests for the user
     */
    async getRequests(): Promise<MatchRequestsResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests`
      const url = endpoint
      logRequest('GET', url, {})
      
      try {
        const headers = await api.getHeaders()
        const response = await fetch(url, { method: 'GET', headers })
        if (!response.ok) {
          const text = await response.text()
          console.error('getRequests error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        console.log('🔍 getRequests raw response text:', text)
        const data = text ? JSON.parse(text) : {}
        console.log('🔍 getRequests parsed data:', data)
        
        // Handle both wrapped and direct response formats
        const res: MatchRequestsResponse = data.incoming !== undefined 
          ? data 
          : { incoming: [], outgoing: [] }
        
        console.log('🔍 getRequests final result:', res)
        logResponse('GET', url, { incoming: res.incoming.length, outgoing: res.outgoing.length })
        return res
      } catch (error: any) {
        return handleApiError(error, 'fetch match requests')
      }
    },

    /**
     * Send a match request
     * POST /api/matching/request
     * 
     * Sends a match request to another user
     * 
     * Note: carpoolName and preferredCarpoolSize are validated at runtime
     * (backend requires them, but we keep signature flexible for backward compatibility)
     */
    async sendRequest(
      toUserId: string, 
      potentialMatchId?: string, 
      message?: string, 
      carpoolName?: string, 
      preferredCarpoolSize?: number
    ): Promise<MatchRequestResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/request`
      
      // Runtime validation for required fields (backend requires these)
      if (!carpoolName || carpoolName.trim().length === 0) {
        throw new Error('Carpool name is required')
      }
      if (!preferredCarpoolSize || preferredCarpoolSize < 2 || preferredCarpoolSize > 8) {
        throw new Error('Preferred carpool size is required and must be between 2 and 8')
      }
      if (!potentialMatchId) {
        throw new Error('Potential match ID is required')
      }
      
      const body: any = {
        to_user_id: toUserId,
        potential_match_id: potentialMatchId,
        carpool_name: carpoolName,
        preferred_carpool_size: preferredCarpoolSize,
        ...(message && { message }),
      }
      
      logRequest('POST', endpoint, body)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!response.ok) {
          const text = await response.text()
          console.error('sendRequest error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const data = text ? JSON.parse(text) : {}
        
        // Handle both wrapped and direct response formats
        const res: MatchRequestResponse = data.id !== undefined 
          ? data 
          : { id: '', from_user_id: '', to_user_id: '', potential_match_id: '', message: '', carpool_name: '', status: 'pending', expires_at: '', created_at: '' }
        
        logResponse('POST', endpoint, { id: res.id, status: res.status })
        return res
      } catch (error: any) {
        return handleApiError(error, 'send match request')
      }
    },

    async respondToRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<UpdateRequestResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/request/${requestId}`
      const body = { status }
      logRequest('PUT', endpoint, body)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify(body) })
        if (!response.ok) {
          const text = await response.text()
          console.error('respondToRequest error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const data = text ? JSON.parse(text) : {}
        
        // Handle both wrapped and direct response formats
        const res: UpdateRequestResponse = data.message !== undefined 
          ? data 
          : { message: 'Request updated', status: status }
        
        logResponse('PUT', endpoint, res)
        return res
      } catch (error: any) {
        return handleApiError(error, 'respond to match request')
      }
    },

    async getMatchingSession(): Promise<MatchingSession> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/session`
      logRequest('GET', endpoint)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'GET', headers })
        if (!response.ok) {
          const text = await response.text()
          console.error('getMatchingSession error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const data = text ? JSON.parse(text) : {}
        
        // Handle both wrapped and direct response formats
        const res: MatchingSession = data.id !== undefined 
          ? data 
          : { id: '', user_id: '', status: 'inactive', last_match_generated_at: null, expires_at: '', created_at: '', updated_at: '' }
        
        logResponse('GET', endpoint, { id: res.id, status: res.status })
        return res
      } catch (error: any) {
        return handleApiError(error, 'fetch matching session')
      }
    },

    async getStats(): Promise<MatchingStats> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/stats`
      logRequest('GET', endpoint)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'GET', headers })
        if (!response.ok) {
          const text = await response.text()
          console.error('getStats error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const data = text ? JSON.parse(text) : {}
        
        // Handle both wrapped and direct response formats
        const res: MatchingStats = data.total_matches_generated !== undefined 
          ? data 
          : { total_matches_generated: 0, match_acceptance_rate: 0, average_compatibility_score: 0, total_carpools_formed: 0, total_savings: 0, average_route_overlap: 0, most_common_match_reasons: [], geographic_distribution: { nearby: 0, medium_distance: 0, far: 0 }, time_to_acceptance: 0, monthly_trends: [] }
        
        logResponse('GET', endpoint, res)
        return res
      } catch (error: any) {
        return handleApiError(error, 'fetch matching stats')
      }
    },

    async sendMatchRequest(request: {
      potential_match_id: string;
      to_user_id: string;
      message: string;
      preferred_carpool_size?: number; // NEW: User's preferred carpool size
    }): Promise<MatchRequestResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests`
      
      logRequest('POST', endpoint, { request })
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        })
        
        if (!response.ok) {
          const text = await response.text()
          console.error('sendMatchRequest error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        
        const data = await response.json()
        logResponse('POST', endpoint, { success: true, requestId: data.id })
        return data
      } catch (error: any) {
        return handleApiError(error, 'send match request')
      }
    },

    async updateRequestStatus(requestId: string, status: 'accepted' | 'rejected'): Promise<UpdateRequestResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests/${requestId}`
      
      logRequest('PUT', endpoint, { requestId, status })
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        })
        
        if (!response.ok) {
          const text = await response.text()
          console.error('updateRequestStatus error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        
        const data = await response.json()
        logResponse('PUT', endpoint, { success: true, status })
        return data
      } catch (error: any) {
        handleApiError(error, 'update request status')
        // This line will never be reached since handleApiError throws
        throw error
      }
    }
  };
};