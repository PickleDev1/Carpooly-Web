/**
 * Phase 3 Integration Tests
 * End-to-end testing of the complete matching system
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import MatchingPage from '@/app/(authenticated)/matching/page'
import { useMatchingService } from '@/services/matching'

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

describe('Phase 3: Complete Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Setup comprehensive mock data
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
        },
        {
          id: '2',
          compatibility_score: 78,
          route_overlap_percentage: 65,
          estimated_pickup_distance_miles: 3.2,
          match_reasons: ['Close pickup location', 'Flexible schedule'],
          user2: {
            id: 'user3',
            name: 'Jane Smith',
            display_name: 'Jane',
            home_location: { lat: 37.7849, lng: -122.4094 },
            work_location: { lat: 37.7949, lng: -122.3994 },
            schedule: {
              work_start_time: '08:30',
              work_end_time: '16:30',
              work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
          }
        }
      ],
      accepted_matches: [],
      expired_matches: []
    })

    mockMatchingService.getRequests.mockResolvedValue({
      incoming: [
        {
          id: 'req1',
          from_user_id: 'user4',
          to_user_id: 'test-user-id',
          potential_match_id: '1',
          message: 'Hi! I\'d love to carpool with you.',
          status: 'pending',
          expires_at: '2024-01-08T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          from_user: {
            id: 'user4',
            name: 'Alice Johnson',
            display_name: 'Alice'
          }
        }
      ],
      outgoing: []
    })

    mockMatchingService.getStats.mockResolvedValue({
      total_matches_generated: 15,
      match_acceptance_rate: 0.75,
      average_compatibility_score: 0.82,
      total_carpools_formed: 8,
      total_savings: 450.50,
      average_route_overlap: 78.5,
      most_common_match_reasons: [
        'Same destination',
        'Similar schedule',
        'Close pickup location'
      ],
      geographic_distribution: {
        nearby: 12,
        medium_distance: 8,
        far: 5
      },
      time_to_acceptance: 2.3,
      monthly_trends: [
        { month: 'Oct', matches: 5, acceptances: 3 },
        { month: 'Nov', matches: 8, acceptances: 6 },
        { month: 'Dec', matches: 12, acceptances: 7 },
        { month: 'Jan', matches: 10, acceptances: 8 }
      ]
    })

    mockMatchingService.findMatches.mockResolvedValue({
      matches_found: 5,
      message: 'Matches generated successfully'
    })

    ;(useMatchingService as jest.Mock).mockReturnValue(mockMatchingService)
  })

  describe('Complete Matching Page Flow', () => {
    test('loads all tabs and displays correct data', async () => {
      render(<MatchingPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      // Check header counts
      expect(screen.getByText('2')).toBeInTheDocument() // potential matches
      expect(screen.getByText('1')).toBeInTheDocument() // incoming requests
      expect(screen.getByText('8')).toBeInTheDocument() // formed carpools
      expect(screen.getByText('$450.50')).toBeInTheDocument() // savings

      // Check all tabs are present
      expect(screen.getByText('Potential')).toBeInTheDocument()
      expect(screen.getByText('Requests')).toBeInTheDocument()
      expect(screen.getByText('Algorithm')).toBeInTheDocument()
      expect(screen.getByText('Real-time')).toBeInTheDocument()
      expect(screen.getByText('Statistics')).toBeInTheDocument()
      expect(screen.getByText('Preferences')).toBeInTheDocument()
    })

    test('navigates between tabs correctly', async () => {
      render(<MatchingPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      // Switch to Requests tab
      fireEvent.click(screen.getByText('Requests'))
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      })

      // Switch to Algorithm tab
      fireEvent.click(screen.getByText('Algorithm'))
      await waitFor(() => {
        expect(screen.getByText('Smart Matching Algorithm')).toBeInTheDocument()
      })

      // Switch to Real-time tab
      fireEvent.click(screen.getByText('Real-time'))
      await waitFor(() => {
        expect(screen.getByText('Real-time Updates')).toBeInTheDocument()
      })

      // Switch to Statistics tab
      fireEvent.click(screen.getByText('Statistics'))
      await waitFor(() => {
        expect(screen.getByText('Matching Statistics')).toBeInTheDocument()
      })

      // Switch to Preferences tab
      fireEvent.click(screen.getByText('Preferences'))
      await waitFor(() => {
        expect(screen.getByText('Matching Preferences')).toBeInTheDocument()
      })
    })
  })

  describe('Filter Integration Flow', () => {
    test('complete filter workflow from UI to API', async () => {
      render(<MatchingPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      // Show filters
      fireEvent.click(screen.getByText('Show Filters'))

      // Wait for filter UI
      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
      })

      // Apply multiple filters
      const minScoreInput = screen.getByPlaceholderText('e.g. 70')
      fireEvent.change(minScoreInput, { target: { value: '80' } })

      const maxDistanceInput = screen.getByPlaceholderText('e.g. 10')
      fireEvent.change(maxDistanceInput, { target: { value: '5' } })

      // Expand advanced filters
      fireEvent.click(screen.getByText('Expand'))

      await waitFor(() => {
        expect(screen.getByText('Age Ranges')).toBeInTheDocument()
      })

      // Select age ranges
      fireEvent.click(screen.getByLabelText('26-35'))
      fireEvent.click(screen.getByLabelText('36-45'))

      // Wait for debounced API call
      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith({
          min_score: 80,
          max_distance: 5,
          age_ranges: ['26-35', '36-45']
        })
      })

      // Clear filters
      fireEvent.click(screen.getByText('Clear All'))

      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith({})
      })
    })

    test('filter presets work correctly', async () => {
      render(<MatchingPage />)

      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Show Filters'))
      fireEvent.click(screen.getByText('Expand'))

      await waitFor(() => {
        expect(screen.getByText('High Compatibility')).toBeInTheDocument()
      })

      // Use preset
      fireEvent.click(screen.getByText('High Compatibility'))

      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith({
          min_score: 80,
          max_distance: 5,
          age_ranges: ['26-35', '36-45'],
          student_preference: 'professionals_only'
        })
      })
    })
  })

  describe('Real-time Updates Integration', () => {
    test('real-time polling updates header counts', async () => {
      render(<MatchingPage />)

      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      // Switch to Real-time tab
      fireEvent.click(screen.getByText('Real-time'))

      await waitFor(() => {
        expect(screen.getByText('Real-time Updates')).toBeInTheDocument()
      })

      // Enable real-time updates
      const switchElement = screen.getByRole('switch')
      fireEvent.click(switchElement)

      // Wait for polling to start
      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalled()
        expect(mockMatchingService.getRequests).toHaveBeenCalled()
        expect(mockMatchingService.getStats).toHaveBeenCalled()
      })

      // Manual refresh
      fireEvent.click(screen.getByText('Refresh Now'))

      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Algorithm Integration', () => {
    test('algorithm generation updates header counts', async () => {
      render(<MatchingPage />)

      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      // Switch to Algorithm tab
      fireEvent.click(screen.getByText('Algorithm'))

      await waitFor(() => {
        expect(screen.getByText('Smart Matching Algorithm')).toBeInTheDocument()
      })

      // Generate matches
      fireEvent.click(screen.getByText('Generate Matches'))

      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText('Found 5 new matches!')).toBeInTheDocument()
      })

      // Verify API was called
      expect(mockMatchingService.findMatches).toHaveBeenCalledWith({
        max_results: 20,
        force_refresh: true,
        filters: {}
      })

      // Verify header counts were updated
      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalled()
        expect(mockMatchingService.getRequests).toHaveBeenCalled()
        expect(mockMatchingService.getStats).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling Integration', () => {
    test('handles API errors gracefully across all components', async () => {
      // Mock API errors
      mockMatchingService.getPotentialMatches.mockRejectedValue(new Error('API Error'))
      mockMatchingService.getRequests.mockRejectedValue(new Error('API Error'))
      mockMatchingService.getStats.mockRejectedValue(new Error('API Error'))

      render(<MatchingPage />)

      // Should handle errors gracefully
      await waitFor(() => {
        expect(screen.getByText('No matches found')).toBeInTheDocument()
      })

      // Switch to other tabs should also handle errors
      fireEvent.click(screen.getByText('Requests'))
      fireEvent.click(screen.getByText('Algorithm'))
      fireEvent.click(screen.getByText('Real-time'))
      fireEvent.click(screen.getByText('Statistics'))
      fireEvent.click(screen.getByText('Preferences'))

      // All tabs should render without crashing
      await waitFor(() => {
        expect(screen.getByText('Matching Preferences')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Integration', () => {
    test('handles rapid filter changes efficiently', async () => {
      render(<MatchingPage />)

      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Show Filters'))

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
      })

      const minScoreInput = screen.getByPlaceholderText('e.g. 70')

      // Rapidly change input
      for (let i = 1; i <= 10; i++) {
        fireEvent.change(minScoreInput, { target: { value: i.toString() } })
      }

      // Should only call API once due to debouncing
      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith({ min_score: 10 })
      })

      // Should not have made 10 separate calls
      expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledTimes(2) // Initial load + debounced call
    })
  })

  describe('State Persistence Integration', () => {
    test('maintains state across tab switches', async () => {
      render(<MatchingPage />)

      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })

      // Apply filters
      fireEvent.click(screen.getByText('Show Filters'))
      const minScoreInput = screen.getByPlaceholderText('e.g. 70')
      fireEvent.change(minScoreInput, { target: { value: '85' } })

      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith({ min_score: 85 })
      })

      // Switch tabs and come back
      fireEvent.click(screen.getByText('Requests'))
      fireEvent.click(screen.getByText('Potential'))

      // Filters should still be applied
      await waitFor(() => {
        expect(screen.getByText('Potential Matches')).toBeInTheDocument()
      })
    })
  })
})
