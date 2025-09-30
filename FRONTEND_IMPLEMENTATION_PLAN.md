# Frontend Carpool Request System - Implementation Plan

## Overview
Implement complete carpool request functionality on the frontend, including sending requests, viewing requests, and managing request status.

## Current Status
- ✅ Matching system working
- ✅ Users can see potential matches
- ❌ **MISSING**: Send carpool request functionality
- ❌ **MISSING**: Request management UI
- ❌ **MISSING**: Request status tracking

## Implementation Plan

### Phase 1: Service Layer Implementation

#### 1.1 Update Matching Service (`src/services/matching.ts`)

**Add new methods to `useMatchingService` hook:**

```typescript
// Add to existing useMatchingService hook
async sendMatchRequest(request: {
  potential_match_id: string;
  to_user_id: string;
  message: string;
}): Promise<MatchRequestResponse> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests`
  
  logRequest('POST', endpoint, { request })
  try {
    const headers = await api.getHeaders()
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      const text = await response.text()
      console.error('sendMatchRequest error response:', response.status, text)
      throw { status: response.status, message: text }
    }
    
    const data = await response.json()
    logResponse('POST', endpoint, { success: true, requestId: data.id })
    return data
  } catch (error: any) {
    return handleApiError(error, 'send match request')
  }
},

async updateRequestStatus(requestId: string, status: 'accepted' | 'rejected'): Promise<UpdateRequestResponse> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests/${requestId}`
  
  logRequest('PUT', endpoint, { requestId, status })
  try {
    const headers = await api.getHeaders()
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
    
    if (!response.ok) {
      const text = await response.text()
      console.error('updateRequestStatus error response:', response.status, text)
      throw { status: response.status, message: text }
    }
    
    const data = await response.json()
    logResponse('PUT', endpoint, { success: true, status })
    return data
  } catch (error: any) {
    return handleApiError(error, 'update request status')
  }
}
```

#### 1.2 Update Type Definitions (`src/types/matching.ts`)

**Add new interfaces:**

```typescript
export interface MatchRequest {
  id: string
  from_user_id: string
  to_user_id: string
  potential_match_id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at: string
  created_at: string
  from_user?: {
    id: string
    name: string
    display_name: string
  }
  to_user?: {
    id: string
    name: string
    display_name: string
  }
}

export interface MatchRequestsResponse {
  incoming: MatchRequest[]
  outgoing: MatchRequest[]
}

export interface MatchRequestResponse {
  id: string
  from_user_id: string
  to_user_id: string
  potential_match_id: string
  message: string
  status: string
  expires_at: string
  created_at: string
}

export interface UpdateRequestResponse {
  id: string
  status: string
  updated_at: string
  message: string
}
```

### Phase 2: MatchCard Component Updates

#### 2.1 Update MatchCard Component (`src/components/matching/MatchCard.tsx`)

**Complete rewrite of MatchCard component:**

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Clock, 
  Route,
  DollarSign,
  MessageSquare,
  Check,
  Loader2,
  Send
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'
import { type PotentialMatch } from '@/types/matching'

interface MatchCardProps {
  match: PotentialMatch
  onRequestSent?: (requestId: string) => void
  onNavigateToRequests?: () => void
}

