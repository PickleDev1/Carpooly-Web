'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  Route,
  DollarSign,
  User,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Sliders,
  X,
  Users
} from 'lucide-react'
import { useMatchingService, type PotentialMatch, type MatchFilters } from '@/services/matching'
import { MatchFilter } from './MatchFilter'

interface PotentialMatchesProps {
  onStatsUpdate?: () => void
}

export function PotentialMatches({ onStatsUpdate }: PotentialMatchesProps) {
  const [matches, setMatches] = useState<PotentialMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [filters, setFilters] = useState<MatchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const listRefs = useRef<HTMLDivElement[]>([])
  
  const matchingService = useMatchingService()

  const loadMatches = useCallback(async (currentFilters: MatchFilters = {}) => {
    setLoading(true)
    try {
      const data = await matchingService.getPotentialMatches(currentFilters)
      setMatches(data.pending_matches || [])
      setFocusedIndex(0)
    } catch (error) {
      console.error('Failed to load matches:', error)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [matchingService])

  const handleFilterChange = useCallback((newFilters: MatchFilters) => {
    setFilters(newFilters)
    loadMatches(newFilters)
  }, [loadMatches])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    loadMatches({})
  }, [loadMatches])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => b.compatibility_score - a.compatibility_score)
  }, [matches])

  useEffect(() => {
    const el = listRefs.current[focusedIndex]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [focusedIndex])

  const handleSendRequest = async (matchId: string) => {
    setSendingRequest(matchId)
    try {
      await matchingService.sendRequest(matchId, "I would like to carpool with you.")
      setMatches(prev => prev.map(m => m.id === matchId ? ({ ...m }) : m))
      onStatsUpdate?.()
    } finally {
      setSendingRequest(null)
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800'
    if (score >= 0.8) return 'bg-blue-100 text-blue-800'
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding potential matches...</p>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Potential Matches</h2>
            <Badge variant="secondary">0 matches</Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Advanced Filter Component */}
        {showFilters && (
          <MatchFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onApplyFilters={() => loadMatches(filters)}
          />
        )}

        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">
              {Object.keys(filters).length > 0 
                ? "No matches found with your current filters. Try adjusting your search criteria."
                : "We couldn't find any compatible carpool partners in your area right now."
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => loadMatches(filters)} variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Refresh Matches
              </Button>
              {Object.keys(filters).length > 0 && (
                <Button onClick={handleClearFilters} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const current = sortedMatches[focusedIndex]

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Potential Matches</h2>
          <Badge variant="secondary">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Sliders className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Advanced Filter Component */}
      {showFilters && (
        <MatchFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onApplyFilters={() => loadMatches(filters)}
        />
      )}

      {/* Match Navigation */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{focusedIndex + 1} of {sortedMatches.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Use Back/Next to browse matches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadMatches(filters)}>Refresh</Button>
          <Button variant="outline" size="sm" onClick={() => setFocusedIndex(i => Math.max(0, i - 1))} disabled={focusedIndex <= 0}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button size="sm" onClick={() => setFocusedIndex(i => Math.min(sortedMatches.length - 1, i + 1))} disabled={focusedIndex >= sortedMatches.length - 1}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader ref={(el: any) => { if (el) listRefs.current[focusedIndex] = el }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${current.user2.name}`} />
                  <AvatarFallback>{current.user2.display_name}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{current.user2.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>Near you</span>
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getCompatibilityColor(current.compatibility_score)}>
                  {Math.round(current.compatibility_score * 100)}% Match
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{Math.round(current.route_overlap_percentage * 100)}% Route Overlap</p>
                  <p className="text-xs text-gray-600">{current.estimated_pickup_distance_miles} miles pickup</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{current.user2.schedule.work_start_time}</p>
                  <p className="text-xs text-gray-600">{current.user2.schedule.work_days.join(', ')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Route Match</p>
                  <p className="text-xs text-gray-600">Compatible route</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Why you match:</h4>
              <div className="flex flex-wrap gap-2">
                {current.match_reasons.map((reason, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleSendRequest(current.id)}
                disabled={sendingRequest === current.id}
                className="flex-1"
              >
                {sendingRequest === current.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Carpool Request
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 