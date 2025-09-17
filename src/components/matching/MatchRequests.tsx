'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Clock, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'
import type { MatchRequestsResponse } from '@/types/api'

interface Props { onStatsUpdate?: () => void }

export function MatchRequests({ onStatsUpdate }: Props) {
  const matching = useMatchingService()
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<MatchRequestsResponse>({ incoming: [], outgoing: [] })
  const [processing, setProcessing] = useState<string | null>(null)
  const [incomingIndex, setIncomingIndex] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await matching.getRequests()
      setRequests(data)
      setIncomingIndex(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const accept = async (id: string) => {
    setProcessing(id)
    try {
      await matching.respondToRequest(id, 'accepted')
      setRequests(prev => ({
        incoming: prev.incoming.map(r => (r.id === id ? { ...r, status: 'accepted' as const } : r)),
        outgoing: prev.outgoing
      }))
      onStatsUpdate?.()
    } finally {
      setProcessing(null)
    }
  }

  const reject = async (id: string) => {
    setProcessing(id)
    try {
      await matching.respondToRequest(id, 'rejected')
      setRequests(prev => ({
        incoming: prev.incoming.map(r => (r.id === id ? { ...r, status: 'rejected' as const } : r)),
        outgoing: prev.outgoing
      }))
      onStatsUpdate?.()
    } finally {
      setProcessing(null)
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

  const timeUntil = (expiresAt: string) => {
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

  const hasIncoming = requests.incoming.length > 0
  const currentIncoming = hasIncoming ? requests.incoming[incomingIndex] : null

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Incoming Requests ({requests.incoming.filter(r => r.status === 'pending').length})</h2>
            {hasIncoming && (
              <>
                <p className="text-sm text-muted-foreground">{incomingIndex + 1} of {requests.incoming.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Use Back/Next to review requests</p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
            <Button variant="outline" size="sm" onClick={() => setIncomingIndex(i => Math.max(0, i - 1))} disabled={!hasIncoming || incomingIndex <= 0}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button size="sm" onClick={() => setIncomingIndex(i => Math.min(requests.incoming.length - 1, i + 1))} disabled={!hasIncoming || incomingIndex >= requests.incoming.length - 1}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        {!hasIncoming ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
              <p className="text-gray-600">You don&apos;t have any carpool requests at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentIncoming!.from_user.name}`} />
                      <AvatarFallback>{currentIncoming!.from_user.display_name}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{currentIncoming!.from_user.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(currentIncoming!.created_at)}</span>
                        <span>•</span>
                        <span>{timeUntil(currentIncoming!.expires_at)}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(currentIncoming!.status)}>{currentIncoming!.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentIncoming!.message && <p className="text-gray-700 mb-4">{currentIncoming!.message}</p>}
                {currentIncoming!.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => accept(currentIncoming!.id)} disabled={processing === currentIncoming!.id} className="flex-1">
                      {processing === currentIncoming!.id ? (
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
                    <Button variant="outline" onClick={() => reject(currentIncoming!.id)} disabled={processing === currentIncoming!.id}>
                      {processing === currentIncoming!.id ? (
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
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Outgoing Requests ({requests.outgoing.length})</h2>
        </div>
        {requests.outgoing.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
              <p className="text-gray-600">You haven&apos;t sent any carpool requests yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.outgoing.map((r) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${r.to_user.name}`} />
                        <AvatarFallback>{r.to_user.display_name}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{r.to_user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(r.created_at)}</span>
                          <span>•</span>
                          <span>{timeUntil(r.expires_at)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {r.message && <p className="text-gray-700">{r.message}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 