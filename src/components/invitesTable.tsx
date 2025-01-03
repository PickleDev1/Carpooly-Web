'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { useUser } from '@clerk/nextjs'

interface Invite {
  id: string
  sender_name: string
  carpool_name: string
}

export function InvitesTable() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useUser()
  const api = useApi()

  useEffect(() => {
    let mounted = true

    const fetchInvites = async () => {
      if (!user?.id) return
      
      try {
        const data = await api.getInvites(user.id)
        if (mounted) {
          setInvites(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load invites')
          setIsLoading(false)
        }
      }
    }

    fetchInvites()

    return () => {
      mounted = false
    }
  }, [user?.id, api]) // Only depend on user.id and api

  if (isLoading) return <div>Loading invites...</div>
  if (error) return <div>Error: {error}</div>
  if (invites.length === 0) return <div>No pending invites</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sender
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Carpool
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invites.map((invite) => (
            <tr key={invite.id}>
              <td className="px-6 py-4 whitespace-nowrap">{invite.sender_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{invite.carpool_name}</td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-md hover:from-green-600 hover:to-green-700">
                  Accept
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md hover:from-red-600 hover:to-red-700">
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}