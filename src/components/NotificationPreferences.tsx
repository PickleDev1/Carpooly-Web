'use client'

import { useState, useEffect } from 'react'
import { subscribeToPushNotifications } from '@/services/pushNotification'
import { Bell, BellOff } from 'lucide-react'

export function NotificationPreferences() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const checkNotificationStatus = async () => {
    if (!('Notification' in window)) return
    
    const permission = await Notification.permission
    setNotificationsEnabled(permission === 'granted')
    setLoading(false)
  }

  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported by your browser')
      return
    }

    try {
      if (notificationsEnabled) {
        // Unsubscribe logic here
        setNotificationsEnabled(false)
      } else {
        const result = await subscribeToPushNotifications()
        setNotificationsEnabled(result)
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
    }
  }

  if (loading) return null

  return (
    <button
      onClick={handleToggleNotifications}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-sm hover:bg-gray-50"
    >
      {notificationsEnabled ? (
        <>
          <Bell className="h-5 w-5 text-green-600" />
          <span>Notifications enabled</span>
        </>
      ) : (
        <>
          <BellOff className="h-5 w-5 text-gray-400" />
          <span>Enable notifications</span>
        </>
      )}
    </button>
  )
} 