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
  Users,
  Settings
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'
import { type PotentialMatch, type MatchFilters } from '@/types/matching'
import { validateCarpoolName } from '@/utils/validation'
// Advanced filters removed from Potential Matches; filters are managed via Preferences

// Transform backend response to match our interface
const transformBackendMatch = (backendMatch: any): PotentialMatch => {
  return {
    id: backendMatch.id,
    compatibility_score: backendMatch.compatibility_score,
    estimated_savings_per_month: backendMatch.estimated_savings_per_month,
    match_reasons: backendMatch.match_reasons,
    route_overlap_percentage: backendMatch.route_overlap_percentage,
    schedule: backendMatch.schedule || backendMatch.schedule_compatibility,
    total_distance_miles: backendMatch.total_distance_miles,
    // Include the Clerk ID from backend response (try both possible locations)
    user2_clerk_id: backendMatch.user2_clerk_id || backendMatch.user2?.clerk_id,
    user2: {
      id: backendMatch.user2.id,
      name: backendMatch.user2.name,
      display_name: backendMatch.user2.display_name,
      home_location: backendMatch.user2.home_location,
      destination_location: backendMatch.user2.destination_location
    }
  };
};

interface PotentialMatchesProps {
  onStatsUpdate?: () => void
  onNavigateToPreferences?: () => void
  onNavigateToRequests?: () => void
  onRequestSent?: () => void
  onMatchesLoaded?: (count: number) => void
}

