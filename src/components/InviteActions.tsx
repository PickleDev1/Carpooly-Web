'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'

interface InviteActionsProps {
  inviteId: string
  status?: number
  onStatusUpdate: () => void
}

export function InviteActions({ inviteId, status, onStatusUpdate }: InviteActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const api = useApi()

  const handleAction = async (newStatus: number) => {
    setIsLoading(true)
    try {
      await api.updateInviteStatus(inviteId, newStatus)
      onStatusUpdate()
    } catch (error) {
      console.error('Failed to update invite status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 1) {
    return (
      <span className="px-4 py-2 bg-green-200 text-green-800 rounded-md">
        Accepted
      </span>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction(1)}
        disabled={isLoading}
        className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors"
      >
        Accept
      </button>
      <button
        onClick={() => handleAction(2)}
        disabled={isLoading}
        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
      >
        Reject
      </button>
    </div>
  )
} 