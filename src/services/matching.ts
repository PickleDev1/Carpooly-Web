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
} from '../types/matching';
import type {
  MatchingPreferencesResponse,
  PotentialMatchesResponse,
  MatchRequestsResponse,
  FindMatchesResponse,
  MatchRequestResponse,
  UpdateRequestResponse,
  MatchingSessionResponse,
  MatchingStatsResponse
} from '@/types/api';

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
// Mock data (aligned to new snake_case schema) used until real API is wired
// ----------------------------------------------------------------------------

const mockPreferences: MatchingPreferences = {
  user_id: 'mock_user',
  max_detour_minutes: 15,
  preferred_group_size: 4,
  driver_preference: 'flexible',
  schedule_flexibility_minutes: 30,
  max_pickup_distance_miles: 5,
  min_compatibility_score: 0.7,
  notification_preferences: { email: true, push: true, sms: false },
  user_demographics: { age_range: '26-35', gender: 'prefer_not_to_say', occupation: '', student_status: 'not_student', company: '' },
  demographic_preferences: { age_preferences: ['18-25', '26-35', '36-45', '46-55'], gender_preferences: ['any'], student_preference: 'both', occupation_preferences: [] },
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockPotentialMatchesResponse: PotentialMatchesResponse = {
  pending_matches: [
    {
      id: 'm1',
      user2: {
        id: 'u1',
        name: 'Sarah Johnson',
        display_name: 'Sarah J.',
        home_location: { lat: 37.7749, lng: -122.4194, address: 'Home Address, SF' },
        work_location: { lat: 37.7849, lng: -122.4094, address: 'Work Address, SF' },
        preferences: { user_demographics: { age_range: '26-35', gender: 'female', occupation: 'Software Engineer', student_status: 'not_student', company: 'Tech Corp' } },
        schedule: { work_days: ['monday','tuesday','wednesday','thursday','friday'], work_start_time: '08:30', work_end_time: '17:30' },
      },
      compatibility_score: 0.89,
      match_reasons: ['Similar route', 'Close pickup'],
      route_overlap_percentage: 0.85,
      estimated_detour_minutes: 15,
      estimated_pickup_distance_miles: 2.5,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 864e5).toISOString(),
    },
  ],
  accepted_matches: [],
  expired_matches: [],
};

const mockRequests: MatchRequestsResponse = {
  incoming: [
    {
      id: 'r1',
      from_user_id: 'u6',
      to_user_id: 'me',
      potential_match_id: 'm1',
      message: 'Hey! Our routes look close. Want to try carpooling this week?',
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 2 * 864e5).toISOString(),
      from_user: { id: 'u6', name: 'Alex Rivera', display_name: 'Alex R.' },
    },
  ],
  outgoing: [
    {
      id: 'r2',
      from_user_id: 'me',
      to_user_id: 'u3',
      potential_match_id: 'm1',
      message: 'Hi! Looks like we share a route and time.',
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3 * 864e5).toISOString(),
      to_user: { id: 'u3', name: 'Alex Rivera', display_name: 'Alex R.' },
    },
  ],
};

const mockSession: MatchingSession = {
  id: 'session_123',
  user_id: 'mock_user',
  status: 'active',
  last_match_generated_at: null,
  expires_at: new Date(Date.now() + 30 * 864e5).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockStats: MatchingStats = {
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
    { month: 'Feb', matches: 12, acceptances: 9 },
  ],
};

