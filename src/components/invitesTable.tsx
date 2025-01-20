'use client'

import { useInvites } from '@/hooks/useInvites'
import { InviteActions } from './InviteActions'

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
              SENDER EMAIL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CARPOOL
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ACTIONS
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <InviteActions 
                    inviteId={invite.id}
                    status={parseInt(invite.status)}
                    onStatusUpdate={() => {}}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}