export function PotentialMatches({ onStatsUpdate, onNavigateToPreferences, onNavigateToRequests, onRequestSent, onMatchesLoaded }: PotentialMatchesProps) {
  const [matches, setMatches] = useState<PotentialMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [missingDestination, setMissingDestination] = useState(false)
  const [isComposingForMatchId, setIsComposingForMatchId] = useState<string | null>(null)
  const [messageDraftByMatchId, setMessageDraftByMatchId] = useState<Record<string, string>>({})
  const [carpoolNameByMatchId, setCarpoolNameByMatchId] = useState<Record<string, string>>({})
  const [seatPreferenceByMatchId, setSeatPreferenceByMatchId] = useState<Record<string, number>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set())
  const [existingRequests, setExistingRequests] = useState<Set<string>>(new Set()) // Track existing requests by user ID
  const [incomingRequestsCount, setIncomingRequestsCount] = useState(0)
  // Filters UI removed; backend should use saved Preferences
  const listRefs = useRef<HTMLDivElement[]>([])
  
  const matchingService = useMatchingService()

  // Load existing requests to filter out users who already have requests
  const loadExistingRequests = useCallback(async () => {
    try {
      console.log('🔄 Loading existing requests for filtering...')
      const requestsData = await matchingService.getRequests()
      console.log('📋 Requests data for filtering:', requestsData)
      console.log('📋 Incoming requests count:', requestsData.incoming?.length || 0)
      console.log('📋 Outgoing requests count:', requestsData.outgoing?.length || 0)
      
      // Count pending incoming requests
      const pendingIncoming = requestsData.incoming.filter(r => r.status === 'pending')
      setIncomingRequestsCount(pendingIncoming.length)
      
      const existingUserIds = new Set<string>()
      
      // Add users from outgoing requests (users we've already sent requests to)
      requestsData.outgoing.forEach(request => {
        if (request.to_user?.id) {
          existingUserIds.add(request.to_user.id)
          console.log('🚫 Adding outgoing request user to filter:', request.to_user.id)
        }
      })
      
      // Add users from incoming requests (users who have sent us requests)
      requestsData.incoming.forEach(request => {
        if (request.from_user?.id) {
          existingUserIds.add(request.from_user.id)
          console.log('🚫 Adding incoming request user to filter:', request.from_user.id)
        }
      })
      
      console.log('🚫 Existing request user IDs to filter out:', Array.from(existingUserIds))
      console.log('🚫 Setting existingRequests state to:', Array.from(existingUserIds))
      setExistingRequests(existingUserIds)
      
      // Return the set so it can be used immediately
      return existingUserIds
    } catch (error) {
      console.warn('⚠️ Failed to load existing requests for filtering:', error)
      const emptySet = new Set<string>()
      setExistingRequests(emptySet)
      setIncomingRequestsCount(0)
      return emptySet
    }
  }, [matchingService])

  const loadMatches = useCallback(async (currentFilters: MatchFilters = {}) => {
    setLoading(true)
    setMissingDestination(false)
    try {
      console.log('🔍 Loading matches with filters:', currentFilters)
      
      // First, load existing requests to know which users to filter out
      console.log('🔄 About to call loadExistingRequests...')
      let existingUserIds: Set<string>
      try {
        existingUserIds = await loadExistingRequests()
        console.log('✅ loadExistingRequests completed, got user IDs:', Array.from(existingUserIds))
      } catch (error) {
        console.error('❌ loadExistingRequests failed:', error)
        existingUserIds = new Set<string>()
      }
      
      // First, let's check the user's preferences to see if they're properly set
      try {
        const prefsResponse = await matchingService.getPreferences()
        // Handle "not configured" response
        if ('configured' in prefsResponse && prefsResponse.configured === false) {
          console.warn('Preferences not configured:', prefsResponse.message)
          setMatches([])
          setLoading(false)
          return
        }
        // Type guard: prefsResponse is MatchingPreferences at this point
        const prefs = prefsResponse as import('@/types/matching').MatchingPreferences
        console.log('👤 User preferences:', prefs)
        console.log('📍 Destination coordinates:', { lat: prefs.destination_latitude, lng: prefs.destination_longitude })
        console.log('📍 Destination address:', prefs.destination_address)
        console.log('⏰ Arrival time:', prefs.arrival_time)
        console.log('📅 Commute days:', prefs.commute_days)
        console.log('✅ Is active:', prefs.is_active)
        console.log('👥 Preferred group size:', prefs.preferred_group_size)
        console.log('🎯 Min compatibility score:', prefs.min_compatibility_score)
        
        // Check if destination is set (not 0,0 and not null/undefined)
        let hasValidDestination = prefs.destination_latitude !== 0 && 
                                   prefs.destination_longitude !== 0 && 
                                   prefs.destination_latitude !== null && 
                                   prefs.destination_longitude !== null &&
                                   prefs.destination_latitude !== undefined && 
                                   prefs.destination_longitude !== undefined
        

        if (!hasValidDestination) {
          console.warn('⚠️ Destination missing or invalid in preferences:', { 
            lat: prefs.destination_latitude, 
            lng: prefs.destination_longitude 
          })
          setMissingDestination(true)
          setMatches([])
          return
        }
        
        if (!prefs.is_active) {
          console.warn('⚠️ User preferences are not active! This will prevent matches from being generated.')
          console.warn('⚠️ Please enable preferences in the Preferences tab')
        }
      } catch (prefErr) {
        console.warn('⚠️ Could not fetch user preferences:', prefErr)
      }
      

      // Ensure server has up-to-date generated matches for this user
      try {
        console.log('🔄 Triggering match generation...')
        console.log('🔄 Using filters:', currentFilters)
        const matchResult = await matchingService.findMatches({ 
          filters: currentFilters,
          force_refresh: true, // Force backend to regenerate matches
          max_results: 50 // Increase max results to see more matches
        })
        console.log('✅ Match generation completed:', matchResult)
        console.log('✅ Matches found:', matchResult.matches_found)
        console.log('✅ Message:', matchResult.message)
      } catch (genErr) {
        console.error('❌ Match generation failed:', genErr)
        console.error('❌ This might be why no matches are found')
      }
      
      const data = await matchingService.getPotentialMatches(currentFilters)
      console.log('📊 Received data:', data)
      console.log('📋 Pending matches count:', data.pending_matches?.length || 0)
      console.log('📋 Accepted matches count:', data.accepted_matches?.length || 0)
      console.log('📋 Expired matches count:', data.expired_matches?.length || 0)
      
      // Debug: Log all matches to see their structure
      if (data.pending_matches && data.pending_matches.length > 0) {
        console.log('🔍 All pending matches:', data.pending_matches)
        console.log('🔍 First match structure:', data.pending_matches[0])
        console.log('🔍 First match keys:', Object.keys(data.pending_matches[0]))
        if (data.pending_matches[0].user2) {
          console.log('🔍 First match user2:', data.pending_matches[0].user2)
          if (data.pending_matches[0].user2.work_location) {
            console.log('🔍 First match work location:', data.pending_matches[0].user2.work_location)
          }
          if (data.pending_matches[0].user2.home_location) {
            console.log('🔍 First match home location:', data.pending_matches[0].user2.home_location)
          }
        }
        console.log('🔍 First match compatibility_score:', data.pending_matches[0].compatibility_score)
        console.log('🔍 First match route_overlap_percentage:', data.pending_matches[0].route_overlap_percentage)
      } else {
        console.warn('⚠️ No pending matches returned from backend')
        console.warn('⚠️ This could mean:')
        console.warn('   - No other users with active preferences')
        console.warn('   - Compatibility scores below threshold')
        console.warn('   - Schedule/demographic mismatches')
        console.warn('   - Destination proximity not close enough')
      }
      
      // Transform and filter out matches where requests already exist
      const transformedMatches = (data.pending_matches || []).map(transformBackendMatch)
      console.log('🔍 Transformed matches before filtering:', transformedMatches.map(m => ({ id: m.id, user2_id: m.user2.id, user2_name: m.user2.name })))
      console.log('🔍 Using existing user IDs for filtering:', Array.from(existingUserIds))
      
      const filteredMatches = transformedMatches.filter(match => {
        const shouldExclude = existingUserIds.has(match.user2.id)
        if (shouldExclude) {
          console.log(`🚫 Filtering out match with user ${match.user2.id} (${match.user2.name}) - request already exists`)
        } else {
          console.log(`✅ Keeping match with user ${match.user2.id} (${match.user2.name}) - no existing request`)
        }
        return !shouldExclude
      })
      
      console.log(`📊 Filtered matches: ${filteredMatches.length} out of ${transformedMatches.length} (removed ${transformedMatches.length - filteredMatches.length} with existing requests)`)
      setMatches(filteredMatches)
      setFocusedIndex(0)
      
      // Update header counts
      onMatchesLoaded?.(filteredMatches.length)
    } catch (error: any) {
      console.error('❌ Failed to load matches:', error)
      if (error?.status === 400) {
        setMissingDestination(true)
      }
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [matchingService, loadExistingRequests, onMatchesLoaded])

  useEffect(() => {
    loadMatches()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- Only run once on mount to prevent infinite loop

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => b.compatibility_score - a.compatibility_score)
  }, [matches])

  useEffect(() => {
    const el = listRefs.current[focusedIndex]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [focusedIndex])

  const handleOpenCompose = (matchId: string) => {
    setIsComposingForMatchId(matchId)
    setMessageDraftByMatchId(prev => ({
      ...prev,
      [matchId]: prev[matchId] ?? ''
    }))
  }

  const handleChangeDraft = (matchId: string, value: string) => {
    setMessageDraftByMatchId(prev => ({ ...prev, [matchId]: value }))
  }

  const handleChangeCarpoolName = (matchId: string, value: string) => {
    setCarpoolNameByMatchId(prev => ({ ...prev, [matchId]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[matchId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[matchId]
        return newErrors
      })
    }
  }

  const handleChangeSeatPreference = (matchId: string, value: number) => {
    // Validate the seat preference value
    if (value < 2 || value > 8) {
      console.warn('Invalid carpool size:', value, 'Must be between 2 and 8')
      return
    }
    setSeatPreferenceByMatchId(prev => ({ ...prev, [matchId]: value }))
  }

  const handleCancelCompose = () => {
    setIsComposingForMatchId(null)
  }

  const handleSendRequest = async (matchId: string) => {
    setSendingRequest(matchId)
    try {
      const currentMatch = matches.find(m => m.id === matchId)
      if (!currentMatch) {
        throw new Error('Match not found')
      }

      // Validate carpool name
      const carpoolName = carpoolNameByMatchId[matchId]?.trim()
      const nameValidation = validateCarpoolName(carpoolName)
      
      if (!nameValidation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [matchId]: nameValidation.error!
        }))
        return
      }

      const raw = (messageDraftByMatchId[matchId] ?? '').trim()
      const message = raw.length > 0
        ? raw.slice(0, 280)
        : 'Hi! We have compatible routes and schedules. Would you like to carpool?'

      // Debug: Log the full match data to see the structure
      console.log('🔍 Full match data for debugging:', currentMatch)
      console.log('🔍 user2_clerk_id field:', currentMatch.user2_clerk_id)
      console.log('🔍 user2.clerk_id field:', (currentMatch as any).user2?.clerk_id)
      console.log('🔍 All match keys:', Object.keys(currentMatch))
      console.log('🔍 user2 keys:', currentMatch.user2 ? Object.keys(currentMatch.user2) : 'user2 is null/undefined')
      
      // Use Clerk ID provided by backend for efficient API calls
      // Try both possible locations: top-level user2_clerk_id or nested user2.clerk_id
      const toUserClerkId = currentMatch.user2_clerk_id || (currentMatch as any).user2?.clerk_id
      if (!toUserClerkId) {
        console.error('❌ Clerk ID not found in either location.')
        console.error('❌ Available top-level fields:', Object.keys(currentMatch))
        console.error('❌ Available user2 fields:', currentMatch.user2 ? Object.keys(currentMatch.user2) : 'user2 is null/undefined')
        throw new Error('Clerk ID not found in match data. Please refresh and try again.')
      }
      
      console.log('✅ Found Clerk ID:', toUserClerkId)
      
      // Validate and set carpool size preference
      const preferredSize = seatPreferenceByMatchId[matchId] || 4
      if (preferredSize < 2 || preferredSize > 8) {
        throw new Error('Carpool size must be between 2 and 8 people')
      }

      const response = await matchingService.sendRequest(
        toUserClerkId,
        matchId,
        message,
        carpoolName,
        preferredSize
      )
      console.log('✅ Carpool request sent successfully:', response)

      // Optimistically mark as sent for this session
      setSentRequestIds(prev => new Set([...Array.from(prev), matchId]))
      setIsComposingForMatchId(null)

      // Add the user to existing requests to filter them out from future matches
      setExistingRequests(prev => new Set([...Array.from(prev), currentMatch.user2.id]))

      // Update stats and refresh requests
      onStatsUpdate?.()
      onRequestSent?.()
      // Optionally keep user on the page; provide a separate "View Requests" button
    } catch (error: any) {
      console.error('❌ Failed to send carpool request:', error)
      // Map backend validation errors to inline field message
      if (error?.code === 'VALIDATION_ERROR' && error?.details?.field === 'carpool_name') {
        const backendMsg = error?.details?.message || 'Please enter a valid carpool name.'
        setValidationErrors(prev => ({ ...prev, [matchId]: backendMsg }))
      } else if (typeof error?.message === 'string') {
        alert(error.message)
      } else {
        alert('Failed to send carpool request. Please try again.')
      }
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

  if (missingDestination) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Destination to See Matches</CardTitle>
          <CardDescription>
            Your work destination is required to compute route overlap, distance, and savings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button onClick={onNavigateToPreferences}>
              <MapPin className="w-4 h-4 mr-2" /> Go to Preferences
            </Button>
            <Button variant="outline" onClick={() => loadMatches()}>Refresh</Button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Tip: Enter destination latitude and longitude in Preferences. You can copy them from Google Maps.</p>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        {/* Incoming Requests Alert Banner */}
        {incomingRequestsCount > 0 && (
          <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">
                    You have {incomingRequestsCount} pending request{incomingRequestsCount > 1 ? 's' : ''}!
                  </h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Someone wants to carpool with you. Check the <strong>Requests</strong> tab to view and respond.
                  </p>
                  <Button 
                    onClick={onNavigateToRequests}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    size="sm"
                  >
                    View Requests →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Potential Matches</h2>
          <Badge variant="secondary">0 matches</Badge>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No potential matches at this time</h3>
            <p className="text-gray-600 mb-4">
              We are currently looking to find you more compatible carpool partners. Check back soon or update your matching preferences to expand your search.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => loadMatches({})} 
                variant="outline"
                className="flex items-center gap-2 px-6 py-2"
              >
                <Navigation className="w-4 h-4" />
                Refresh Matches
              </Button>
              <Button 
                onClick={onNavigateToPreferences}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Settings className="w-4 h-4" />
                Go to Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const current = sortedMatches[focusedIndex]

  // Safety check - if no current match, show empty state
  if (!current) {
    return (
      <div className="space-y-6">
        {/* Incoming Requests Alert Banner */}
        {incomingRequestsCount > 0 && (
          <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">
                    You have {incomingRequestsCount} pending request{incomingRequestsCount > 1 ? 's' : ''}!
                  </h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Someone wants to carpool with you. Check the <strong>Requests</strong> tab to view and respond.
                  </p>
                  <Button 
                    onClick={onNavigateToRequests}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    size="sm"
                  >
                    View Requests →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Potential Matches</h2>
          <Badge variant="secondary">0 matches</Badge>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No potential matches at this time</h3>
            <p className="text-gray-600 mb-4">
              We are currently looking to find you more compatible carpool partners. Check back soon or update your matching preferences to expand your search.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => loadMatches({})} 
                variant="outline"
                className="flex items-center gap-2 px-6 py-2"
              >
                <Navigation className="w-4 h-4" />
                Refresh Matches
              </Button>
              <Button 
                onClick={onNavigateToPreferences}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Settings className="w-4 h-4" />
                Go to Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Incoming Requests Alert Banner */}
      {incomingRequestsCount > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  You have {incomingRequestsCount} pending request{incomingRequestsCount > 1 ? 's' : ''}!
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  Someone wants to carpool with you. Check the <strong>Requests</strong> tab to view and respond.
                </p>
                <Button 
                  onClick={onNavigateToRequests}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  View Requests →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Potential Matches</h2>
          <Badge variant="secondary">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </Badge>
        </div>
        <Button variant="outline" onClick={() => loadMatches({})} className="flex items-center gap-2">
          Refresh
        </Button>
      </div>

      {/* Filters removed from this view; manage in Preferences tab */}

      {/* Match Navigation */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{focusedIndex + 1} of {sortedMatches.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Use Back/Next to browse matches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadMatches({})}>Refresh</Button>
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
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${current.user2?.name || 'User'}`} />
                  <AvatarFallback>
                    {typeof current.user2?.display_name === 'string' ? current.user2.display_name : current.user2?.display_name?.String || current.user2?.name || 'User'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{current.user2?.name || 'Unknown User'}</CardTitle>
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
                  <p className="text-sm font-medium">{current.route_overlap_percentage}% Route Overlap</p>
                  <p className="text-xs text-gray-600">{Number(current.total_distance_miles).toFixed(2)} miles total</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{current.schedule?.departure_time || 'Not specified'}</p>
                  <p className="text-xs text-gray-600">{current.schedule?.frequency || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">${Number(current.estimated_savings_per_month).toFixed(2)}/month</p>
                  <p className="text-xs text-gray-600">Estimated savings</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Why you match:</h4>
              <div className="flex flex-wrap gap-2">
                {current.match_reasons?.map((reason, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                )) || <Badge variant="secondary" className="text-xs">Compatible preferences</Badge>}
              </div>
            </div>

            {/* Compose message */}
            {isComposingForMatchId === current.id && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {/* Carpool Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    What would you like to call this carpool? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={carpoolNameByMatchId[current.id] ?? ''}
                    onChange={(e) => handleChangeCarpoolName(current.id, e.target.value)}
                    maxLength={255}
                    className={`w-full rounded-lg border-2 bg-white p-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors[current.id] 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="e.g., Morning Commute to Downtown, Evening Ride Home"
                    required
                  />
                  {validationErrors[current.id] ? (
                    <p className="text-xs text-red-600 mt-1">{validationErrors[current.id]}</p>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1">
                      Choose a name that describes this carpool (e.g., &quot;Morning Commute to Downtown&quot;)
                    </p>
                  )}
                </div>

                <label className="block text-sm font-medium text-gray-900 mb-2">Add a short message (optional)</label>
                <textarea
                  value={messageDraftByMatchId[current.id] ?? ''}
                  onChange={(e) => handleChangeDraft(current.id, e.target.value)}
                  maxLength={280}
                  rows={4}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Hey, my name is ... I work at ... I'd love to carpool Mon–Fri around 8:00 AM since we both go to the same workplace!"
                />
                {/* Seat Preference Selection */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    How many people do you want in this carpool?
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[2, 3, 4, 5, 6].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleChangeSeatPreference(current.id, size)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          (seatPreferenceByMatchId[current.id] || 4) === size
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {size} people
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This will be the total size of your carpool (including you and {current.user2.name}). 
                    Room for {Math.max(0, (seatPreferenceByMatchId[current.id] || 4) - 2)} additional people.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {(messageDraftByMatchId[current.id] ?? '').length}/280 characters
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelCompose}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSendRequest(current.id)} 
                      disabled={sendingRequest === current.id || !carpoolNameByMatchId[current.id]?.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {sendingRequest === current.id ? 'Sending…' : 'Send Request'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={() => (sentRequestIds.has(current.id) ? null : (isComposingForMatchId === current.id ? handleSendRequest(current.id) : handleOpenCompose(current.id)))}
                disabled={sendingRequest === current.id || sentRequestIds.has(current.id)}
                className="flex-1"
              >
                {sentRequestIds.has(current.id) ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request Sent
                  </>
                ) : isComposingForMatchId === current.id ? (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Request
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