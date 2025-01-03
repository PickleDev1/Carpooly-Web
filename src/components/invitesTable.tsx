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
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const { user } = useUser()

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/${user?.id}`)
        const data = await response.json()
        setInvites(data)
      } catch (err) {
        console.error('Error fetching invites:', err)
        setError(err instanceof Error ? err.message : 'Failed to load invites')
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchInvites()
    }
  }, [user?.id])

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invites/${inviteId}/accept`, {
        method: 'POST',
      })
      // Remove the accepted invite from the list
      setInvites(invites.filter(invite => invite.id !== inviteId))
    } catch (err) {
      console.error('Error accepting invite:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (invites.length === 0) {
    return <p className="text-gray-500">No pending invites</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Carpool Name
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invites.map((invite) => (
            <tr key={invite.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {invite.sender_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {invite.carpool_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button
                  onClick={() => handleAcceptInvite(invite.id)}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md hover:from-green-500 hover:to-green-700 transition-all duration-200"
                >
                  Accept
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}