/**
 * Phase 3 Automated Testing Suite
 * Tests all matching functionality including filters, real-time updates, and algorithm
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import { useMatchingService } from '@/services/matching'
import { MatchFilter } from '@/components/matching/MatchFilter'
import { PotentialMatches } from '@/components/matching/PotentialMatches'
import { AdvancedMatching } from '@/components/matching/AdvancedMatching'
import { RealTimeUpdates } from '@/components/matching/RealTimeUpdates'

// Mock the matching service
jest.mock('@/services/matching', () => ({
  useMatchingService: jest.fn()
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

describe('Phase 3: Advanced Matching System', () => {
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

    ;(useMatchingService as jest.Mock).mockReturnValue(mockMatchingService)
  })

  describe('MatchFilter Component', () => {
    test('renders all filter options correctly', () => {
      const mockFilters = {}
      const mockOnFilterChange = jest.fn()
      const mockOnClearFilters = jest.fn()
      const mockOnApplyFilters = jest.fn()

      render(
        <MatchFilter
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      )

      // Check basic filters are visible
      expect(screen.getByText('Min Compatibility Score')).toBeInTheDocument()
      expect(screen.getByText('Max Distance')).toBeInTheDocument()
      expect(screen.getByText('Results Limit')).toBeInTheDocument()

      // Check expand/collapse functionality
      const expandButton = screen.getByText('Expand')
      expect(expandButton).toBeInTheDocument()
    })

    test('handles filter changes with debouncing', async () => {
      const mockFilters = {}
      const mockOnFilterChange = jest.fn()
      const mockOnClearFilters = jest.fn()
      const mockOnApplyFilters = jest.fn()

      render(
        <MatchFilter
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      )

      // Change min score filter
      const minScoreInput = screen.getByPlaceholderText('e.g. 70')
      fireEvent.change(minScoreInput, { target: { value: '80' } })

      // Should not call immediately due to debouncing
      expect(mockOnFilterChange).not.toHaveBeenCalled()

      // Wait for debounce
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({ min_score: 80 })
      }, { timeout: 1000 })
    })

    test('handles array filter toggling correctly', async () => {
      const mockFilters = {}
      const mockOnFilterChange = jest.fn()
      const mockOnClearFilters = jest.fn()
      const mockOnApplyFilters = jest.fn()

      render(
        <MatchFilter
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      )

      // Expand filters
      fireEvent.click(screen.getByText('Expand'))

      // Wait for expanded content
      await waitFor(() => {
        expect(screen.getByText('Age Ranges')).toBeInTheDocument()
      })

      // Toggle age range filter
      const ageCheckbox = screen.getByLabelText('26-35')
      fireEvent.click(ageCheckbox)

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({ age_ranges: ['26-35'] })
      })
    })

    test('clear all filters works correctly', async () => {
      const mockFilters = { min_score: 80, max_distance: 5 }
      const mockOnFilterChange = jest.fn()
      const mockOnClearFilters = jest.fn()
      const mockOnApplyFilters = jest.fn()

      render(
        <MatchFilter
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      )

      // Should show active filter count
      expect(screen.getByText('2 active')).toBeInTheDocument()

      // Clear all filters
      fireEvent.click(screen.getByText('Clear All'))

      expect(mockOnClearFilters).toHaveBeenCalled()
    })

    test('quick presets work correctly', async () => {
      const mockFilters = {}
      const mockOnFilterChange = jest.fn()
      const mockOnClearFilters = jest.fn()
      const mockOnApplyFilters = jest.fn()

      render(
        <MatchFilter
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      )

      // Expand filters
      fireEvent.click(screen.getByText('Expand'))

      await waitFor(() => {
        expect(screen.getByText('High Compatibility')).toBeInTheDocument()
      })

      // Click preset
      fireEvent.click(screen.getByText('High Compatibility'))

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          min_score: 80,
          max_distance: 5,
          age_ranges: ['26-35', '36-45'],
          student_preference: 'professionals_only'
        })
      })
    })
  })

  describe('PotentialMatches Component', () => {
    test('loads and displays matches correctly', async () => {
      const mockOnStatsUpdate = jest.fn()

      render(<PotentialMatches onStatsUpdate={mockOnStatsUpdate} />)

      // Should show loading initially
      expect(screen.getByText('Finding potential matches...')).toBeInTheDocument()

      // Wait for matches to load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Should show match count
      expect(screen.getByText('1 match')).toBeInTheDocument()
    })

    test('handles filter integration correctly', async () => {
      const mockOnStatsUpdate = jest.fn()

      render(<PotentialMatches onStatsUpdate={mockOnStatsUpdate} />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Toggle filters
      fireEvent.click(screen.getByText('Show Filters'))

      // Change a filter
      const minScoreInput = screen.getByPlaceholderText('e.g. 70')
      fireEvent.change(minScoreInput, { target: { value: '90' } })

      // Should call API with new filters
      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith({ min_score: 90 })
      })
    })

    test('handles empty state correctly', async () => {
      mockMatchingService.getPotentialMatches.mockResolvedValue({
        pending_matches: [],
        accepted_matches: [],
        expired_matches: []
      })

      const mockOnStatsUpdate = jest.fn()
      render(<PotentialMatches onStatsUpdate={mockOnStatsUpdate} />)

      await waitFor(() => {
        expect(screen.getByText('No matches found')).toBeInTheDocument()
      })
    })

    test('handles error state correctly', async () => {
      mockMatchingService.getPotentialMatches.mockRejectedValue(new Error('API Error'))

      const mockOnStatsUpdate = jest.fn()
      render(<PotentialMatches onStatsUpdate={mockOnStatsUpdate} />)

      await waitFor(() => {
        expect(screen.getByText('No matches found')).toBeInTheDocument()
      })
    })
  })

  describe('AdvancedMatching Component', () => {
    test('renders algorithm overview correctly', () => {
      const mockOnMatchesGenerated = jest.fn()

      render(<AdvancedMatching onMatchesGenerated={mockOnMatchesGenerated} />)

      expect(screen.getByText('Smart Matching Algorithm')).toBeInTheDocument()
      expect(screen.getByText('Location Compatibility')).toBeInTheDocument()
      expect(screen.getByText('Schedule Compatibility')).toBeInTheDocument()
      expect(screen.getByText('Demographic Preferences')).toBeInTheDocument()
    })

    test('generates matches correctly', async () => {
      const mockOnMatchesGenerated = jest.fn()

      render(<AdvancedMatching onMatchesGenerated={mockOnMatchesGenerated} />)

      // Click generate button
      fireEvent.click(screen.getByText('Generate Matches'))

      // Should show loading state
      expect(screen.getByText('Generating...')).toBeInTheDocument()

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Found 3 new matches!')).toBeInTheDocument()
      })

      expect(mockOnMatchesGenerated).toHaveBeenCalledWith(3)
    })

    test('handles generation errors correctly', async () => {
      mockMatchingService.findMatches.mockRejectedValue(new Error('Generation failed'))

      const mockOnMatchesGenerated = jest.fn()
      render(<AdvancedMatching onMatchesGenerated={mockOnMatchesGenerated} />)

      fireEvent.click(screen.getByText('Generate Matches'))

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.queryByText('Found 3 new matches!')).not.toBeInTheDocument()
      })
    })
  })

  describe('RealTimeUpdates Component', () => {
    test('renders real-time controls correctly', () => {
      const mockOnNewMatches = jest.fn()
      const mockOnNewRequests = jest.fn()
      const mockOnStatsUpdate = jest.fn()

      render(
        <RealTimeUpdates
          onNewMatches={mockOnNewMatches}
          onNewRequests={mockOnNewRequests}
          onStatsUpdate={mockOnStatsUpdate}
        />
      )

      expect(screen.getByText('Real-time Updates')).toBeInTheDocument()
      expect(screen.getByText('Enable real-time updates')).toBeInTheDocument()
      expect(screen.getByText('15s')).toBeInTheDocument()
      expect(screen.getByText('30s')).toBeInTheDocument()
      expect(screen.getByText('1m')).toBeInTheDocument()
    })

    test('handles polling correctly', async () => {
      const mockOnNewMatches = jest.fn()
      const mockOnNewRequests = jest.fn()
      const mockOnStatsUpdate = jest.fn()

      render(
        <RealTimeUpdates
          onNewMatches={mockOnNewMatches}
          onNewRequests={mockOnNewRequests}
          onStatsUpdate={mockOnStatsUpdate}
        />
      )

      // Enable updates
      const switchElement = screen.getByRole('switch')
      fireEvent.click(switchElement)

      // Should start polling
      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalled()
        expect(mockMatchingService.getRequests).toHaveBeenCalled()
        expect(mockMatchingService.getStats).toHaveBeenCalled()
      })
    })

    test('handles manual refresh correctly', async () => {
      const mockOnNewMatches = jest.fn()
      const mockOnNewRequests = jest.fn()
      const mockOnStatsUpdate = jest.fn()

      render(
        <RealTimeUpdates
          onNewMatches={mockOnNewMatches}
          onNewRequests={mockOnNewRequests}
          onStatsUpdate={mockOnStatsUpdate}
        />
      )

      // Click refresh button
      fireEvent.click(screen.getByText('Refresh Now'))

      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalled()
      })
    })
  })

  describe('API Integration', () => {
    test('sends correct query parameters for filters', async () => {
      const mockFilters = {
        min_score: 80,
        max_distance: 5,
        age_ranges: ['26-35', '36-45'],
        gender_preferences: ['female'],
        student_status: ['not_student'],
        occupation_preferences: ['Software Engineer'],
        limit: 20
      }

      mockMatchingService.getPotentialMatches.mockImplementation((filters) => {
        // Verify correct parameters are sent
        expect(filters).toEqual(mockFilters)
        return Promise.resolve({
          pending_matches: [],
          accepted_matches: [],
          expired_matches: []
        })
      })

      const mockOnStatsUpdate = jest.fn()
      render(<PotentialMatches onStatsUpdate={mockOnStatsUpdate} />)

      // Apply filters
      fireEvent.click(screen.getByText('Show Filters'))
      
      const minScoreInput = screen.getByPlaceholderText('e.g. 70')
      fireEvent.change(minScoreInput, { target: { value: '80' } })

      await waitFor(() => {
        expect(mockMatchingService.getPotentialMatches).toHaveBeenCalledWith({ min_score: 80 })
      })
    })

    test('handles API errors gracefully', async () => {
      mockMatchingService.getPotentialMatches.mockRejectedValue({
        status: 500,
        message: 'Internal Server Error'
      })

      const mockOnStatsUpdate = jest.fn()
      render(<PotentialMatches onStatsUpdate={mockOnStatsUpdate} />)

      await waitFor(() => {
        expect(screen.getByText('No matches found')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Tests', () => {
    test('debouncing prevents excessive API calls', async () => {
      const mockFilters = {}
      const mockOnFilterChange = jest.fn()
      const mockOnClearFilters = jest.fn()
      const mockOnApplyFilters = jest.fn()

      render(
        <MatchFilter
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
          onClearFilters={mockOnClearFilters}
          onApplyFilters={mockOnApplyFilters}
        />
      )

      const minScoreInput = screen.getByPlaceholderText('e.g. 70')

      // Rapidly change input multiple times
      fireEvent.change(minScoreInput, { target: { value: '1' } })
      fireEvent.change(minScoreInput, { target: { value: '12' } })
      fireEvent.change(minScoreInput, { target: { value: '123' } })
      fireEvent.change(minScoreInput, { target: { value: '1234' } })

      // Should only call once due to debouncing
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
        expect(mockOnFilterChange).toHaveBeenCalledWith({ min_score: 1234 })
      })
    })
  })
})
