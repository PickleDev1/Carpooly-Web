'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Clock, 
  Star, 
  MessageSquare, 
  Route,
  DollarSign,
  User,
  Calendar,
  Navigation
} from 'lucide-react'
import { useMatchingService, PotentialMatch } from '@/services/matching'

interface PotentialMatchesProps {
  onStatsUpdate?: () => void
}

// Mock data for development fallback
const mockMatches: PotentialMatch[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'Sarah Johnson',
      display_name: 'Sarah J.',
      home_location: { lat: 37.7749, lng: -122.4194 },
      destination_location: { lat: 37.7849, lng: -122.4094 }
    },
    compatibility_score: 0.92,
    route_overlap_percentage: 85,
    total_distance_miles: 12.5,
    estimated_savings_per_month: 45,
    match_reasons: ['Same destination', 'Similar schedule', 'Close pickup location'],
    schedule_compatibility: {
      departure_time: '8:00 AM',
      frequency: 'Daily',
      flexibility_minutes: 15
    }
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Mike Chen',
      display_name: 'Mike C.',
      home_location: { lat: 37.7849, lng: -122.4294 },
      destination_location: { lat: 37.7849, lng: -122.4094 }
    },
    compatibility_score: 0.87,
    route_overlap_percentage: 78,
    total_distance_miles: 14.2,
    estimated_savings_per_month: 38,
    match_reasons: ['Route overlap', 'Flexible schedule'],
    schedule_compatibility: {
      departure_time: '8:15 AM',
      frequency: 'Daily',
      flexibility_minutes: 30
    }
  }
]

export function PotentialMatches({ onStatsUpdate }: PotentialMatchesProps) {
  const [matches, setMatches] = useState<PotentialMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)
  
  const matchingService = useMatchingService()

  const loadMatches = useCallback(async () => {
    setLoading(true)
    try {
      const data = await matchingService.getPotentialMatches()
      setMatches(data.pending_matches || [])
    } catch (error) {
      console.error('Failed to load matches:', error)
      // Use mock data for development
      setMatches(mockMatches)
    } finally {
      setLoading(false)
    }
  }, [matchingService])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  const handleSendRequest = async (matchId: string, toUserId: string) => {
    setSendingRequest(matchId)
    try {
      await matchingService.sendRequest(toUserId, matchId, 'Hi! I&apos;d like to carpool with you.')
      
      // Update local state to show request sent
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, status: 'request_sent' as any }
          : match
      ))
      
      // Update stats in parent component
      onStatsUpdate?.()
      
    } catch (error) {
      console.error('Failed to send request:', error)
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
      <Card>
        <CardContent className="p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find any compatible carpool partners in your area right now.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Try adjusting your preferences or expanding your search area to find more potential matches.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={loadMatches} variant="outline">Refresh Matches</Button>
            <Button onClick={() => window.location.href = '/matching?tab=preferences'}>
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
        <h2 className="text-xl font-semibold">Potential Matches ({matches.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMatches}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => (
          <Card key={match.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${match.user.name}`} />
                    <AvatarFallback>{match.user.display_name}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{match.user.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>2.3 miles from you</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getCompatibilityColor(match.compatibility_score)}>
                    {Math.round(match.compatibility_score * 100)}% Match
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{match.route_overlap_percentage}% Route Overlap</p>
                    <p className="text-xs text-gray-600">{match.total_distance_miles} miles total</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{match.schedule_compatibility.departure_time}</p>
                    <p className="text-xs text-gray-600">{match.schedule_compatibility.frequency}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">${match.estimated_savings_per_month}/month</p>
                    <p className="text-xs text-gray-600">Potential savings</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Why you match:</h4>
                <div className="flex flex-wrap gap-2">
                  {match.match_reasons.map((reason, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSendRequest(match.id, match.user.id)}
                  disabled={sendingRequest === match.id}
                  className="flex-1"
                >
                  {sendingRequest === match.id ? (
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
        ))}
      </div>
    </div>
  )
} 