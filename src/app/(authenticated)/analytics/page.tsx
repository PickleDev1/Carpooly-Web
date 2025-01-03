'use client'

import { useState, useEffect } from 'react'
import { Car, Calendar, Route, Leaf } from 'lucide-react'
import { useApi } from '@/services/api'
import type { Analytics } from '@/types/api'

export default function AnalyticsPage() {
  const api = useApi();
  const [analytics, setAnalytics] = useState<Analytics>({
    total_carpools: 0,
    total_rides: 0,
    miles_saved: 0,
    co2_reduced: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const data = await api.getAnalytics()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [api])

  const metrics = [
    {
      title: 'Total Carpools',
      value: analytics.total_carpools,
      icon: Car,
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Total Rides',
      value: analytics.total_rides,
      icon: Calendar,
      color: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Car Miles Saved',
      value: `${analytics.miles_saved.toLocaleString()} mi`,
      icon: Route,
      color: 'bg-[#E8EDDF]',
      textColor: 'text-[#2B5335]',
      iconColor: 'text-[#2B5335]'
    },
    {
      title: 'CO₂ Emissions Reduced',
      value: `${analytics.co2_reduced.toLocaleString()} lbs`,
      icon: Leaf,
      color: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Optional: Add a chart or graph section below */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Monthly Trends</h2>
        <p className="text-gray-500">Coming soon: Charts and graphs to visualize your impact over time.</p>
      </div>
    </div>
  )
}