export const useMatchingService = () => {
  // NOTE: Phase 1 keeps mock data but aligns types and shapes.
  // Real API wiring will be done in Phase 2 using useApi() below.
  const api = useApi();

  return {
    async getPreferences(): Promise<MatchingPreferences> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/preferences`
      logRequest('GET', endpoint)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'GET', headers })
        if (!response.ok) {
          const text = await response.text()
          console.error('getPreferences error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const payload = text ? JSON.parse(text) : null
        if (!payload || payload.success !== true || !payload.preferences) {
          throw { status: 500, message: 'Invalid preferences response' }
        }
        logResponse('GET', endpoint, { ok: true })
        return payload.preferences as MatchingPreferences
      } catch (error: any) {
        return handleApiError(error, 'fetch matching preferences')
      }
    },

    async updatePreferences(update: Partial<MatchingPreferences>): Promise<MatchingPreferences> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/preferences`
      logRequest('PUT', endpoint, update)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify(update) })
        if (!response.ok) {
          const text = await response.text()
          console.error('updatePreferences error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const payload = text ? JSON.parse(text) : null
        if (!payload || payload.success !== true || !payload.preferences) {
          throw { status: 500, message: 'Invalid update preferences response' }
        }
        logResponse('PUT', endpoint, { ok: true })
        return payload.preferences as MatchingPreferences
      } catch (error: any) {
        return handleApiError(error, 'update matching preferences')
      }
    },

    async getPotentialMatches(filters: MatchFilters = {}): Promise<PotentialMatchesResponse> {
      const base = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/potential-matches`
      const params = new URLSearchParams()
      if (filters.min_score !== undefined) params.set('min_score', String(filters.min_score))
      if (filters.max_distance !== undefined) params.set('max_distance', String(filters.max_distance))
      if (filters.age_ranges?.length) params.set('age_ranges', filters.age_ranges.join(','))
      if (filters.genders?.length) params.set('genders', filters.genders.join(','))
      if (filters.occupations?.length) params.set('occupations', filters.occupations.join(','))
      if (filters.student_status?.length) params.set('student_status', filters.student_status.join(','))
      if (filters.limit !== undefined) params.set('limit', String(filters.limit))
      if (filters.offset !== undefined) params.set('offset', String(filters.offset))
      const endpoint = params.toString() ? `${base}?${params.toString()}` : base
      logRequest('GET', endpoint)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'GET', headers })
        if (!response.ok) {
          const text = await response.text()
          console.error('getPotentialMatches error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const text = await response.text()
        const res: PotentialMatchesResponse = text ? JSON.parse(text) : { pending_matches: [], accepted_matches: [], expired_matches: [] }
        logResponse('GET', endpoint, { counts: { pending: res.pending_matches?.length ?? 0, accepted: res.accepted_matches?.length ?? 0, expired: res.expired_matches?.length ?? 0 } })
        return res
      } catch (error: any) {
        return handleApiError(error, 'fetch potential matches')
      }
    },

    async findMatches(opts: { max_results?: number; force_refresh?: boolean; filters?: MatchFilters } = {}): Promise<FindMatchesResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/find-matches`
      const body: any = { max_results: opts.max_results ?? 10 }
      if (opts.force_refresh !== undefined) body.force_refresh = opts.force_refresh
      if (opts.filters) body.filters = opts.filters
      logRequest('POST', endpoint, body)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!response.ok) {
          const text = await response.text()
          console.error('findMatches error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const res: FindMatchesResponse = await response.json()
        logResponse('POST', endpoint, res)
        return res
      } catch (error: any) {
        return handleApiError(error, 'find matches')
      }
    },

    async getRequests(): Promise<MatchRequestsResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests`
      logRequest('GET', endpoint)
      try {
        const headers = await api.getHeaders()
        const response = await fetch(endpoint, { method: 'GET', headers })
        if (!response.ok) {
          const text = await response.text()
          console.error('getRequests error response:', response.status, text)
          throw { status: response.status, message: text }
        }
        const res: MatchRequestsResponse = await response.json()
        logResponse('GET', endpoint, { incoming: res.incoming.length, outgoing: res.outgoing.length })
        return res
      } catch (error: any) {
        return handleApiError(error, 'fetch match requests')
      }
    },

    async sendRequest(toUserId: string, potentialMatchId?: string, message?: string): Promise<MatchRequestResponse> {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/request`
      const body = {
        to_user_id: toUserId,
        ...(potentialMatchId && { potential_match_id: potentialMatchId }),
        ...(message && { message })
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
        const res: MatchRequestResponse = await response.json()
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
        const res: UpdateRequestResponse = await response.json()
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
        const res: MatchingSession = await response.json()
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
        const res: MatchingStatsResponse = text ? JSON.parse(text) : ({} as any)
        logResponse('GET', endpoint, res)
        return res
      } catch (error: any) {
        return handleApiError(error, 'fetch matching stats')
      }
    },
  };
};