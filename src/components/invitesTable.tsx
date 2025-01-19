'use client'

import { useInvites } from '@/hooks/useInvites'

interface Invite {
  id: string
  sender_email: string
  carpool_name: string
  status: string
}

export function InvitesTable() {
  const { invites, loading } = useInvites()

  console.log('All invites:', invites) // Log all invites

  if (loading) return <div>Loading invites...</div>
  if (!invites?.length) return <div>No pending invites</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sender Email
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
          {invites.map((invite) => {
            console.log('Processing invite:', {
              id: invite.id,
              sender: invite.sender_email,
              carpool: invite.carpool_name
            })
            
            return (
              <tr key={invite.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {invite.sender_email || 'Unknown Sender'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {invite.carpool_name || 'Unknown Carpool'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-md hover:from-green-600 hover:to-green-700">
                    Accept
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md hover:from-red-600 hover:to-red-700">
                    Reject
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}