'use client'

import { useState, useEffect } from 'react'
import { Carpool } from '@/types/api'
import { InviteModal } from '@/components/InviteModal'
import { useUserUuid } from '@/contexts/UserContext'
import { useCarpools } from '@/hooks/useCarpools'
import { useApi } from '@/services/api'
import { TrashIcon, CalendarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { format, parseISO, isAfter, isEqual } from 'date-fns';

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
  if (!str || typeof str !== 'string') {
    return '#cccccc'; // Default gray color for invalid input
  }
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

  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const router = useRouter()
  const [membersMap, setMembersMap] = useState<Record<string, any[]>>({});
  const [carpoolDetailsMap, setCarpoolDetailsMap] = useState<Record<string, Carpool>>({});
  const [ridesMap, setRidesMap] = useState<Record<string, any[]>>({});
  const [loadingRides, setLoadingRides] = useState(false);

  useEffect(() => {
    async function fetchMembersDetailsAndRides() {
      if (!carpools) return;
      const membersMapTemp: Record<string, any[]> = {};
      const detailsMapTemp: Record<string, Carpool> = {};
      const ridesMapTemp: Record<string, any[]> = {};
      setLoadingRides(true);
      await Promise.all(
        carpools.map(async (carpool) => {
          if (carpool.id) {
            try {
              const [members, carpoolDetails, rides] = await Promise.all([
                api.getCarpoolMembers(carpool.id),
                api.getCarpool(carpool.id),
                api.getCarpoolRides(carpool.id)
              ]);
              membersMapTemp[carpool.id] = members || [];
              detailsMapTemp[carpool.id] = carpoolDetails;
              ridesMapTemp[carpool.id] = Array.isArray(rides) ? rides : [];
            } catch (e) {
              membersMapTemp[carpool.id] = [];
              detailsMapTemp[carpool.id] = carpool;
              ridesMapTemp[carpool.id] = [];
            }
          }
        })
      );
      setMembersMap(membersMapTemp);
      setCarpoolDetailsMap(detailsMapTemp);
      setRidesMap(ridesMapTemp);
      setLoadingRides(false);
    }
    fetchMembersDetailsAndRides();
  }, [carpools, api]);

  // Helper to get schedule type label
  const getScheduleTypeLabel = (scheduleType?: string) => {
    if (!scheduleType) return 'One-time';
    if (scheduleType === 'daily') return 'Daily';
    if (scheduleType === 'weekly') return 'Weekly';
    return 'One-time';
  };

  // Helper to find the next ride in the future (including today, after now)
  const getNextRide = (rides: any[]): string => {
    if (!rides || rides.length === 0) return 'N/A';
    const now = new Date();
    // rides should have a start_time field (ISO string)
    const futureRides = rides
      .filter((ride) => {
        if (!ride.start_time) return false;
        const rideTime = parseISO(ride.start_time);
        return isAfter(rideTime, now) || isEqual(rideTime, now);
      })
      .sort((a, b) => {
        const aTime = parseISO(a.start_time);
        const bTime = parseISO(b.start_time);
        return aTime.getTime() - bTime.getTime();
      });
    if (futureRides.length === 0) return 'N/A';
    const nextRide = futureRides[0];
    const rideTime = parseISO(nextRide.start_time);
    return format(rideTime, 'MMM d, yyyy h:mm a') + ' PT';
  };

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
      <Card className="mx-2 sm:mx-0">
        <CardContent className="pt-8 pb-8 px-4 sm:px-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No carpools yet</h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
                You haven&apos;t created any carpools yet. Start by creating your first carpool to begin sharing rides!
              </p>
            </div>
            <Button 
              onClick={() => router.push('/carpools/create')}
              className="mt-4 bg-[#2B5335] hover:bg-[#1e3b25] text-white"
            >
              Create Your First Carpool
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mx-2 sm:mx-0">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">My Carpools ({carpools?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {/* Mobile view - card layout */}
          <div className="block sm:hidden space-y-4">
            {carpools?.map((carpool) => {
              const details = carpoolDetailsMap[carpool.id || ''] || carpool;
              
              const safeString = (value: any): string => {
                if (typeof value === 'string') return value;
                if (value && typeof value === 'object' && 'String' in value && 'Valid' in value) {
                  return value.Valid ? value.String : '';
                }
                return String(value || '');
              };
              
              const safeDetails = {
                ...details,
                available_seats: details?.available_seats ?? 0,
                seats: details?.seats ?? 0
              };
              
              return (
                <div key={carpool.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{safeString(carpool.carpool_name)}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      safeDetails.available_seats <= 0 
                        ? 'bg-red-100 text-red-700' 
                        : safeDetails.available_seats <= 1 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {safeDetails.available_seats} of {safeDetails.seats} seats
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Schedule:</span>
                      <span>{getScheduleTypeLabel(details?.schedule?.schedule_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destination:</span>
                      <span className="text-right max-w-[150px] truncate">{safeString(carpool.destination_address)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Ride:</span>
                      <span>
                        {getNextRide(ridesMap[carpool.id ?? ''] || [])}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Members:</span>
                      <div className="flex items-center space-x-1">
                        {carpool.id && membersMap[carpool.id]?.length ? (
                          <>
                            {(membersMap[carpool.id] as any[]).slice(0, 2).map((m: any, i: number) => {
                              const memberName = typeof m === 'object' && m !== null 
                                ? (m.name || m.display_name || m.email || 'U')
                                : String(m || 'U');
                              return (
                                <span
                                  key={i}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white border border-white"
                                  style={{ background: stringToColor(memberName) }}
                                >
                                  {memberName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              );
                            })}
                            {(membersMap[carpool.id] as any[]).length > 2 && (
                              <span className="text-xs text-gray-500">+{(membersMap[carpool.id] as any[]).length - 2}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No members</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => carpool.id && handleInvite(carpool.id)}
                      disabled={safeDetails.available_seats <= 0}
                      className={`text-xs ${
                        safeDetails.available_seats <= 0 
                          ? 'bg-gray-200 text-gray-500' 
                          : 'bg-blue-200 hover:bg-blue-300'
                      }`}
                    >
                      {safeDetails.available_seats <= 0 ? 'Full' : 'Invite'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => carpool.id && handleViewCalendar(carpool.id)}
                      className="bg-[#2B5335] hover:bg-[#1e3b25] text-white text-xs"
                    >
                      <CalendarDaysIcon className="h-3 w-3 mr-1" />
                      Calendar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => carpool.id && handleDelete(carpool.id)}
                      className="text-xs"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Desktop view - table layout */}
          <div className="hidden sm:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Available Seats</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Next Ride</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carpools?.map((carpool) => {
                  const details = carpoolDetailsMap[carpool.id || ''] || carpool;
                  
                  // Helper function to safely extract string values from nested objects
                  const safeString = (value: any): string => {
                    if (typeof value === 'string') return value;
                    if (value && typeof value === 'object' && 'String' in value && 'Valid' in value) {
                      return value.Valid ? value.String : '';
                    }
                    return String(value || '');
                  };
                  
                  // Ensure details has required properties
                  const safeDetails = {
                    ...details,
                    available_seats: details?.available_seats ?? 0,
                    seats: details?.seats ?? 0
                  };
                  
                  return (
                    <TableRow key={carpool.id}>
                      <TableCell className="font-medium">{safeString(carpool.carpool_name)}</TableCell>
                      <TableCell>{getScheduleTypeLabel(details?.schedule?.schedule_type)}</TableCell>
                      <TableCell>
                        <span className={`${
                          safeDetails.available_seats <= 0 
                            ? 'text-red-600 font-semibold' 
                            : safeDetails.available_seats <= 1 
                              ? 'text-orange-600 font-medium' 
                              : 'text-gray-900'
                        }`}>
                          {safeDetails.available_seats} of {safeDetails.seats}
                          {safeDetails.available_seats <= 0 && ' (Full)'}
                        </span>
                      </TableCell>
                    <TableCell>
                      {carpool.id && membersMap[carpool.id]?.length ? (
                        <Tooltip content={
                          <div className="text-left">
                            <div className="font-semibold mb-1">Members:</div>
                            {(membersMap[carpool.id] as any[]).map((m: any, i: number) => {
                              // Ensure we're not rendering an object directly
                              const memberName = typeof m === 'object' && m !== null 
                                ? (m.name || m.display_name || m.email || 'Unknown Member')
                                : String(m || 'Unknown Member');
                              return (
                                <div key={m?.id || m?.email || i} className="text-xs">
                                  {memberName}
                                </div>
                              );
                            })}
                          </div>
                        }>
                          <div className="flex items-center space-x-1">
                            {(membersMap[carpool.id] as any[]).slice(0, 3).map((m: any, i: number) => {
                              // Ensure we're not rendering an object directly
                              const memberName = typeof m === 'object' && m !== null 
                                ? (m.name || m.display_name || m.email || 'U')
                                : String(m || 'U');
                              const memberKey = typeof m === 'object' && m !== null 
                                ? (m.id || m.email || i)
                                : i;
                              return (
                                <span
                                  key={memberKey}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white border-2 border-white shadow"
                                  style={{ background: stringToColor(memberName) }}
                                >
                                  {memberName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              );
                            })}
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
                    <TableCell>{safeString(carpool.destination_address)}</TableCell>
                    <TableCell>
                      {getNextRide(ridesMap[carpool.id ?? ''] || [])}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip content={safeDetails.available_seats <= 0
                          ? 'Invite someone to join this carpool. Disabled when the carpool is full.'
                          : 'Invite someone to join this carpool.'}>
                          <Button
                            variant="secondary"
                            onClick={() => carpool.id && handleInvite(carpool.id)}
                            disabled={safeDetails.available_seats <= 0}
                            className={`${
                              safeDetails.available_seats <= 0 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-200 hover:bg-blue-300'
                            }`}
                          >
                            {safeDetails.available_seats <= 0 ? 'Full' : 'Invite'}
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


    </>
  )
} 