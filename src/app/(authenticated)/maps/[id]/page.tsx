'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users } from 'lucide-react'
import { useParams } from 'next/navigation'

interface ParticipantLocation {
  id: string
  name: string
  is_driver: boolean
  location: {
    lat: number
    lng: number
  }
}

interface RideDetails {
  id: string
  carpool_name: string
  start_time: string
  end_time: string
  destination_address: string
  destination_location: {
    lat: number
    lng: number
  }
  participants: ParticipantLocation[]
}

export default function RideMapPage() {
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const params = useParams()

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        setIsLoading(true)
        const data = await api.getRideDetails(params.id as string)
        setRideDetails(data)
      } catch (err) {
        setError('Failed to load ride details')
        console.error('Error fetching ride details:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRideDetails()
  }, [api, params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  if (error || !rideDetails) {
    return (
      <div className="text-center py-8 text-red-600">
        {error || 'Ride not found'}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{rideDetails.carpool_name}</h1>
        <div className="flex items-center space-x-4 text-gray-600">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>
              {new Date(rideDetails.start_time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
              })} - {new Date(rideDetails.end_time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
              })}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{rideDetails.destination_address}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              {/* Map component will be added here */}
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Map will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#2B5335]">
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rideDetails.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-[#2B5335] flex items-center justify-center text-white">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-gray-500">
                          {participant.is_driver ? 'Driver' : 'Passenger'}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {participant.location ? 'Online' : 'Offline'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 