'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useMatchingService, PotentialMatch, MatchFilters } from '@/services/matching'
import { MatchCard } from './MatchCard'
import { MatchFilter } from './MatchFilter'

interface PotentialMatchesProps {
  onStatsUpdate?: () => void
  onTabChange?: (tab: string) => void
}

// No mock data needed - backend returns counts

export function PotentialMatches({ onStatsUpdate, onTabChange }: PotentialMatchesProps) {
  const [matches, setMatches] = useState<{
    pending: PotentialMatch[]
    accepted: PotentialMatch[]
    expired: PotentialMatch[]
  }>({
    pending: [],
    accepted: [],
    expired: []
  })
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)
  const [filters, setFilters] = useState<MatchFilters>({})
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  
  const matchingService = useMatchingService()

  const loadMatches = useCallback(async () => {
    setLoading(true)
    try {
      const data = await matchingService.getPotentialMatches()
      if (data.success) {
        setMatches({
          pending: data.pendingMatches || [],
          accepted: data.acceptedMatches || [],
          expired: data.expiredMatches || []
        })
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
      // Use fallback data for development
      setMatches({
        pending: [],
        accepted: [],
        expired: []
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  const handleRefreshMatches = async () => {
    await loadMatches()
  }

  const handleFindNewMatches = async () => {
    try {
      setLoading(true)
      // Call the find-matches endpoint to generate new matches
      await matchingService.findMatches({
        forceRefresh: true,
        limit: 10
      })
      // Reload the matches after finding new ones
      await loadMatches()
    } catch (error) {
      console.error('Failed to find new matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptMatch = async (matchId: string) => {
    try {
      setSendingRequest(matchId)
      await matchingService.sendRequest(matchId, 'I would love to carpool with you!')
      // Remove the accepted match from the list
      setMatches(prev => ({
        ...prev,
        pending: prev.pending.filter(match => match.id !== matchId)
      }))
      setCurrentMatchIndex(prev => Math.max(0, prev - 1))
      onStatsUpdate?.()
    } catch (error) {
      console.error('Failed to accept match:', error)
    } finally {
      setSendingRequest(null)
    }
  }

  const handleRejectMatch = (matchId: string) => {
    // Remove the rejected match from the list
    setMatches(prev => ({
      ...prev,
      pending: prev.pending.filter(match => match.id !== matchId)
    }))
    setCurrentMatchIndex(prev => Math.max(0, prev - 1))
  }

  const handleViewDetails = (matchId: string) => {
    // TODO: Implement detailed view modal
    console.log('View details for match:', matchId)
  }

  const handleFilterChange = (newFilters: MatchFilters) => {
    setFilters(newFilters)
    setCurrentMatchIndex(0) // Reset to first match when filters change
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentMatchIndex(0)
  }

  // Filter matches based on current filters
  const filteredMatches = matches.pending.filter((match: PotentialMatch) => {
    if (filters.minScore && match.compatibilityScore < filters.minScore / 100) return false
    if (filters.maxDistance && match.totalDistanceMiles > filters.maxDistance) return false
    if (filters.ageRanges && filters.ageRanges.length > 0) {
      if (!filters.ageRanges.includes(match.user2.preferences.userDemographics.ageRange)) return false
    }
    if (filters.genders && filters.genders.length > 0) {
      if (!filters.genders.includes(match.user2.preferences.userDemographics.gender)) return false
    }
    return true
  })

  const currentMatch = filteredMatches[currentMatchIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading potential matches...</p>
        </div>
      </div>
    )
  }

  if (filteredMatches.length === 0) {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <MatchFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No potential matches found</h3>
            <p className="text-gray-600 mb-4">
              {matches.pending.length === 0 
                ? "We couldn't find any compatible carpool partners in your area right now."
                : "No matches found with your current filters."
              }
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your preferences or expanding your search area to find more potential matches.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={loadMatches} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Matches
              </Button>
              <Button onClick={() => onTabChange?.('preferences')}>
                Adjust Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Potential Matches</h2>
          <p className="text-sm text-gray-600">
            {filteredMatches.length} of {matches.pending.length} matches
            {currentMatchIndex + 1 > 0 && ` • ${currentMatchIndex + 1} of ${filteredMatches.length}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMatches}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleFindNewMatches} disabled={loading}>
            {loading ? 'Finding...' : 'Find New'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <MatchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Current Match Display */}
      <div className="flex justify-center">
        <MatchCard
          match={currentMatch}
          onAccept={handleAcceptMatch}
          onReject={handleRejectMatch}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentMatchIndex(prev => Math.max(0, prev - 1))}
          disabled={currentMatchIndex === 0}
        >
          Previous
        </Button>
        <span className="flex items-center text-sm text-gray-600">
          {currentMatchIndex + 1} of {filteredMatches.length}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentMatchIndex(prev => Math.min(filteredMatches.length - 1, prev + 1))}
          disabled={currentMatchIndex === filteredMatches.length - 1}
        >
          Next
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-3">
        <Button onClick={() => onTabChange?.('preferences')} variant="outline">
          Adjust Preferences
        </Button>
        <Button onClick={handleFindNewMatches} disabled={loading}>
          {loading ? 'Finding New Matches...' : 'Find Carpool Partners'}
        </Button>
      </div>
    </div>
  )
} 