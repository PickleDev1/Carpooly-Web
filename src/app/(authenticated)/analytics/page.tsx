'use client'

import { useState, useEffect } from 'react'
import { Car, Calendar, Route, Leaf, Trees } from 'lucide-react'
import { useApi } from '@/services/api'
import { useCarpools } from '@/hooks/useCarpools'
import { useUser } from '@clerk/nextjs'

// Haversine formula to calculate distance in miles between two lat/lng points
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 3958.8 // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [totalUserRides, setTotalUserRides] = useState(0)
  const [homeLat, setHomeLat] = useState<number | null>(null)
  const [homeLng, setHomeLng] = useState<number | null>(null)
  const [milesSaved, setMilesSaved] = useState<number | null>(null)
  const [membersLoading, setMembersLoading] = useState(true)
  const api = useApi()
  const { carpools } = useCarpools()
  const { user } = useUser()

  useEffect(() => {
    async function fetchData() {
      try {
        if (user?.id) {
          const userRides = await api.getUserTotalRides(user.id)
          setTotalUserRides(userRides)
        }
        // Fetch home location
        const locationSettings = await api.getLocationSettings()
        setHomeLat(locationSettings.home_latitude ?? null)
        setHomeLng(locationSettings.home_longitude ?? null)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  useEffect(() => {
    // Calculate miles saved once we have home location and carpools
    async function calculateMilesSaved() {
      if (homeLat && homeLng && carpools && carpools.length > 0) {
        setMembersLoading(true)
        let totalMiles = 0
        for (const carpool of carpools) {
          if (
            typeof carpool.destination_lat === 'number' &&
            typeof carpool.destination_lng === 'number' &&
            carpool.id
          ) {
            try {
              const members = await api.getCarpoolMembers(carpool.id)
              const numParticipants = Array.isArray(members) ? members.length : 1
              if (numParticipants > 1) {
                const miles = haversineMiles(
                  homeLat,
                  homeLng,
                  carpool.destination_lat,
                  carpool.destination_lng
                )
                // Miles saved = (participants - 1) * distance
                totalMiles += (numParticipants - 1) * miles
              }
            } catch (err) {
              console.error('Error fetching carpool members:', err)
            }
          }
        }
        setMilesSaved(Math.round(totalMiles))
        setMembersLoading(false)
      }
    }
    calculateMilesSaved()
  }, [homeLat, homeLng, carpools, api])

  if (loading || membersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  const myCarpoolsCount = carpools?.length || 0
  
  // Environmental impact calculations based on research
  // 1 leaf = 0.5 miles saved (based on average CO2 absorption of a leaf)
  // 1 tree = 100 leaves = 50 miles saved
  const leavesSaved = milesSaved !== null ? Math.round(milesSaved / 0.5) : 0
  const treesSaved = Math.round(leavesSaved / 100)

  const metrics = [
    { 
      title: 'Total Carpools', 
      value: myCarpoolsCount, 
      icon: Car, 
      color: 'bg-blue-50', 
      textColor: 'text-blue-700', 
      iconColor: 'text-blue-500' 
    },
    { 
      title: 'Total Rides', 
      value: totalUserRides, 
      icon: Calendar, 
      color: 'bg-purple-50', 
      textColor: 'text-purple-700', 
      iconColor: 'text-purple-500' 
    },
    { 
      title: 'Miles Saved', 
      value: milesSaved !== null ? milesSaved : 'N/A', 
      icon: Route, 
      color: 'bg-[#E8EDDF]', 
      textColor: 'text-[#2B5335]', 
      iconColor: 'text-[#2B5335]' 
    },
    { 
      title: 'Leaves Saved', 
      value: leavesSaved, 
      icon: Leaf, 
      color: 'bg-green-50', 
      textColor: 'text-green-700', 
      iconColor: 'text-green-500' 
    },
    { 
      title: 'Trees Equivalent', 
      value: treesSaved, 
      icon: Trees, 
      color: 'bg-emerald-50', 
      textColor: 'text-emerald-700', 
      iconColor: 'text-emerald-500' 
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div 
              key={index}
              className={`${metric.color} rounded-lg shadow-sm p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.iconColor} rounded-full p-2`}>
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">
                {metric.title}
              </h3>
              <p className={`${metric.textColor} text-2xl font-bold mt-2`}>
                {metric.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

