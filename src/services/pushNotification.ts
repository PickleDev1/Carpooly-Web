'use client'

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || ''

export async function subscribeToPushNotifications() {
  try {
    if (!('serviceWorker' in navigator)) return false

    const registration = await navigator.serviceWorker.ready
    
    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey
      })
    }

    // Send subscription to backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    })

    return true
  } catch (error) {
    console.error('Push notification subscription failed:', error)
    return false
  }
} 