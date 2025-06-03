'use client'

import { useState, useEffect } from 'react'
import { Car, Calendar, Route, Leaf, Trees } from 'lucide-react'
import { useApi } from '@/services/api'
import { useCarpools } from '@/hooks/useCarpools'
import { useUser } from '@clerk/nextjs'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [totalUserRides, setTotalUserRides] = useState(0)
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
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  const myCarpoolsCount = carpools?.length || 0
  
  // Calculate environmental impact based on rides
  // Assume each ride saves 2.5 kg of CO2
  const co2Saved = totalUserRides * 2.5 // in kg
  
  // Calculate leaves (1 leaf absorbs ~0.05 kg CO2/year)
  const leavesCount = Math.round(co2Saved / 0.05)
  
  // Calculate trees (1 tree absorbs ~22 kg CO2/year)
  const treesCount = Math.round(co2Saved / 22)

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
      value: 'Coming Soon', 
      icon: Route, 
      color: 'bg-[#E8EDDF]', 
      textColor: 'text-[#2B5335]', 
      iconColor: 'text-[#2B5335]' 
    },
    { 
      title: 'Leaves Saved', 
      value: 'Coming Soon', 
      icon: Leaf, 
      color: 'bg-green-50', 
      textColor: 'text-green-700', 
      iconColor: 'text-green-500' 
    },
    { 
      title: 'Trees Equivalent', 
      value: 'Coming Soon', 
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

