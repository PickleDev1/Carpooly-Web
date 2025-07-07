'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from '@clerk/nextjs'
import { useApi } from '@/services/api'

interface CarpoolDayModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  carpoolId: string
}

interface CarpoolMember {
  id: string
  clerk_id: string
  email: string
  name: string
  display_name: string
  city: string
  state: string
  created_at: string
  updated_at: string
}

interface DayDetails {
  id: string
  driver?: {
    id: string
  }
  participants: {
    id: string
    clerk_id: string
    name: string
    display_name: string
    email: string
  }[]
}

interface Participant {
  id: string
  clerk_id: string
  email: string
  name: string
  display_name: string
}

interface RideDetails {
  id: string
  carpool_id: string
  driver_id: string
  participants: Participant[]
  start_time: string
  status: number
}

export function CarpoolDayModal({ isOpen, onClose, date, carpoolId }: CarpoolDayModalProps) {
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const api = useApi()

  const fetchDayDetails = async () => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const rides = await api.getCarpoolRideByDate(carpoolId, formattedDate)
      console.log('Received rides:', rides)
      
      if (rides && rides.length > 0) {
        const rideDetails = rides[0]
        setDayDetails({
          id: rideDetails.id,
          driver: rideDetails.driver_id ? { id: rideDetails.driver_id } : undefined,
          participants: rideDetails.participants || [],
        })
      }
    } catch (error) {
      console.error('Error fetching ride details:', error)
    }
  }

  const handleSetDriver = async () => {
    if (!user?.id || !dayDetails?.participants || !dayDetails?.id) return;
    
    try {
      setIsLoading(true)
      const currentParticipant = dayDetails.participants.find(
        p => p.clerk_id === user.id
      );

      if (!currentParticipant) {
        console.error('Could not find participant record for current user');
        return;
      }

      console.log('Setting driver with database ID:', currentParticipant.id);
      console.log('For ride ID:', dayDetails.id);
      
      // Optimistically update the UI
      setDayDetails(prev => prev ? {
        ...prev,
        driver: { id: currentParticipant.id }
      } : null);

      // Make the API call
      await api.setCarpoolDriver(dayDetails.id, currentParticipant.id);
      console.log('Successfully set driver');
      
      // Fetch the latest data in the background
      fetchDayDetails();
    } catch (error) {
      console.error('Error setting driver:', error);
      // Revert the optimistic update if there's an error
      await fetchDayDetails();
    } finally {
      setIsLoading(false);
    }
  }

  const handleRemoveParticipant = async () => {
    if (!user?.id || !dayDetails?.id) return;
    
    try {
      setIsLoading(true)
      const formattedDate = format(date, 'yyyy-MM-dd')
      await api.removeCarpoolParticipant(carpoolId, formattedDate)
      
      // Increment available seats when user leaves
      await api.incrementCarpoolAvailableSeats(carpoolId)
      console.log(`Incremented available seats for carpool ${carpoolId} when user left`)
      
      // Refresh the day details after removing participant
      await fetchDayDetails()
    } catch (error) {
      console.error('Error removing participant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchDayDetails()
    }
  }, [isOpen, date, carpoolId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Carpool Details for {format(date, 'MMMM d, yyyy')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Driver Section */}
          <div className="space-y-2">
            <h3 className="font-medium">Driver</h3>
            {dayDetails?.driver?.id && dayDetails.driver.id !== "00000000-0000-0000-0000-000000000000" ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const driverParticipant = dayDetails.participants.find(p => p.id === dayDetails.driver?.id);
                    return driverParticipant ? (
                      <>
                        <div className="h-8 w-8 rounded-full bg-[#2B5335] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {driverParticipant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{driverParticipant.name}</span>
                            {driverParticipant.clerk_id === user?.id && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{driverParticipant.email}</span>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            ) : (
              <Button
                onClick={handleSetDriver}
                disabled={isLoading}
                className="w-full bg-[#2B5335] hover:bg-[#1e3b25] text-white"
              >
                {isLoading ? "Signing up..." : "Sign Up as Driver"}
              </Button>
            )}
          </div>

          {/* Participants Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">Participants</h3>
            <div className="space-y-2">
              {dayDetails?.participants.map(participant => (
                <div 
                  key={participant.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-[#2B5335] flex items-center justify-center">
                      <span className="text-white font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{participant.name}</span>
                        {participant.clerk_id === user?.id && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{participant.email}</span>
                    </div>
                  </div>
                  {participant.clerk_id === user?.id && (
                    <Button
                      variant="destructive"
                      onClick={handleRemoveParticipant}
                      size="sm"
                      disabled={isLoading}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                    >
                      {isLoading ? "Leaving..." : "Leave Ride"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 