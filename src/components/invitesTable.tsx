'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
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

  if (loading) {
    return <Card><CardContent className="py-4">Loading invites...</CardContent></Card>
  }
  
  if (!invites?.length) {
    return <Card><CardContent className="py-4">No pending invites</CardContent></Card>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sender Email</TableHead>
            <TableHead>Carpool</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => {
            console.log('Processing invite:', {
              id: invite.id,
              sender: invite.sender_email,
              carpool: invite.carpool_name
            })
            
            return (
              <TableRow key={invite.id}>
                <TableCell>{invite.sender_email || 'Unknown Sender'}</TableCell>
                <TableCell>{invite.carpool_name || 'Unknown Carpool'}</TableCell>
                <TableCell>
                  <InviteActions 
                    inviteId={invite.id}
                    status={parseInt(invite.status)}
                    onStatusUpdate={() => {}}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}