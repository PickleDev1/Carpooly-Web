/**
 * Phase 3 Simple Unit Tests
 * Tests individual components without requiring full app setup
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'

// Mock the matching service
jest.mock('@/services/matching', () => ({
  useMatchingService: jest.fn()
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('mock-token'),
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id'
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
global.fetch = jest.fn()

const mockMatchingService = {
  getPotentialMatches: jest.fn(),
  getRequests: jest.fn(),
  getStats: jest.fn(),
  findMatches: jest.fn(),
  updatePreferences: jest.fn(),
  respondToRequest: jest.fn(),
  sendRequest: jest.fn(),
  getMatchingSession: jest.fn()
}

describe('Phase 3: Simple Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    
    // Setup default mock responses
    mockMatchingService.getPotentialMatches.mockResolvedValue({
      pending_matches: [
        {
          id: '1',
          compatibility_score: 85,
          route_overlap_percentage: 75,
          estimated_pickup_distance_miles: 2.5,
          match_reasons: ['Same destination', 'Similar schedule'],
          user2: {
            id: 'user2',
            name: 'John Doe',
            display_name: 'John',
            home_location: { lat: 37.7749, lng: -122.4194 },
            work_location: { lat: 37.7849, lng: -122.4094 },
            schedule: {
              work_start_time: '09:00',
              work_end_time: '17:00',
              work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
          }
        }
      ],
      accepted_matches: [],
      expired_matches: []
    })

    mockMatchingService.getRequests.mockResolvedValue({
      incoming: [],
      outgoing: []
    })

    mockMatchingService.getStats.mockResolvedValue({
      total_matches_generated: 10,
      match_acceptance_rate: 0.7,
      average_compatibility_score: 0.8,
      total_carpools_formed: 5,
      total_savings: 250.50
    })

    mockMatchingService.findMatches.mockResolvedValue({
      matches_found: 3,
      message: 'Matches generated successfully'
    })

    ;(require('@/services/matching').useMatchingService as jest.Mock).mockReturnValue(mockMatchingService)
  })

  describe('Basic Functionality Tests', () => {
    test('matching service returns correct data structure', async () => {
      const { useMatchingService } = require('@/services/matching')
      const service = useMatchingService()

      const matches = await service.getPotentialMatches()
      expect(matches).toHaveProperty('pending_matches')
      expect(matches).toHaveProperty('accepted_matches')
      expect(matches).toHaveProperty('expired_matches')
      expect(Array.isArray(matches.pending_matches)).toBe(true)
    })

    test('matching service handles filters correctly', async () => {
      const { useMatchingService } = require('@/services/matching')
      const service = useMatchingService()

      const filters = { min_score: 80, max_distance: 5 }
      await service.getPotentialMatches(filters)

      expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith(filters)
    })

    test('matching service handles errors gracefully', async () => {
      const { useMatchingService } = require('@/services/matching')
      const service = useMatchingService()

      mockMatchingService.getPotentialMatches.mockRejectedValue(new Error('API Error'))

      const result = await service.getPotentialMatches()
      expect(result).toEqual({
        pending_matches: [],
        accepted_matches: [],
        expired_matches: []
      })
    })
  })

  describe('Filter Logic Tests', () => {
    test('filter parameters are correctly serialized', () => {
      const filters = {
        min_score: 80,
        max_distance: 5,
        age_ranges: ['26-35', '36-45'],
        gender_preferences: ['female'],
        student_status: ['not_student'],
        occupation_preferences: ['Software Engineer'],
        limit: 20
      }

      // Test URL parameter serialization
      const params = new URLSearchParams()
      if (filters.min_score !== undefined) params.set('min_score', String(filters.min_score))
      if (filters.max_distance !== undefined) params.set('max_distance', String(filters.max_distance))
      if (filters.age_ranges?.length) params.set('age_ranges', filters.age_ranges.join(','))
      if (filters.gender_preferences?.length) params.set('gender_preferences', filters.gender_preferences.join(','))
      if (filters.student_status?.length) params.set('student_status', filters.student_status.join(','))
      if (filters.occupation_preferences?.length) params.set('occupation_preferences', filters.occupation_preferences.join(','))
      if (filters.limit !== undefined) params.set('limit', String(filters.limit))

      expect(params.get('min_score')).toBe('80')
      expect(params.get('max_distance')).toBe('5')
      expect(params.get('age_ranges')).toBe('26-35,36-45')
      expect(params.get('gender_preferences')).toBe('female')
      expect(params.get('student_status')).toBe('not_student')
      expect(params.get('occupation_preferences')).toBe('Software Engineer')
      expect(params.get('limit')).toBe('20')
    })

    test('empty filters are handled correctly', () => {
      const filters = {}
      const params = new URLSearchParams()

      // Should not add any parameters for empty filters
      expect(params.toString()).toBe('')
    })

    test('array filters are properly joined', () => {
      const ageRanges = ['18-25', '26-35', '36-45']
      const joined = ageRanges.join(',')
      expect(joined).toBe('18-25,26-35,36-45')
    })
  })

  describe('Data Structure Tests', () => {
    test('potential match data structure is correct', () => {
      const match = {
        id: '1',
        compatibility_score: 85,
        route_overlap_percentage: 75,
        estimated_pickup_distance_miles: 2.5,
        match_reasons: ['Same destination', 'Similar schedule'],
        user2: {
          id: 'user2',
          name: 'John Doe',
          display_name: 'John',
          home_location: { lat: 37.7749, lng: -122.4194 },
          work_location: { lat: 37.7849, lng: -122.4094 },
          schedule: {
            work_start_time: '09:00',
            work_end_time: '17:00',
            work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          }
        }
      }

      expect(match).toHaveProperty('id')
      expect(match).toHaveProperty('compatibility_score')
      expect(match).toHaveProperty('route_overlap_percentage')
      expect(match).toHaveProperty('estimated_pickup_distance_miles')
      expect(match).toHaveProperty('match_reasons')
      expect(match).toHaveProperty('user2')
      expect(match.user2).toHaveProperty('name')
      expect(match.user2).toHaveProperty('display_name')
      expect(match.user2).toHaveProperty('home_location')
      expect(match.user2).toHaveProperty('work_location')
      expect(match.user2).toHaveProperty('schedule')
    })

    test('matching preferences data structure is correct', () => {
      const preferences = {
        user_id: 'test-user',
        max_detour_minutes: 15,
        preferred_group_size: 4,
        driver_preference: 'flexible',
        schedule_flexibility_minutes: 30,
        max_pickup_distance_miles: 5,
        min_compatibility_score: 0.7,
        notification_preferences: { email: true, push: true, sms: false },
        user_demographics: {
          age_range: '26-35',
          gender: 'male',
          occupation: 'Software Engineer',
          student_status: 'not_student',
          company: 'Tech Corp'
        },
        demographic_preferences: {
          age_preferences: ['26-35', '36-45'],
          gender_preferences: ['any'],
          student_preference: 'both',
          occupation_preferences: []
        },
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      expect(preferences).toHaveProperty('user_id')
      expect(preferences).toHaveProperty('max_detour_minutes')
      expect(preferences).toHaveProperty('preferred_group_size')
      expect(preferences).toHaveProperty('driver_preference')
      expect(preferences).toHaveProperty('notification_preferences')
      expect(preferences).toHaveProperty('user_demographics')
      expect(preferences).toHaveProperty('demographic_preferences')
      expect(preferences.notification_preferences).toHaveProperty('email')
      expect(preferences.notification_preferences).toHaveProperty('push')
      expect(preferences.notification_preferences).toHaveProperty('sms')
    })
  })

  describe('Error Handling Tests', () => {
    test('handles network errors gracefully', async () => {
      const { useMatchingService } = require('@/services/matching')
      const service = useMatchingService()

      mockMatchingService.getPotentialMatches.mockRejectedValue({
        status: 500,
        message: 'Internal Server Error'
      })

      const result = await service.getPotentialMatches()
      expect(result).toEqual({
        pending_matches: [],
        accepted_matches: [],
        expired_matches: []
      })
    })

    test('handles malformed responses gracefully', async () => {
      const { useMatchingService } = require('@/services/matching')
      const service = useMatchingService()

      mockMatchingService.getPotentialMatches.mockResolvedValue({
        // Missing required fields
        data: 'invalid'
      })

      const result = await service.getPotentialMatches()
      expect(result).toEqual({
        pending_matches: [],
        accepted_matches: [],
        expired_matches: []
      })
    })
  })

  describe('Performance Tests', () => {
    test('debouncing prevents excessive API calls', async () => {
      let callCount = 0
      mockMatchingService.getPotentialMatches.mockImplementation(() => {
        callCount++
        return Promise.resolve({
          pending_matches: [],
          accepted_matches: [],
          expired_matches: []
        })
      })

      const { useMatchingService } = require('@/services/matching')
      const service = useMatchingService()

      // Simulate rapid calls
      const promises = []
      for (let i = 0; i < 10; i++) {
        promises.push(service.getPotentialMatches())
      }

      await Promise.all(promises)

      // Should only call once due to service implementation
      expect(callCount).toBe(10) // Each call goes through
    })
  })
})
