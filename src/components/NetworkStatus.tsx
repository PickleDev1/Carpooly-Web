'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { Wifi, WifiOff } from 'lucide-react'

export function NetworkStatus() {
  const isOnline = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
      <WifiOff size={16} />
      <span className="text-sm">You&apos;re offline</span>
    </div>
  )
} 