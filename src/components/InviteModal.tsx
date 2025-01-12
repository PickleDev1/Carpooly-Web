'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'
import { useUserUuid } from '@/contexts/UserContext'

interface InviteModalProps {
  carpoolId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ carpoolId, isOpen, onClose }: InviteModalProps) {
  const { uuid, loading: uuidLoading, error: uuidError } = useUserUuid()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const api = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uuid) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.createInvite({
        carpool_id: carpoolId,
        from_user: uuid,
        email: email.trim(),
        message: `You have been invited to join a carpool!`
      })
      
      setEmail('')
      onClose()
    } catch (err) {
      console.error('Invite error:', err)
      setError('Failed to send invite. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (uuidLoading) {
    return <div>Loading...</div>
  }

  if (uuidError) {
    return <div>Error: {uuidError}</div>
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Invite Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter email address"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 mb-4">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 