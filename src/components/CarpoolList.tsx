'use client'

import { useState } from 'react'
import { Carpool } from '@/types/api'
import { InviteModal } from './InviteModal'
import { useUserUuid } from '@/contexts/UserContext'
import { useCarpools } from '@/hooks/useCarpools'
import { useApi } from '@/services/api'
import { TrashIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { ScheduleModal } from './ScheduleModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CarpoolList() {
  const [selectedCarpoolId, setSelectedCarpoolId] = useState<string | null>(null)
  const { uuid, loading: uuidLoading, error: uuidError } = useUserUuid()
  const { carpools, loading: carpoolsLoading } = useCarpools()
  const api = useApi()
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedCarpool, setSelectedCarpool] = useState<Carpool | null>(null)

  console.log('CarpoolList render:', {
    uuid,
    uuidLoading,
    uuidError,
    carpools,
    carpoolsLoading
  })

  const handleDelete = async (carpoolId: string) => {
    if (window.confirm('Are you sure you want to delete this carpool?')) {
      try {
        await api.deleteCarpool(carpoolId)
        // Refresh the list
      } catch (error) {
        console.error('Error deleting carpool:', error)
        alert('Failed to delete carpool')
      }
    }
  }

  const handleUpdateSchedule = (carpool: Carpool) => {
    setSelectedCarpool(carpool)
    setScheduleModalOpen(true)
  }

  const handleScheduleUpdate = async (schedule: any) => {
    try {
      // Add API call to update schedule
      await api.updateCarpoolSchedule(schedule)
      // Refresh carpools list
    } catch (error) {
      console.error('Error updating schedule:', error)
      alert('Failed to update schedule')
    }
  }

  if (uuidError) {
    return <div className="text-center py-8 text-red-600">Error loading user data: {uuidError}</div>
  }

  if (uuidLoading) {
    return <div className="text-center py-8">Loading user data...</div>
  }

  if (!uuid) {
    return <div className="text-center py-8">User not authenticated</div>
  }

  if (carpoolsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading carpools...</p>
        </CardContent>
      </Card>
    )
  }

  if (!carpools?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No carpools created yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Carpools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Available Seats</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carpools.map((carpool) => (
                <TableRow key={carpool.id}>
                  <TableCell className="font-medium">{carpool.carpool_name}</TableCell>
                  <TableCell>{carpool.recurring_option || 'One-time'}</TableCell>
                  <TableCell>{carpool.available_seats} of {carpool.seats}</TableCell>
                  <TableCell>{carpool.destination_address}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedCarpoolId(carpool.id || null)}
                    >
                      Invite member
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateSchedule(carpool)}
                      className="gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Update Schedule
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => carpool.id && handleDelete(carpool.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 