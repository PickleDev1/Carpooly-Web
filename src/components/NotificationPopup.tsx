'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Clock, Car, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActiveRides } from '@/hooks/useActiveRides'

interface Notification {
  id: string
  type: 'ride_reminder' | 'invite_received' | 'ride_started' | 'location_update' | 'invite_accepted'
  title: string
  message: string
  timestamp: Date
  read: boolean
  rideId?: string
  destination?: string
  startTime?: string
  inviterId?: string
  inviteeName?: string
  carpoolName?: string
}

interface NotificationPopupProps {
  variant?: 'default' | 'mobile'
}

let addInviteAcceptedNotification: ((inviterId: string, inviteeName: string, carpoolName: string) => void) | undefined;

export function NotificationPopup({ variant = 'default' }: NotificationPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { activeRides } = useActiveRides()
  const popupRef = useRef<HTMLDivElement>(null)

  // Generate notifications based on active rides
  useEffect(() => {
    console.log('🔔 NotificationPopup: Starting notification generation...')
    console.log('🔔 NotificationPopup: Active rides count:', activeRides.length)
    console.log('🔔 NotificationPopup: Current active rides:', activeRides)
    
    const newNotifications: Notification[] = []
    
    activeRides.forEach((ride, index) => {
      console.log(`🔔 NotificationPopup: Processing ride ${index + 1}:`, ride)
      
      if (!ride.start_time || !ride.id) {
        console.log(`🔔 NotificationPopup: Skipping ride ${index + 1} - missing start_time or id`)
        return
      }
      
      const start = new Date(ride.start_time)
      const now = new Date()
      const diff = (start.getTime() - now.getTime()) / 60000 // minutes
      
      console.log(`🔔 NotificationPopup: Ride ${index + 1} - Start time: ${start.toISOString()}, Current time: ${now.toISOString()}, Diff: ${diff} minutes`)
      
      // Create notification for upcoming rides (within 15 min)
      if (diff > 0 && diff < 15) {
        console.log(`🔔 NotificationPopup: Creating ride reminder notification for ride ${ride.id}`)
        const carpoolName = ride.carpool_name || 'your carpool'
        const destination = ride.destination_address || 'your destination'
        newNotifications.push({
          id: `ride-reminder-${ride.id}`,
          type: 'ride_reminder',
          title: 'Upcoming Ride',
          message: `${carpoolName} to ${destination} starts soon`,
          timestamp: now,
          read: false,
          rideId: ride.id,
          destination: destination,
          startTime: ride.start_time
        })
      }
      
      // Create notification for rides that just started
      if (diff > -5 && diff < 0) {
        console.log(`🔔 NotificationPopup: Creating ride started notification for ride ${ride.id}`)
        const carpoolName = ride.carpool_name || 'your carpool'
        const destination = ride.destination_address || 'your destination'
        newNotifications.push({
          id: `ride-started-${ride.id}`,
          type: 'ride_started',
          title: 'Ride Started',
          message: `${carpoolName} to ${destination} has begun`,
          timestamp: now,
          read: false,
          rideId: ride.id,
          destination: destination
        })
      }
    })
    
    console.log('🔔 NotificationPopup: Generated new notifications:', newNotifications)
    
    setNotifications(prev => {
      console.log('🔔 NotificationPopup: Previous notifications:', prev)
      // Merge with existing notifications, avoiding duplicates
      const existingIds = new Set(prev.map(n => n.id))
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id))
      console.log('🔔 NotificationPopup: Unique new notifications:', uniqueNew)
      const result = [...prev, ...uniqueNew]
      console.log('🔔 NotificationPopup: Final notifications array:', result)
      return result
    })
  }, [activeRides, notifications.length])

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    console.log('🔔 NotificationPopup: Updating unread count:', unread, 'Total notifications:', notifications.length)
    setUnreadCount(unread)
  }, [notifications])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = (notificationId: string) => {
    console.log('🔔 NotificationPopup: Marking notification as read:', notificationId)
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    console.log('🔔 NotificationPopup: Marking all notifications as read')
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ride_reminder':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'ride_started':
        return <Car className="w-4 h-4 text-green-500" />
      case 'invite_received':
        return <Users className="w-4 h-4 text-purple-500" />
      case 'location_update':
        return <MapPin className="w-4 h-4 text-orange-500" />
      case 'invite_accepted':
        return <Bell className="w-4 h-4 text-green-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    addInviteAcceptedNotification = (inviterId: string, inviteeName: string, carpoolName: string) => {
      setNotifications(prev => [
        {
          id: `invite-accepted-${Date.now()}`,
          type: 'invite_accepted',
          title: 'Invite Accepted',
          message: `${inviteeName} accepted your invite to ${carpoolName}!`,
          timestamp: new Date(),
          read: false,
          inviterId,
          inviteeName,
          carpoolName,
        },
        ...prev,
      ])
    }
  }, [])

  if (variant === 'mobile') {
    return (
      <div className="relative" ref={popupRef}>
        {/* Mobile Notification Button with Badge */}
        <button
          onClick={() => {
            console.log('🔔 NotificationPopup: Mobile notification button clicked, current state:', isOpen)
            setIsOpen(!isOpen)
          }}
          className="relative p-2 rounded-lg transition-colors hover:bg-white/10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Mobile Notification Popup */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log('🔔 NotificationPopup: Mobile close button clicked')
                        setIsOpen(false)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Bell className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                            notification.read 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-xs text-gray-900">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={popupRef}>
      {/* Desktop Notification Button with Badge */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log('🔔 NotificationPopup: Desktop notification button clicked, current state:', isOpen)
          setIsOpen(!isOpen)
        }}
        className="relative"
      >
        <Bell className="w-4 h-4 mr-2" />
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Desktop Notification Popup */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('🔔 NotificationPopup: Desktop close button clicked')
                      setIsOpen(false)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-gray-900">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export { addInviteAcceptedNotification }; 