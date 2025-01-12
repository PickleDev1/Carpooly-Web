'use client'

import { useState, useEffect, useCallback } from 'react'
import { Car, Calendar, Route, Leaf } from 'lucide-react'
import { useApi } from '@/services/api'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface TopCarpooler {
  name: string
  rides: number
  co2_saved: string
}

interface Analytics {
  total_carpools: number
  total_rides: number
  miles_saved: number
  co2_reduced: number
  top_carpoolers: TopCarpooler[]
}

export default function AnalyticsPage() {
  const api = useApi()
  const [analytics, setAnalytics] = useState<Analytics>({
    total_carpools: 0,
    total_rides: 0,
    miles_saved: 0,
    co2_reduced: 0,
    top_carpoolers: [] // Initialize empty array for top carpoolers
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await api.getAnalytics()
        setAnalytics(data)
      } catch (err) {
        setError('Failed to load analytics data. Please try again later.')
        console.error('Error fetching analytics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [api])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  const metrics = [
    { title: 'Total Carpools', value: analytics.total_carpools, icon: Car, color: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-500' },
    { title: 'Total Rides', value: analytics.total_rides, icon: Calendar, color: 'bg-purple-50', textColor: 'text-purple-700', iconColor: 'text-purple-500' },
    { title: 'Car Miles Saved', value: `${analytics.miles_saved.toLocaleString()} mi`, icon: Route, color: 'bg-[#E8EDDF]', textColor: 'text-[#2B5335]', iconColor: 'text-[#2B5335]' },
    { title: 'CO₂ Emissions Reduced', value: `${analytics.co2_reduced.toLocaleString()} lbs`, icon: Leaf, color: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-500' },
  ]

  // Sample data for the chart - replace with real data when available
  const monthlyData = [
    { name: 'Jan', rides: 4 },
    { name: 'Feb', rides: 6 },
    { name: 'Mar', rides: 8 },
    { name: 'Apr', rides: 12 },
    { name: 'May', rides: 15 },
    { name: 'Jun', rides: 18 },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* Leaderboard Section */}
      <div className="mt-12 bg-green-50 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Top Carpoolers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-6 text-left">Rank</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Rides</th>
                <th className="py-3 px-6 text-left">CO₂ Saved</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top_carpoolers.map((user, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-6">{index + 1}</td>
                  <td className="py-3 px-6">{user.name}</td>
                  <td className="py-3 px-6">{user.rides}</td>
                  <td className="py-3 px-6">{user.co2_saved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends Section with Chart */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Monthly Trends</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="rides" 
                stroke="#2B5335" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

