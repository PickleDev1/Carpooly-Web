'use client'

import { useState, useEffect } from 'react'
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
import { Tooltip } from '@/components/ui/tooltip'

// Helper for avatar color
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

export function CarpoolList() {
  const { user, isLoaded } = useUser()
  const [selectedCarpoolId, setSelectedCarpoolId] = useState<string | null>(null)
  const { uuid, loading: uuidLoading, error: uuidError } = useUserUuid()
  const { carpools, deleteCarpool } = useCarpools()
  const api = useApi()
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedCarpool, setSelectedCarpool] = useState<Carpool | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const router = useRouter()
  const [membersMap, setMembersMap] = useState<Record<string, any[]>>({});
  const [carpoolDetailsMap, setCarpoolDetailsMap] = useState<Record<string, Carpool>>({});

  useEffect(() => {
    async function fetchMembersAndDetails() {
      if (!carpools) return;
      const membersMapTemp: Record<string, any[]> = {};
      const detailsMapTemp: Record<string, Carpool> = {};
      await Promise.all(
        carpools.map(async (carpool) => {
          if (carpool.id) {
            try {
              const [members, carpoolDetails] = await Promise.all([
                api.getCarpoolMembers(carpool.id),
                api.getCarpool(carpool.id)
              ]);
              membersMapTemp[carpool.id] = members || [];
              detailsMapTemp[carpool.id] = carpoolDetails;
            } catch (e) {
              membersMapTemp[carpool.id] = [];
              detailsMapTemp[carpool.id] = carpool;
            }
          }
        })
      );
      setMembersMap(membersMapTemp);
      setCarpoolDetailsMap(detailsMapTemp);
    }
    fetchMembersAndDetails();
  }, [carpools, api]);

  if (!isLoaded || !user) {
    return null;
  }

  const handleDelete = async (carpoolId: string) => {
    if (window.confirm('Are you sure you want to delete this carpool?')) {
      try {
        await deleteCarpool(carpoolId);
        // No need to refresh the list as the state is already updated by the hook
      } catch (error: any) {
        console.error('Error deleting carpool:', error);
        // Always show the "only creator" message when delete fails
        alert('Only the creator of a carpool can delete it');
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
                  <TableHead>Members</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carpools?.map((carpool) => {
                  const details = carpoolDetailsMap[carpool.id || ''] || carpool;
                  return (
                    <TableRow key={carpool.id}>
                      <TableCell className="font-medium">{carpool.carpool_name}</TableCell>
                      <TableCell>{carpool.recurring_option || 'One-time'}</TableCell>
                      <TableCell>
                        <span className={`$${
                          details.available_seats <= 0 
                            ? 'text-red-600 font-semibold' 
                            : details.available_seats <= 1 
                              ? 'text-orange-600 font-medium' 
                              : 'text-gray-900'
                        }`}>
                          {details.available_seats} of {details.seats}
                          {details.available_seats <= 0 && ' (Full)'}
                        </span>
                      </TableCell>
                    <TableCell>
                      {carpool.id && membersMap[carpool.id]?.length ? (
                        <Tooltip content={
                          <div className="text-left">
                            <div className="font-semibold mb-1">Members:</div>
                            {(membersMap[carpool.id] as any[]).map((m: any, i: number) => (
                              <div key={m.id || m.email || i} className="text-xs">
                                {m.name || m.display_name || m.email}
                              </div>
                            ))}
                          </div>
                        }>
                          <div className="flex items-center space-x-1">
                            {(membersMap[carpool.id] as any[]).slice(0, 3).map((m: any, i: number) => (
                              <span
                                key={m.id || m.email || i}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white border-2 border-white shadow"
                                style={{ background: stringToColor(m.email || m.name || m.display_name || 'U') }}
                              >
                                {(m.name || m.display_name || m.email || 'U')[0].toUpperCase()}
                              </span>
                            ))}
                            {(membersMap[carpool.id] as any[]).length > 3 && (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 text-xs font-bold text-gray-700 border-2 border-white shadow">
                                +{(membersMap[carpool.id] as any[]).length - 3}
                              </span>
                            )}
                          </div>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-gray-400">No members</span>
                      )}
                    </TableCell>
                    <TableCell>{carpool.destination_address}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip content={details.available_seats <= 0
                          ? 'Invite someone to join this carpool. Disabled when the carpool is full.'
                          : 'Invite someone to join this carpool.'}>
                          <Button
                            variant="secondary"
                            onClick={() => carpool.id && handleInvite(carpool.id)}
                            disabled={details.available_seats <= 0}
                            className={`$${
                              details.available_seats <= 0 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-200 hover:bg-blue-300'
                            }`}
                          >
                            {details.available_seats <= 0 ? 'Full' : 'Invite'}
                          </Button>
                        </Tooltip>
                        <Tooltip content={"Edit the schedule for this carpool (dates, times, frequency)."}>
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateSchedule(carpool)}
                            size="icon"
                            className="bg-green-200 hover:bg-green-300"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={"View the carpool calendar and manage participants."}>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => carpool.id && handleViewCalendar(carpool.id)}
                            className="bg-[#2B5335] hover:bg-[#1e3b25] text-white"
                          >
                            <CalendarDaysIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={"Delete this carpool. Only the creator can delete."}>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => carpool.id && handleDelete(carpool.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )})}
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