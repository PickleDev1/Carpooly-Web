'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Clock, 
  Check, 
  X,
  User,
  Calendar,
  Users
} from 'lucide-react'
import { useMatchingService, MatchRequest } from '@/services/matching'
import Link from 'next/link'

interface MatchRequestsProps {
  onStatsUpdate?: () => void
}

interface RequestsState {
  incoming: MatchRequest[]
  outgoing: MatchRequest[]
}

// Mock data for development fallback
const mockRequests: RequestsState = {
  incoming: [
    {
      id: '1',
      from_user: {
        id: 'user1',
        name: 'Sarah Johnson',
        display_name: 'Sarah J.'
      },
      to_user: {
        id: 'current-user',
        name: 'You',
        display_name: 'You'
      },
      message: 'Hi! I saw we have similar routes. Would you like to carpool together?',
      status: 'pending',
      created_at: '2024-01-15T10:30:00Z',
      expires_at: '2024-01-18T10:30:00Z'
    } as MatchRequest
  ],
  outgoing: [
    {
      id: '2',
      from_user: {
        id: 'current-user',
        name: 'You',
        display_name: 'You'
      },
      to_user: {
        id: 'user2',
        name: 'Mike Chen',
        display_name: 'Mike C.'
      },
      message: 'Hey Mike! I noticed we have similar routes. Interested in carpooling?',
      status: 'pending',
      created_at: '2024-01-14T15:45:00Z',
      expires_at: '2024-01-17T15:45:00Z'
    } as MatchRequest
  ]
}

export function MatchRequests({ onStatsUpdate }: MatchRequestsProps) {
  const [requests, setRequests] = useState(mockRequests)
  const [loading, setLoading] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const matchingService = useMatchingService()

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 MatchRequests: Starting to load requests...')
      const data = await matchingService.getRequests()
      console.log('✅ MatchRequests: Successfully loaded requests:', data)
      setRequests(data)
    } catch (error) {
      console.error('❌ MatchRequests: Failed to load requests:', error)
      if (error instanceof Error) {
        console.error('❌ MatchRequests: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
        setError(error.message)
      }
      // Use mock data for development
      setRequests(mockRequests)
    } finally {
      setLoading(false)
    }
  }, [matchingService])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(requestId)
    try {
      await matchingService.respondToRequest(requestId, 'accept', 'Great! Let&apos;s carpool together.')
      
      // Update local state
      setRequests(prev => ({
        ...prev,
        incoming: prev.incoming.map(req => 
          req.id === requestId ? { ...req, status: 'accepted' as const } : req
        )
      }))
      
      // Update stats in parent component
      onStatsUpdate?.()
      
    } catch (error) {
      console.error('Failed to accept request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest(requestId)
    try {
      await matchingService.respondToRequest(requestId, 'reject', 'Thanks for the offer, but I&apos;ll pass for now.')
      
      // Update local state
      setRequests(prev => ({
        ...prev,
        incoming: prev.incoming.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' as const } : req
        )
      }))
      
      // Update stats in parent component
      onStatsUpdate?.()
      
    } catch (error) {
      console.error('Failed to reject request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return 'Expires soon'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Error loading requests: {error}</span>
              </div>
              <Button variant="outline" size="sm" onClick={loadRequests} className="text-red-600 border-red-300 hover:bg-red-100">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Incoming Requests ({requests.incoming.filter(r => r.status === 'pending').length})</h2>
          <Button variant="outline" size="sm" onClick={loadRequests} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {requests.incoming.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
              <p className="text-gray-600 mb-4">You don&apos;t have any carpool requests at the moment.</p>
              <p className="text-sm text-gray-500 mb-4">Start by finding potential carpool partners!</p>
              <Link href="/matching">
                <Button className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Find New Matches
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.incoming.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.from_user.name}`} />
                        <AvatarFallback>{request.from_user.display_name}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.from_user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(request.created_at)}</span>
                          <span>•</span>
                          <span>{getTimeUntilExpiry(request.expires_at)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {request.message && (
                    <p className="text-gray-700 mb-4">{request.message}</p>
                  )}
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={processingRequest === request.id}
                        className="flex-1"
                      >
                        {processingRequest === request.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Accepting...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={processingRequest === request.id}
                      >
                        {processingRequest === request.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Outgoing Requests ({requests.outgoing.length})</h2>
        </div>
        
        {requests.outgoing.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
              <p className="text-gray-600 mb-4">You haven&apos;t sent any carpool requests yet.</p>
              <p className="text-sm text-gray-500 mb-4">Start by finding potential carpool partners!</p>
              <Link href="/matching">
                <Button className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Find New Matches
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.outgoing.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.to_user.name}`} />
                        <AvatarFallback>{request.to_user.display_name}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{request.to_user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(request.created_at)}</span>
                          <span>•</span>
                          <span>{getTimeUntilExpiry(request.expires_at)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {request.message && (
                    <p className="text-gray-700">{request.message}</p>
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