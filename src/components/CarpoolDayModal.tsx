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
  driver?: {
    id: string
    name: string
  }
  participants: {
    id: string
    clerk_id: string
    name: string
    email: string
  }[]
  comments: {
    id: string
    userId: string
    userName: string
    text: string
    timestamp: string
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
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const api = useApi()

  useEffect(() => {
    if (isOpen) {
      fetchDayDetails()
    }
  }, [isOpen, date, carpoolId])

  const fetchDayDetails = async () => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      console.log('Fetching ride details for date:', formattedDate)
      const rides = await api.getCarpoolRideByDate(carpoolId, formattedDate)
      console.log('Received rides:', rides)
      
      if (rides && rides.length > 0) {
        const rideDetails = rides[0] // Get the first ride from the array
        console.log('All participants:', rideDetails.participants) // Debug log
        
        setDayDetails({
          driver: rideDetails.driver_id !== "00000000-0000-0000-0000-000000000000" 
            ? { id: rideDetails.driver_id, name: "Driver" } 
            : undefined,
          participants: rideDetails.participants?.map((participant: Participant) => ({
            id: participant.id,
            clerk_id: participant.clerk_id,
            name: participant.display_name || participant.name,
            email: participant.email
          })) || [],
          comments: []
        })
      } else {
        setDayDetails({
          driver: undefined,
          participants: [],
          comments: []
        })
      }
    } catch (error) {
      console.error('Error fetching ride details:', error)
      setDayDetails({
        driver: undefined,
        participants: [],
        comments: []
      })
    }
  }

  const handleSetDriver = async () => {
    try {
      setIsLoading(true)
      await api.setCarpoolDriver(carpoolId, format(date, 'yyyy-MM-dd'))
      await fetchDayDetails()
    } catch (error) {
      console.error('Error setting driver:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDriver = async () => {
    try {
      setIsLoading(true)
      await api.removeCarpoolDriver(carpoolId, format(date, 'yyyy-MM-dd'))
      await fetchDayDetails()
    } catch (error) {
      console.error('Error removing driver:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveParticipant = async () => {
    try {
      setIsLoading(true)
      await api.removeCarpoolParticipant(carpoolId, format(date, 'yyyy-MM-dd'))
      await fetchDayDetails()
    } catch (error) {
      console.error('Error removing participant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return

    try {
      setIsLoading(true)
      await api.addCarpoolComment(carpoolId, format(date, 'yyyy-MM-dd'), comment)
      setComment('')
      await fetchDayDetails()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isUserDriver = dayDetails?.driver?.id === user?.id

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
            {dayDetails?.driver ? (
              <div className="flex items-center justify-between">
                <span>{dayDetails.driver.name}</span>
                {isUserDriver && (
                  <Button 
                    variant="destructive" 
                    onClick={handleRemoveDriver}
                    disabled={isLoading}
                  >
                    Remove as Driver
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={handleSetDriver}
                disabled={isLoading}
                className="w-full bg-[#2B5335] hover:bg-[#1e3b25] text-white"
              >
                Set as Driver
              </Button>
            )}
          </div>

          {/* Participants Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">Participants</h3>
            <div className="space-y-2">
              {dayDetails?.participants.map(participant => {
                console.log('Current participant clerk_id:', participant.clerk_id)
                console.log('Logged in user id:', user?.id)
                console.log('Do they match?', participant.clerk_id === user?.id)
                
                return (
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
                        onClick={() => {
                          console.log('Remove participant clicked:', participant.id);
                        }}
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                      >
                        Leave Ride
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <h3 className="font-medium">Comments</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {dayDetails?.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-2 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-gray-500">
                      {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button
                onClick={handleAddComment}
                disabled={isLoading || !comment.trim()}
                className="bg-[#2B5335] hover:bg-[#1e3b25] text-white"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 