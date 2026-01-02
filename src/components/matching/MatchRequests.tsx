'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Clock, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'
import type { MatchRequestsResponse } from '@/types/matching'

// Helper function to safely extract display name
const getDisplayName = (displayName: any, fallbackName?: string, userId?: string, email?: string): string => {
  if (typeof displayName === 'string' && displayName.trim()) {
    return displayName
  }
  if (displayName && typeof displayName === 'object' && displayName.String && displayName.String.trim()) {
    return displayName.String
  }
  if (fallbackName && fallbackName.trim()) {
    return fallbackName
  }
  
  // If no name is available, try to extract name from email
  if (email && email.includes('@')) {
    const emailName = email.split('@')[0]
    // Capitalize first letter and replace dots/numbers with spaces
    const formattedName = emailName
      .replace(/[._-]/g, ' ')
      .replace(/\d+/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim()
    
    if (formattedName && formattedName.length > 0) {
      return formattedName
    }
  }
  
  // If no name is available, try to create initials from user ID
  if (userId) {
    // Extract first 2 characters from user ID for initials
    const initials = userId.substring(0, 2).toUpperCase()
    return `User ${initials}`
  }
  
  return 'User'
}

interface Props { 
  onStatsUpdate?: () => void
  refreshTrigger?: number
}

export function MatchRequests({ onStatsUpdate, refreshTrigger }: Props) {
  const matching = useMatchingService()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<MatchRequestsResponse>({ incoming: [], outgoing: [] })
  const [processing, setProcessing] = useState<string | null>(null)
  const [incomingIndex, setIncomingIndex] = useState(0)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [requestToAccept, setRequestToAccept] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [acceptedInfo, setAcceptedInfo] = useState<{ carpoolId: string; carpoolName?: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      console.log('🔄 MatchRequests: Loading requests...')
      const data = await matching.getRequests()
      console.log('📋 MatchRequests: Received data:', data)
      
      // Filter for pending requests only (exclude accepted, declined, rejected)
      const pendingIncoming = data.incoming.filter(r => r.status === 'pending')
      const pendingOutgoing = data.outgoing.filter(r => r.status === 'pending')
      
      console.log('📋 MatchRequests: Pending incoming count:', pendingIncoming.length)
      console.log('📋 MatchRequests: Pending outgoing count:', pendingOutgoing.length)
      
      setRequests({
        incoming: pendingIncoming,
        outgoing: pendingOutgoing
      })
      setIncomingIndex(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  
  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      load()
    }
  }, [refreshTrigger, load])

  const handleAcceptClick = (id: string) => {
    setRequestToAccept(id)
    setShowAcceptDialog(true)
  }

  const confirmAccept = async () => {
    if (!requestToAccept) return
    
    setProcessing(requestToAccept)
    setShowAcceptDialog(false)
    
    try {
      // Accept the request - backend now automatically creates carpool
      console.log('🚗 Accepting request and creating carpool automatically...')
      const response = await matching.updateRequestStatus(requestToAccept, 'accepted')
      
      // Check if carpool was created (new carpool_id field)
      console.log('🔍 Full response from updateRequestStatus:', response)
      console.log('🔍 Response keys:', Object.keys(response))
      console.log('🔍 Carpool ID in response:', response.carpool_id)
      
      if (response.carpool_id) {
        console.log('✅ Carpool created automatically:', response.carpool_id)
        
        // Remove the accepted request from the pending list (it will now appear in Accepted tab)
        setRequests(prev => ({
          incoming: prev.incoming.filter(r => r.id !== requestToAccept),
          outgoing: prev.outgoing
        }))
        
        // Show enhanced success dialog with quick actions
        const derivedName = (response as any).carpool_name || response.carpool?.name
        setAcceptedInfo({ carpoolId: response.carpool_id, carpoolName: derivedName })
        setShowSuccessDialog(true)
        
        // Update stats
        onStatsUpdate?.()
      } else {
        // Fallback: request accepted but no carpool created
        console.warn('⚠️ Request accepted but no carpool created')
        alert('Request accepted successfully!')
        
        // Still update the UI
        setRequests(prev => ({
          incoming: prev.incoming.map(r => (r.id === requestToAccept ? { ...r, status: 'accepted' as const } : r)),
          outgoing: prev.outgoing
        }))
        onStatsUpdate?.()
      }
    } catch (error: any) {
      console.error('❌ Failed to accept request:', error)
      alert('Failed to accept request. Please try again.')
    } finally {
      setProcessing(null)
      setRequestToAccept(null)
    }
  }

  const cancelAccept = () => {
    setShowAcceptDialog(false)
    setRequestToAccept(null)
  }

  const reject = async (id: string) => {
    setProcessing(id)
    try {
      await matching.updateRequestStatus(id, 'rejected')
      setRequests(prev => ({
        incoming: prev.incoming.map(r => (r.id === id ? { ...r, status: 'rejected' as const } : r)),
        outgoing: prev.outgoing
      }))
      onStatsUpdate?.()
    } catch (error: any) {
      console.error('❌ Failed to reject request:', error)
      alert('Failed to reject request. Please try again.')
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
            <h2 className="text-xl font-semibold">Incoming Requests ({requests.incoming.length})</h2>
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
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentIncoming?.from_user?.name || 'User'}`} />
                      <AvatarFallback>{getDisplayName(currentIncoming?.from_user?.display_name, currentIncoming?.from_user?.name, currentIncoming?.from_user?.id)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Request from {getDisplayName(currentIncoming?.from_user?.display_name, currentIncoming?.from_user?.name, currentIncoming?.from_user?.id)}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>Received {formatDate(currentIncoming?.created_at || '')}</span>
                        <span>•</span>
                        <span>{timeUntil(currentIncoming?.expires_at || '')} left</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(currentIncoming?.status || 'pending')}>{currentIncoming?.status || 'pending'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentIncoming?.message && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800 font-medium mb-1">Message from {getDisplayName(currentIncoming?.from_user?.display_name, currentIncoming?.from_user?.name, currentIncoming?.from_user?.id)}:</p>
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
                {currentIncoming?.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAcceptClick(currentIncoming?.id || '')} disabled={processing === currentIncoming?.id} className="flex-1">
                      {processing === currentIncoming?.id ? (
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

      {/* Outgoing Requests Section (Pending Only) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Outgoing Requests ({requests.outgoing.length})</h2>
        </div>
        {requests.outgoing.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending outgoing requests</h3>
              <p className="text-gray-600">You don&apos;t have any pending carpool requests.</p>
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
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${r.to_user?.name || 'User'}`} />
                        <AvatarFallback>{getDisplayName(r.to_user?.display_name, r.to_user?.name, r.to_user?.id)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">Request sent to {getDisplayName(r.to_user?.display_name, r.to_user?.name, r.to_user?.id)}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>Sent {formatDate(r.created_at)}</span>
                          <span>•</span>
                          <span>{timeUntil(r.expires_at)} left</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {r.message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium mb-1">Your message:</p>
                      <p className="text-gray-700">{r.message}</p>
                    </div>
                  )}

                  {/* Carpool Name Information for Outgoing Requests */}
                  {r.carpool_name && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-800 font-medium mb-1">Your Proposed Carpool Name:</p>
                      <p className="text-lg font-semibold text-green-900">{r.carpool_name}</p>
                    </div>
                  )}
                  
                  {/* Carpool Size Information for Outgoing Requests */}
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

      {/* Confirmation Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Carpool Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to make a carpool with {currentIncoming?.from_user?.name || 'this person'}?
              <br />
              <span className="text-sm text-gray-600 mt-2 block">
                You can delete it at any time.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelAccept}>
              Cancel
            </Button>
            <Button onClick={confirmAccept} disabled={processing === requestToAccept}>
              {processing === requestToAccept ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Accepting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Yes, Accept Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carpool Created</DialogTitle>
            <DialogDescription>
              {acceptedInfo?.carpoolName
                ? `"${acceptedInfo.carpoolName}" has been created. Rides for your shared days are ready on the calendar.`
                : 'Your carpool has been created. Rides for your shared days are ready on the calendar.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false)
              }}
            >
              Stay Here
            </Button>
            <Button
              onClick={() => {
                if (acceptedInfo?.carpoolId) {
                  router.push(`/carpools/${acceptedInfo.carpoolId}/calendar`)
                } else {
                  setShowSuccessDialog(false)
                }
              }}
            >
              View Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 