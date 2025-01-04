'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function CreateInvitePage() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)
      const token = await getToken()

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_user: formData.get('to_user'),
          carpool_id: formData.get('carpool_id'),
          message: formData.get('message'),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create invite')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Carpool Invite</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="to_user" className="block text-sm font-medium mb-1">
            Invite User (ID)
          </label>
          <input
            type="text"
            id="to_user"
            name="to_user"
            required
            className="w-full p-2 border rounded"
            placeholder="User ID"
          />
        </div>

        <div>
          <label htmlFor="carpool_id" className="block text-sm font-medium mb-1">
            Carpool ID
          </label>
          <input
            type="text"
            id="carpool_id"
            name="carpool_id"
            required
            className="w-full p-2 border rounded"
            placeholder="Carpool ID"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Enter your invitation message"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded ${
            loading 
              ? 'bg-gray-400' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Sending...' : 'Send Invite'}
        </button>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-500 text-sm mt-2">
            Invite sent successfully!
          </div>
        )}
      </form>
    </div>
  )
}
