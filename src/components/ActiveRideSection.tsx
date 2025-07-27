'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useApi } from '@/services/api'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'

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
  const [isLoading, setIsLoading] = useState(true)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  const { user } = useUser()
  const api = useApi()

  useEffect(() => {
    let mounted = true

    const fetchActiveRide = async () => {
      if (!user?.id) return
      
      try {
        console.log('🔔 ActiveRideSection: Fetching active rides for user:', user.id)
        const rides = await api.getUserActiveRides(user.id)
        console.log('🔔 ActiveRideSection: Raw rides data:', rides)
        
        if (mounted) {
          // Deduplicate rides by ride ID to prevent duplicates
          const uniqueRides = rides ? rides.reduce((acc: any[], ride: any) => {
            const existingRide = acc.find(r => r.id === ride.id)
            if (!existingRide) {
              acc.push(ride)
            } else {
              console.log('🔔 ActiveRideSection: Duplicate ride found and removed:', ride.id)
            }
            return acc
          }, []) : []
          
          console.log('🔔 ActiveRideSection: After deduplication:', uniqueRides.length, 'rides')
          
          // Use the first active ride if multiple exist
          const firstRide = uniqueRides && uniqueRides.length > 0 ? uniqueRides[0] : null
          setActiveRide(firstRide)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('🔔 ActiveRideSection: Failed to fetch active ride:', err)
        if (mounted) {
          setActiveRide(null)
          setIsLoading(false)
        }
      }
    }

    fetchActiveRide()

    return () => {
      mounted = false
    }
  }, [user?.id, api])

  if (isLoading) return <div>Loading ride details...</div>
  if (!activeRide) return null

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Active Ride</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Left side: Ride details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <p><strong>Carpool:</strong> {activeRide.carpool_name}</p>
              <p><strong>Driver:</strong> {activeRide.driver_name}</p>
              <p><strong>ETA:</strong> {activeRide.estimated_arrival}</p>
              <p><strong>Destination:</strong> {activeRide.destination.address}</p>
              <p><strong>Current Location:</strong> 
                {`(${activeRide.current_location.lat}, ${activeRide.current_location.lng})`}
              </p>
              <p><strong>Passengers:</strong> {activeRide.passengers.join(', ')}</p>
            </div>
          </div>

          {/* Right side: Map */}
          <div className="h-[400px]">
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={activeRide.current_location}
              zoom={13}
            >
              {/* Current Location Marker */}
              {activeRide.current_location && (
                <Marker
                  position={activeRide.current_location}
                  label={{
                    text: "🚗",
                    color: "#2563eb" // blue color
                  }}
                />
              )}
              
              {/* Destination Marker */}
              {activeRide.destination && (
                <Marker
                  position={activeRide.destination}
                  label={{
                    text: "🎯",
                    color: "#10b981" // green color
                  }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#10b981",
                    fillOpacity: 0.6,
                    strokeWeight: 1,
                    scale: 8
                  }}
                />
              )}
              
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </div>
        </div>
      </div>
    </div>
  )
} 