export function MatchCard({ match, onRequestSent, onNavigateToRequests }: MatchCardProps) {
  const [isSending, setIsSending] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const matchingService = useMatchingService()

  const handleSendRequest = async () => {
    if (isSending || requestSent) return
    
    setIsSending(true)
    setError(null)
    
    try {
      const request = {
        potential_match_id: match.id,
        to_user_id: match.user2.id,
        message: `Hi ${match.user2.name}! I'd love to carpool with you. We have a ${Math.round(match.compatibility_score * 100)}% match!`
      }
      
      const response = await matchingService.sendMatchRequest(request)
      
      setRequestSent(true)
      onRequestSent?.(response.id)
      
      // Show success message
      console.log('✅ Carpool request sent successfully!')
      
      // Optionally navigate to requests page
      setTimeout(() => {
        onNavigateToRequests?.()
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Failed to send carpool request:', error)
      setError(error.message || 'Failed to send request. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const getDisplayName = () => {
    if (typeof match.user2.display_name === 'string') {
      return match.user2.display_name
    }
    return match.user2.display_name?.String || match.user2.name
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {/* Header with user info and match score */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Near you</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {Math.round(match.compatibility_score * 100)}% Match
          </Badge>
        </div>

        {/* Match details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Route Overlap */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Route className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{match.route_overlap_percentage}% Route Overlap</span>
            </div>
            <p className="text-sm text-gray-600">{match.total_distance_miles} miles total</p>
          </div>

          {/* Schedule */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="font-semibold">{match.schedule_compatibility?.departure_time || 'Not specified'}</span>
            </div>
            <p className="text-sm text-gray-600">{match.schedule_compatibility?.frequency || 'Not specified'}</p>
          </div>

          {/* Estimated Savings */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="font-semibold">${match.estimated_savings_per_month}/month</span>
            </div>
            <p className="text-sm text-gray-600">Estimated savings</p>
          </div>
        </div>

        {/* Match reasons */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Why you match:</h3>
          <div className="flex flex-wrap gap-2">
            {match.match_reasons?.map((reason, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action button */}
        <Button 
          onClick={handleSendRequest}
          disabled={isSending || requestSent}
          className="w-full"
          size="lg"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending Request...
            </>
          ) : requestSent ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Request Sent!
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5 mr-2" />
              Send Carpool Request
            </>
          )}
        </Button>

        {requestSent && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600 text-center">
              ✅ Request sent! You can view it in the Requests tab.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Phase 3: MatchRequests Component Updates

#### 3.1 Complete Rewrite of MatchRequests Component (`src/components/matching/MatchRequests.tsx`)

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Send, 
  Check, 
  X, 
  Clock,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'
import { type MatchRequestsResponse, type MatchRequest } from '@/types/matching'

export function MatchRequests() {
  const [requests, setRequests] = useState<MatchRequestsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const matchingService = useMatchingService()

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await matchingService.getRequests()
      setRequests(data)
    } catch (error: any) {
      console.error('Failed to load requests:', error)
      setError(error.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [matchingService])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleAcceptRequest = async (requestId: string) => {
    setUpdating(requestId)
    try {
      await matchingService.updateRequestStatus(requestId, 'accepted')
      await loadRequests() // Refresh the list
    } catch (error: any) {
      console.error('Failed to accept request:', error)
      setError(error.message || 'Failed to accept request')
    } finally {
      setUpdating(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    setUpdating(requestId)
    try {
      await matchingService.updateRequestStatus(requestId, 'rejected')
      await loadRequests() // Refresh the list
    } catch (error: any) {
      console.error('Failed to reject request:', error)
      setError(error.message || 'Failed to reject request')
    } finally {
      setUpdating(null)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <Check className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      case 'expired': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading requests...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadRequests} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Incoming Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Incoming Requests ({requests?.incoming?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests?.incoming?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No incoming requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests?.incoming?.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(request.from_user?.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.from_user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                        <p className="text-xs text-gray-500">
                          Sent {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={updating === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updating === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={updating === request.id}
                          >
                            {updating === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Decline
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outgoing Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Outgoing Requests ({requests?.outgoing?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests?.outgoing?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No outgoing requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests?.outgoing?.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {getInitials(request.to_user?.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{request.to_user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                        <p className="text-xs text-gray-500">
                          Sent {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Phase 4: Update Main Matching Page

#### 4.1 Update Matching Page (`src/app/(authenticated)/matching/page.tsx`)

**Add navigation between tabs:**

```typescript
// Add to existing matching page
const [activeTab, setActiveTab] = useState('potential')

// Update the PotentialMatches component call
<PotentialMatches 
  onStatsUpdate={handleStatsUpdate}
  onNavigateToPreferences={() => setActiveTab('preferences')}
  onNavigateToRequests={() => setActiveTab('requests')}
/>

// Update the MatchCard component call in PotentialMatches
<MatchCard 
  match={current} 
  onRequestSent={handleRequestSent}
  onNavigateToRequests={() => setActiveTab('requests')}
/>
```

### Phase 5: Add Toast Notifications

#### 5.1 Install Toast Library

```bash
npm install sonner
```

#### 5.2 Add Toast Provider (`src/app/layout.tsx`)

```typescript
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

#### 5.3 Update MatchCard with Toast Notifications

```typescript
import { toast } from 'sonner'

const handleSendRequest = async () => {
  // ... existing code ...
  
  try {
    const response = await matchingService.sendMatchRequest(request)
    setRequestSent(true)
    onRequestSent?.(response.id)
    
    toast.success('Carpool request sent successfully!')
    
  } catch (error: any) {
    console.error('❌ Failed to send carpool request:', error)
    toast.error(error.message || 'Failed to send request. Please try again.')
  } finally {
    setIsSending(false)
  }
}
```

### Phase 6: Add Real-time Updates

#### 6.1 Update RealTimeUpdates Component

**Add request count tracking:**

```typescript
// In RealTimeUpdates component, add request count tracking
const [requestCount, setRequestCount] = useState(0)

// Update checkForUpdates to track request changes
const checkForUpdates = useCallback(async () => {
  // ... existing code ...
  
  const [matches, requests, stats] = await Promise.all([
    matchingService.getPotentialMatches(),
    matchingService.getRequests(), // Add this
    matchingService.getStats()
  ])
  
  // Track request count changes
  const currentRequestCount = (requests.incoming?.length || 0) + (requests.outgoing?.length || 0)
  const requestsIncreased = currentRequestCount > globalLastRequestCount
  
  if (requestsIncreased) {
    // Create notification for new requests
    // ... notification logic ...
  }
  
  globalLastRequestCount = currentRequestCount
}, [/* dependencies */])
```

### Phase 7: Error Handling & Loading States

#### 7.1 Add Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### 7.2 Add Loading States

```typescript
// Add loading states to all components
const [loading, setLoading] = useState(false)

// Show loading spinner during API calls
{loading && (
  <div className="flex items-center justify-center py-4">
    <Loader2 className="w-6 h-6 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
)}
```

### Phase 8: Testing Implementation

#### 8.1 Add Unit Tests

```typescript
// src/__tests__/components/MatchCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MatchCard } from '@/components/matching/MatchCard'
import { useMatchingService } from '@/services/matching'

jest.mock('@/services/matching')

describe('MatchCard', () => {
  it('sends request when button is clicked', async () => {
    const mockSendRequest = jest.fn().mockResolvedValue({ id: 'req-123' })
    ;(useMatchingService as jest.Mock).mockReturnValue({
      sendMatchRequest: mockSendRequest
    })

    const mockMatch = {
      id: 'match-123',
      user2: { id: 'user-456', name: 'John Doe' },
      compatibility_score: 0.8
    }

    render(<MatchCard match={mockMatch} />)
    
    const button = screen.getByText('Send Carpool Request')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledWith({
        potential_match_id: 'match-123',
        to_user_id: 'user-456',
        message: expect.stringContaining('John Doe')
      })
    })
  })
})
```

### Phase 9: Performance Optimization

#### 9.1 Add Request Caching

```typescript
// Add to matching service
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const getCachedRequests = (userId: string) => {
  const cached = requestCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedRequests = (userId: string, data: any) => {
  requestCache.set(userId, { data, timestamp: Date.now() })
}
```

#### 9.2 Add Request Debouncing

```typescript
// Debounce request updates to prevent spam
const debouncedUpdateRequest = useCallback(
  debounce(async (requestId: string, status: string) => {
    await matchingService.updateRequestStatus(requestId, status)
  }, 300),
  [matchingService]
)
```

### Phase 10: Documentation & Deployment

#### 10.1 Update README

```markdown
# Carpool Request System

## Features
- Send carpool requests to potential matches
- View incoming and outgoing requests
- Accept or reject requests
- Real-time request status updates

## Usage
1. Browse potential matches
2. Click "Send Carpool Request" on a match
3. View requests in the Requests tab
4. Accept or reject incoming requests
```

#### 10.2 Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Implementation Timeline

### Week 1: Core Implementation
- [ ] Update service layer with new methods
- [ ] Update type definitions
- [ ] Rewrite MatchCard component
- [ ] Rewrite MatchRequests component

### Week 2: Integration & Testing
- [ ] Update main matching page
- [ ] Add toast notifications
- [ ] Add error handling
- [ ] Add loading states

### Week 3: Polish & Deployment
- [ ] Add real-time updates
- [ ] Performance optimization
- [ ] Unit tests
- [ ] Documentation

## Success Criteria

### Functional Requirements
- ✅ Users can send carpool requests
- ✅ Users can view all their requests
- ✅ Users can accept/reject requests
- ✅ Request status updates in real-time
- ✅ Proper error handling and validation

### Technical Requirements
- ✅ All API calls working
- ✅ Proper TypeScript types
- ✅ Responsive UI design
- ✅ Loading states and error handling
- ✅ Unit tests passing

### User Experience
- ✅ Intuitive request flow
- ✅ Clear status indicators
- ✅ Success/error feedback
- ✅ Smooth navigation between tabs
- ✅ Mobile-friendly design

---

**Total Implementation Time**: 3 weeks  
**Priority**: HIGH - Core functionality for carpool system  
**Dependencies**: Backend API endpoints must be implemented first
