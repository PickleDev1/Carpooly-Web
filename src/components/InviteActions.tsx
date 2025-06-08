'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'
import { useRouter } from 'next/navigation'

interface InviteActionsProps {
  inviteId: string
  status?: number
  onStatusUpdate: () => void
}

export function InviteActions({ inviteId, status, onStatusUpdate }: InviteActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const router = useRouter()

  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await api.updateInviteStatus(inviteId, 1)
      onStatusUpdate() // Refresh the list
      router.push('/carpools/list')
    } catch (error) {
      console.error('Failed to accept invite:', error)
      setError(error instanceof Error ? error.message : 'Failed to accept invite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await api.deleteInvite(inviteId)
      onStatusUpdate() // Refresh the list after deleting
    } catch (error) {
      console.error('Failed to reject invite:', error)
      setError(error instanceof Error ? error.message : 'Failed to reject invite')
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
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Accepting...' : 'Accept'}
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
    </div>
  )
} 