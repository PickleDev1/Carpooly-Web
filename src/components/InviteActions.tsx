'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'
import { useRouter } from 'next/navigation'
import { addInviteAcceptedNotification } from '@/components/NotificationPopup'
import { useToast } from '@/components/ui/toast'

interface InviteActionsProps {
  inviteId: string
  status?: number
  carpoolId?: string
  currentAvailableSeats?: number
  onStatusUpdate: () => void
}

export function InviteActions({ inviteId, status, carpoolId, currentAvailableSeats, onStatusUpdate }: InviteActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const router = useRouter()
  const { showToast } = useToast();

  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Check if carpool has available seats before accepting
      if (carpoolId) {
        try {
          const availability = await api.checkCarpoolAvailability(carpoolId)
          if (!availability.has_available_seats) {
            throw new Error('Sorry, this carpool is full. No available seats.')
          }
        } catch (availabilityError) {
          console.error('Error checking carpool availability:', availabilityError)
          // Continue with invite acceptance even if availability check fails
          // The backend should handle the validation
        }
      }

      // Update invite status to accepted
      await api.updateInviteStatus(inviteId, 1)
      
      // Decrement available seats if carpoolId is provided
      if (carpoolId) {
        try {
          await api.decrementCarpoolAvailableSeats(carpoolId)
          console.log(`Decremented available seats for carpool ${carpoolId}`)
        } catch (seatsError) {
          console.error('Error updating available seats:', seatsError)
          // Don't fail the entire operation if seats update fails
          // The invite was already accepted
        }
      }

      // Notify inviter (if inviterId is available in the invite object)
      // This is a placeholder; you may need to pass inviterId as a prop or fetch it
      const inviterId = undefined; // TODO: get inviterId from invite or context
      const inviteeName = 'You'; // Or get from user context
      const carpoolName = carpoolId || 'Carpool'; // Or fetch carpool name
      if (inviterId && typeof addInviteAcceptedNotification === 'function') {
        addInviteAcceptedNotification(inviterId, inviteeName, carpoolName)
      }
      showToast(`${inviteeName} accepted your invite to ${carpoolName}!`)
      
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
      // Delete the invite
      await api.deleteInvite(inviteId)
      
      // Note: We don't increment available seats on reject since the seat was never actually taken
      // The available seats only decrease when someone actually accepts and joins
      
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