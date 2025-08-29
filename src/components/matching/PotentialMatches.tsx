'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User
} from 'lucide-react'
import { useMatchingService, PotentialMatch } from '@/services/matching'

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
  
  const matchingService = useMatchingService()

  const loadMatches = useCallback(async () => {
    setLoading(true)
    try {
      const data = await matchingService.getPotentialMatches()
      setMatches({
        pending: data.pending_matches || [],
        accepted: data.accepted_matches || [],
        expired: data.expired_matches || []
      })
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
      await matchingService.findMatches(true, 10)
      // Reload the matches after finding new ones
      await loadMatches()
    } catch (error) {
      console.error('Failed to find new matches:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (matches.pending.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No potential matches found</h3>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find any compatible carpool partners in your area right now.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Try adjusting your preferences or expanding your search area to find more potential matches.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={loadMatches} variant="outline">Refresh Matches</Button>
                            <Button onClick={() => onTabChange?.('preferences')}>
                  Adjust Preferences
                </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Potential Matches ({matches.pending.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMatches}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Great news! We found {matches.pending.length} potential matches</h3>
              <p className="text-gray-600 mb-4">
                We&apos;ve identified {matches.pending.length} carpool partners who are compatible with your preferences.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                These matches are based on your location, schedule, and preferences. 
                You can send carpool requests to start connecting with them.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleFindNewMatches} disabled={loading}>
                  {loading ? 'Finding Matches...' : 'Find New Matches'}
                </Button>
                <Button onClick={() => onTabChange?.('preferences')} variant="outline">
                  Adjust Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 