'use client'

import { useState } from 'react'
import { Carpool } from '@/types/api'
import { InviteModal } from '@/components/InviteModal'
import { useUserUuid } from '@/contexts/UserContext'
import { useCarpools } from '@/hooks/useCarpools'
import { useApi } from '@/services/api'
import { TrashIcon, CalendarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
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
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function CarpoolList() {
  const { user, isLoaded } = useUser()
  const [selectedCarpoolId, setSelectedCarpoolId] = useState<string | null>(null)
  const { uuid, loading: uuidLoading, error: uuidError } = useUserUuid()
  const { carpools } = useCarpools()
  const api = useApi()
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedCarpool, setSelectedCarpool] = useState<Carpool | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const router = useRouter()

  console.log('CarpoolList render:', { user, isLoaded, carpools})

  // Only check for user authentication
  if (!isLoaded || !user) {
    return null;
  }

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
      // Changed from updateCarpoolSchedule to updateSchedule
      await api.updateSchedule(schedule)
      // Refresh carpools list
    } catch (error) {
      console.error('Error updating schedule:', error)
      alert('Failed to update schedule')
    }
  }

  const handleInvite = (carpoolId: string) => {
    setSelectedCarpoolId(carpoolId)
    setInviteModalOpen(true)
  }

  const handleViewCalendar = (carpoolId: string) => {
    router.push(`/carpools/${carpoolId}/calendar`)
  }

  if (uuidError) {
    return <div className="text-center py-8 text-red-600">Error loading user data: {uuidError}</div>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Carpools ({carpools?.length || 0})</CardTitle>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carpools?.map((carpool) => (
                  <TableRow key={carpool.id}>
                    <TableCell className="font-medium">{carpool.carpool_name}</TableCell>
                    <TableCell>{carpool.recurring_option || 'One-time'}</TableCell>
                    <TableCell>{carpool.available_seats} of {carpool.seats}</TableCell>
                    <TableCell>{carpool.destination_address}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => carpool.id && handleInvite(carpool.id)}
                          className="bg-blue-200 hover:bg-blue-300"
                        >
                          Invite
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateSchedule(carpool)}
                          size="icon"
                          className="bg-green-200 hover:bg-green-300"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => carpool.id && handleViewCalendar(carpool.id)}
                          className="bg-[#2B5335] hover:bg-[#1e3b25] text-white"
                        >
                          <CalendarDaysIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => carpool.id && handleDelete(carpool.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {inviteModalOpen && selectedCarpoolId && (
        <InviteModal
          carpoolId={selectedCarpoolId}
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false)
            setSelectedCarpoolId(null)
          }}
        />
      )}

      {scheduleModalOpen && (
        <ScheduleModal
          carpool={selectedCarpool}
          isOpen={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false)
            setSelectedCarpool(null)
          }}
        />
      )}
    </>
  )
} 