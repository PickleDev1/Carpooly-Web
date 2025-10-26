'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Clock, 
  Check, 
  ChevronLeft,
  ChevronRight,
  Users,
  MessageSquare
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'
import type { MatchRequestsResponse } from '@/types/matching'

// Helper function to safely extract display name
const getDisplayName = (displayName: any, fallbackName?: string): string => {
  if (typeof displayName === 'string') {
    return displayName
  }
  if (displayName && typeof displayName === 'object' && displayName.String) {
    return displayName.String
  }
  return fallbackName || 'User'
}

interface Props { 
  onStatsUpdate?: () => void
  refreshTrigger?: number
}

export function AcceptedRequests({ onStatsUpdate, refreshTrigger }: Props) {
  const matching = useMatchingService()
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<MatchRequestsResponse>({ incoming: [], outgoing: [] })
  const [incomingIndex, setIncomingIndex] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      console.log('🔄 AcceptedRequests: Loading requests...')
      const data = await matching.getRequests()
      console.log('📋 AcceptedRequests: Received data:', data)
      
      // Filter for accepted requests only
      const acceptedIncoming = data.incoming.filter(r => r.status === 'accepted')
      const acceptedOutgoing = data.outgoing.filter(r => r.status === 'accepted')
      
      console.log('📋 AcceptedRequests: Accepted incoming count:', acceptedIncoming.length)
      console.log('📋 AcceptedRequests: Accepted outgoing count:', acceptedOutgoing.length)
      
      setRequests({
        incoming: acceptedIncoming,
        outgoing: acceptedOutgoing
      })
      setIncomingIndex(0)
    } finally {
      setLoading(false)
    }
  }, [matching])

  useEffect(() => { load() }, [load])
  
  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      load()
    }
  }, [refreshTrigger, load])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accepted requests...</p>
        </div>
      </div>
    )
  }

  const hasIncoming = requests.incoming.length > 0
  const currentIncoming = hasIncoming ? requests.incoming[incomingIndex] : null

  return (
    <div className="space-y-8">
      {/* Accepted Incoming Requests Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Accepted Incoming Requests ({requests.incoming.length})</h2>
            {hasIncoming && (
              <>
                <p className="text-sm text-muted-foreground">{incomingIndex + 1} of {requests.incoming.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Use Back/Next to review requests</p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              onClick={load}
            >
              Refresh
            </button>
            <button 
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
              onClick={() => setIncomingIndex(i => Math.max(0, i - 1))} 
              disabled={!hasIncoming || incomingIndex <= 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button 
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              onClick={() => setIncomingIndex(i => Math.min(requests.incoming.length - 1, i + 1))} 
              disabled={!hasIncoming || incomingIndex >= requests.incoming.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {!hasIncoming ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accepted incoming requests</h3>
              <p className="text-gray-600">You don&apos;t have any accepted incoming requests at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Card className="hover:shadow-md transition-shadow border-green-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentIncoming?.from_user?.name || 'User'}`} />
                      <AvatarFallback>{getDisplayName(currentIncoming?.from_user?.display_name, currentIncoming?.from_user?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Accepted from {currentIncoming?.from_user?.name || 'User'}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>Accepted {formatDate(currentIncoming?.created_at || '')}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentIncoming?.message && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800 font-medium mb-1">Message from {currentIncoming?.from_user?.name || 'User'}:</p>
                    <p className="text-gray-700">{currentIncoming.message}</p>
                  </div>
                )}

                {/* Carpool Name Information */}
                {currentIncoming?.carpool_name && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 font-medium mb-1">Proposed Carpool Name:</p>
                    <p className="text-lg font-semibold text-blue-900">{currentIncoming.carpool_name}</p>
                  </div>
                )}
                
                {/* Carpool Size Information */}
                {currentIncoming?.preferred_carpool_size && currentIncoming.preferred_carpool_size >= 2 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 font-medium mb-1">Carpool Size Preference:</p>
                    <p className="text-gray-700">
                      {currentIncoming.preferred_carpool_size} people total 
                      <span className="text-sm text-gray-600 ml-2">
                        (Room for {Math.max(0, currentIncoming.preferred_carpool_size - 2)} more people)
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Accepted Outgoing Requests Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Accepted Outgoing Requests ({requests.outgoing.length})</h2>
        </div>
        {requests.outgoing.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Check className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accepted outgoing requests</h3>
              <p className="text-gray-600">You don&apos;t have any accepted outgoing requests yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.outgoing.map((r) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow border-green-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${r.to_user?.name || 'User'}`} />
                        <AvatarFallback>{getDisplayName(r.to_user?.display_name, r.to_user?.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">Accepted by {r.to_user?.name || 'User'}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>Accepted {formatDate(r.created_at)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {r.message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium mb-1">Your message:</p>
                      <p className="text-gray-700">{r.message}</p>
                    </div>
                  )}

                  {/* Carpool Name Information for Accepted Outgoing Requests */}
                  {r.carpool_name && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-800 font-medium mb-1">Your Proposed Carpool Name:</p>
                      <p className="text-lg font-semibold text-green-900">{r.carpool_name}</p>
                    </div>
                  )}
                  
                  {/* Carpool Size Information for Accepted Outgoing Requests */}
                  {r.preferred_carpool_size && r.preferred_carpool_size >= 2 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-gray-800 font-medium mb-1">Your Carpool Size Preference:</p>
                      <p className="text-gray-700">
                        {r.preferred_carpool_size} people total 
                        <span className="text-sm text-gray-600 ml-2">
                          (Room for {Math.max(0, r.preferred_carpool_size - 2)} more people)
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
