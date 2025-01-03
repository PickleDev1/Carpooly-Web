'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from '@react-google-maps/api'

interface ActiveRide {
  id: string
  carpool_name: string
  driver_name: string
  current_location: {
    lat: number
    lng: number
  }
  destination: {
    address: string
    lat: number
    lng: number
  }
  estimated_arrival: string
  passengers: string[]
  status: string
}

export function ActiveRideSection() {
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rides/active/${user?.id}`)
        const data = await response.json()
        setActiveRide(data)
        if (data) {
          // Fetch directions
          const directionsService = new google.maps.DirectionsService()
          const result = await directionsService.route({
            origin: data.current_location,
            destination: data.destination,
            travelMode: google.maps.TravelMode.DRIVING
          })
          setDirections(result)
        }
      } catch (err) {
        console.error('Error fetching active ride:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchActiveRide()
    }
  }, [user?.id])

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  if (!activeRide) {
    return <p className="text-gray-500">No active carpool rides at the moment</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ride Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">{activeRide.carpool_name}</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Driver</p>
            <p className="font-medium">{activeRide.driver_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="font-medium">{activeRide.destination.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Arrival</p>
            <p className="font-medium">{activeRide.estimated_arrival}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Passengers</p>
            <ul className="list-disc list-inside">
              {activeRide.passengers.map((passenger, index) => (
                <li key={index} className="font-medium">{passenger}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{activeRide.status}</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[400px] rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={activeRide.current_location}
          zoom={13}
        >
          <Marker position={activeRide.current_location} />
          <Marker 
            position={activeRide.destination}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }}
          />
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </div>
  )
} 