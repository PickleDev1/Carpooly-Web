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
  const [removingParticipantId, setRemovingParticipantId] = useState<string | null>(null)
  const { user } = useUser()
  const api = useApi()
  const [carpoolCreatorId, setCarpoolCreatorId] = useState<string | null>(null);
  const [hasJoinedBack, setHasJoinedBack] = useState(false);

  const fetchDayDetails = async () => {
    try {
      console.log('Fetching day details for date:', format(date, 'yyyy-MM-dd'))
      
      // Fetch rides for the specific date
      const rides = await api.getCarpoolRideByDate(carpoolId, format(date, 'yyyy-MM-dd'))
      console.log('Received rides:', rides)
      
      // Use participants from the ride data instead of separate call
      let participants = []
      if (rides && rides.length > 0) {
        const rideDetails = rides[0]
        console.log('Ride details:', rideDetails)
        
        // Extract participants from the ride data
        if (rideDetails.participants && Array.isArray(rideDetails.participants)) {
          participants = rideDetails.participants;
        }
        
        console.log('Participants from ride data:', participants)
        
        setDayDetails({
          id: rideDetails.id,
          driver: rideDetails.driver_id ? { id: rideDetails.driver_id } : undefined,
          participants: participants,
        })
      } else {
        // No ride exists yet, try to get participants from separate call as fallback
        console.log('No ride exists, trying separate participants call')
        try {
          const participantsData = await api.getCarpoolParticipantsByDate(carpoolId, format(date, 'yyyy-MM-dd'))
          console.log('Fallback participants data:', participantsData)
          
          // Always extract the .participants array if present
          if (participantsData && Array.isArray(participantsData.participants)) {
            participants = participantsData.participants;
          } else if (Array.isArray(participantsData)) {
            participants = participantsData;
          } else if (participantsData && Array.isArray(participantsData.members)) {
            participants = participantsData.members;
          } else if (participantsData && participantsData.data && Array.isArray(participantsData.data)) {
            participants = participantsData.data;
          } else {
            participants = [];
          }
          console.log('Fallback participants array:', participants);
        } catch (error) {
          console.error('Error fetching fallback participants:', error)
          participants = []
        }
        
        setDayDetails({
          id: '',
          driver: undefined,
          participants: participants,
        })
      }
    } catch (error) {
      console.error('Error fetching ride details:', error)
    }
  }

  // Fetch the carpool creator using the new endpoint
  const fetchCarpoolCreator = async () => {
    try {
      const headers = await api.getHeaders ? await api.getHeaders() : {};
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/carpools/${carpoolId}/creator`, {
        headers
      });
      if (!response.ok) throw new Error('Failed to fetch carpool creator');
      const data = await response.json();
      setCarpoolCreatorId(data.creator_id);
      console.log('Carpool Creator UUID:', data.creator_id);
    } catch (error) {
      console.error('Error fetching carpool creator:', error);
    }
  };

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
      // Set the removing participant ID for visual feedback
      const currentUserParticipant = dayDetails.participants.find(p => p.clerk_id === user.id);
      if (currentUserParticipant) {
        setRemovingParticipantId(currentUserParticipant.id);
        // Optimistically remove the current user from the participants list
        setDayDetails(prev => prev ? {
          ...prev,
          participants: prev.participants.filter(p => p.id !== currentUserParticipant.id),
          driver: prev.driver?.id === currentUserParticipant.id ? undefined : prev.driver
        } : null);
      }
      // Call the same API as Remove, using the logged-in user's UUID
      await api.removeCarpoolParticipantById(dayDetails.id, currentUserParticipant?.id || user.id);
      await fetchDayDetails();
    } catch (error) {
      console.error('Error removing participant:', error)
      await fetchDayDetails()
    } finally {
      setIsLoading(false)
      setRemovingParticipantId(null)
    }
  }

  // Add a handler for removing other participants
  const handleRemoveOtherParticipant = async (participantId: string) => {
    if (!dayDetails?.id) return;
    try {
      setIsLoading(true);
      
      // Set the removing participant ID for visual feedback
      setRemovingParticipantId(participantId);
      
      // Optimistically remove the participant from the list
      const participantToRemove = dayDetails.participants.find(p => p.id === participantId);
      if (participantToRemove) {
        setDayDetails(prev => prev ? {
          ...prev,
          participants: prev.participants.filter(p => p.id !== participantId),
          // If the removed participant was the driver, clear the driver
          driver: prev.driver?.id === participantId ? undefined : prev.driver
        } : null);
      }
      
      // Make the API call
      await api.removeCarpoolParticipantById(dayDetails.id, participantId);
      
      // Refresh the day details to get the latest state
      await fetchDayDetails();
    } catch (error) {
      console.error('Error removing participant:', error);
      // Revert the optimistic update if there's an error
      await fetchDayDetails();
    } finally {
      setIsLoading(false);
      setRemovingParticipantId(null);
    }
  };

  // Handler to join back the ride
  const handleJoinBack = async () => {
    if (!user?.id || !dayDetails?.id) return;
    try {
      setIsLoading(true);
      console.log('[JoinBackButton] Clicked');
      setHasJoinedBack(true); // Hide button immediately
      setDayDetails(prev => {
        const updated = prev ? {
          ...prev,
          participants: [
            ...prev.participants,
            {
              id: user.id,
              clerk_id: user.id, // fallback if needed
              name: user.firstName || user.fullName || (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress) || 'You',
              display_name: user.fullName || user.firstName || (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress) || 'You',
              email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
            }
          ]
        } : null;
        console.log('[JoinBackButton] Optimistic participants:', updated?.participants.map(p => p.id));
        return updated;
      });
      await api.addCarpoolParticipantById(dayDetails.id, user.id);
      await fetchDayDetails();
      setHasJoinedBack(false); // Reset after refresh
    } catch (error) {
      setHasJoinedBack(false);
      console.error('Error joining back the ride:', error);
      await fetchDayDetails();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDayDetails();
      fetchCarpoolCreator();
    }
  }, [isOpen, date, carpoolId]);

  // Debug log when dayDetails changes
  useEffect(() => {
    if (user && dayDetails) {
      const isParticipant = dayDetails.participants.some(p => p.clerk_id === user.id);
      console.log('[JoinBackButton] DEBUG - Button condition check:', {
        user: !!user,
        dayDetails: !!dayDetails,
        hasJoinedBack,
        isParticipant,
        dayDetailsId: dayDetails.id,
        participants: dayDetails.participants.map(p => ({ id: p.id, clerk_id: p.clerk_id, name: p.name })),
        userId: user.id,
        shouldShowButton: !hasJoinedBack && !dayDetails.participants.some(p => p.clerk_id === user.id) && dayDetails.id
      });
    }
  }, [user, dayDetails, hasJoinedBack]);

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
                    console.log('=== DRIVER DEBUG ===');
                    console.log('Driver participant found:', driverParticipant);
                    console.log('Driver ID:', driverParticipant?.id);
                    console.log('Carpool Creator ID:', carpoolCreatorId);
                    console.log('Are they equal?', driverParticipant?.id === carpoolCreatorId);
                    console.log('===================');
                    
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
                            {driverParticipant.id === carpoolCreatorId && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center">
                                <span className="mr-1">👑</span> Creator
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
              {/* Show Join Back button if user is not a participant */}
              {user && dayDetails && !hasJoinedBack && !dayDetails.participants.some(p => p.clerk_id === user.id) && dayDetails.id && (
                <Button
                  onClick={handleJoinBack}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mb-2"
                >
                  {isLoading ? 'Joining...' : 'Join Back'}
                </Button>
              )}
              {dayDetails?.participants.map(participant => {
                const isCreator = participant.id === carpoolCreatorId;
                const isSelf = participant.clerk_id === user?.id;
                const isUserCreator = user?.id && dayDetails.participants.find(p => p.id === carpoolCreatorId)?.clerk_id === user.id;
                const isBeingRemoved = removingParticipantId === participant.id;
                
                return (
                  <div 
                    key={participant.id} 
                    className={`flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-gray-200 transition-all duration-300 ${
                      isBeingRemoved ? 'opacity-50 scale-95' : ''
                    }`}
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
                          {isSelf && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              You
                            </span>
                          )}
                          {isCreator && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center">
                              <span className="mr-1">👑</span> Creator
                            </span>
                          )}
                          {isBeingRemoved && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full animate-pulse">
                              Removing...
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{participant.email}</span>
                      </div>
                    </div>
                    {/* Button logic - only show if a ride exists */}
                    {dayDetails?.id && (
                      <>
                        {isUserCreator ? (
                          // Logged-in user is creator
                          isSelf ? (
                            <Button
                              variant="destructive"
                              onClick={handleRemoveParticipant}
                              size="sm"
                              disabled={isLoading}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                            >
                              {isLoading ? "Leaving..." : "Leave Ride"}
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              onClick={() => handleRemoveOtherParticipant(participant.id)}
                              size="sm"
                              disabled={isLoading}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                            >
                              Remove
                            </Button>
                          )
                        ) : (
                          // Logged-in user is not creator
                          isSelf ? (
                            !isCreator && (
                              <Button
                                variant="destructive"
                                onClick={handleRemoveParticipant}
                                size="sm"
                                disabled={isLoading}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                              >
                                {isLoading ? "Leaving..." : "Leave Ride"}
                              </Button>
                            )
                          ) : (
                            !isCreator && (
                              <Button
                                variant="destructive"
                                onClick={() => handleRemoveOtherParticipant(participant.id)}
                                size="sm"
                                disabled={isLoading}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                              >
                                Remove
                              </Button>
                            )
                          )
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 