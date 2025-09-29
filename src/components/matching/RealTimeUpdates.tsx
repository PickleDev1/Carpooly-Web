'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  RefreshCw,
  Users,
  MessageSquare,
  Star,
  Clock
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'

interface RealTimeUpdatesProps {
  onNewMatches?: (count: number) => void
  onNewRequests?: (count: number) => void
  onStatsUpdate?: () => void
}

interface UpdateEvent {
  id: string
  type: 'new_match' | 'new_request' | 'request_accepted' | 'request_rejected' | 'match_expired'
  timestamp: Date
  data: any
  read: boolean
}

export function RealTimeUpdates({ 
  onNewMatches, 
  onNewRequests, 
  onStatsUpdate 
}: RealTimeUpdatesProps) {
  const [isEnabled, setIsEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateInterval, setUpdateInterval] = useState(30000) // 30 seconds
  const [events, setEvents] = useState<UpdateEvent[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [authError, setAuthError] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMatchesCount = useRef(0)
  const lastRequestsCount = useRef(0)
  const matchingService = useMatchingService()

  // Simulate real-time updates (in production, this would use WebSocket or Server-Sent Events)
  const checkForUpdates = useCallback(async () => {
    if (!isEnabled || authError) return

    try {
      const [matches, requests, stats] = await Promise.all([
        matchingService.getPotentialMatches(),
        matchingService.getRequests(),
        matchingService.getStats()
      ])

      const currentMatchesCount = matches.pending_matches?.length || 0
      const currentRequestsCount = requests.incoming?.length || 0

      // Only create events if there are actual changes
      const newEvents: UpdateEvent[] = []

      // Check if matches count increased
      if (currentMatchesCount > lastMatchesCount.current && currentMatchesCount > 0) {
        newEvents.push({
          id: `match-${Date.now()}`,
          type: 'new_match',
          timestamp: new Date(),
          data: { count: currentMatchesCount },
          read: false
        })
      }

      // Check if requests count increased
      if (currentRequestsCount > lastRequestsCount.current && currentRequestsCount > 0) {
        newEvents.push({
          id: `request-${Date.now()}`,
          type: 'new_request',
          timestamp: new Date(),
          data: { count: currentRequestsCount },
          read: false
        })
      }

      // Update the refs to track changes
      lastMatchesCount.current = currentMatchesCount
      lastRequestsCount.current = currentRequestsCount

      if (newEvents.length > 0) {
        setEvents(prev => [...newEvents, ...prev].slice(0, 50)) // Keep last 50 events
        setUnreadCount(prev => prev + newEvents.length)
        
        // Trigger callbacks
        onNewMatches?.(currentMatchesCount)
        onNewRequests?.(currentRequestsCount)
        onStatsUpdate?.()
      }

      setLastUpdate(new Date())
      setIsConnected(true)
      setAuthError(false) // Reset auth error on successful request

    } catch (error) {
      console.error('Failed to check for updates:', error)
      setIsConnected(false)
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        setAuthError(true)
        setIsEnabled(false) // Disable updates on auth error
        console.warn('Authentication failed, disabling real-time updates')
      }
    }
  }, [isEnabled, matchingService, onNewMatches, onNewRequests, onStatsUpdate])

  // Set up polling interval
  useEffect(() => {
    if (isEnabled && !authError) {
      // Reset counters on first load to prevent initial spam
      lastMatchesCount.current = 0
      lastRequestsCount.current = 0
      
      intervalRef.current = setInterval(checkForUpdates, updateInterval)
      // Initial check (but don't create events on first load)
      checkForUpdates()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isEnabled, authError, updateInterval, checkForUpdates])

  const handleRefresh = useCallback(() => {
    checkForUpdates()
  }, [checkForUpdates])

  const markAsRead = useCallback((eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, read: true } : event
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setEvents(prev => prev.map(event => ({ ...event, read: true })))
    setUnreadCount(0)
  }, [])

  const getEventIcon = (type: UpdateEvent['type']) => {
    switch (type) {
      case 'new_match':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'new_request':
        return <MessageSquare className="w-4 h-4 text-green-500" />
      case 'request_accepted':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'request_rejected':
        return <Star className="w-4 h-4 text-red-500" />
      case 'match_expired':
        return <Clock className="w-4 h-4 text-gray-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getEventMessage = (event: UpdateEvent) => {
    switch (event.type) {
      case 'new_match':
        return `Found ${event.data.count} new potential matches`
      case 'new_request':
        return `You have ${event.data.count} new match requests`
      case 'request_accepted':
        return 'Your match request was accepted!'
      case 'request_rejected':
        return 'Your match request was declined'
      case 'match_expired':
        return 'A potential match has expired'
      default:
        return 'New update available'
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            Real-time Updates
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Enable real-time updates</p>
              <p className="text-xs text-muted-foreground">
                {authError 
                  ? "Authentication failed. Please sign in again to enable updates."
                  : "Get notified when new matches or requests are available"
                }
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (authError) {
                  setAuthError(false)
                }
                setIsEnabled(checked)
              }}
              disabled={authError}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Update frequency</p>
              <p className="text-xs text-muted-foreground">
                Check for updates every {updateInterval / 1000} seconds
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpdateInterval(15000)}
                className={updateInterval === 15000 ? 'bg-blue-50' : ''}
              >
                15s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpdateInterval(30000)}
                className={updateInterval === 30000 ? 'bg-blue-50' : ''}
              >
                30s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpdateInterval(60000)}
                className={updateInterval === 60000 ? 'bg-blue-50' : ''}
              >
                1m
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {lastUpdate ? `Last update: ${lastUpdate.toLocaleTimeString()}` : 'No updates yet'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={!isEnabled || authError}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Now
              </Button>
              {authError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAuthError(false)
                    setIsEnabled(true)
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Updates
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.slice(0, 10).map(event => (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    event.read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                  onClick={() => markAsRead(event.id)}
                >
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{getEventMessage(event)}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!event.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
