'use client'

import { useState, useEffect } from 'react'
import { Car, Calendar, Route, Leaf, Trees, TrendingUp, Users, Clock, RefreshCw } from 'lucide-react'
import { useApi } from '@/services/api'
import { useCarpools } from '@/hooks/useCarpools'
import { useUser } from '@clerk/nextjs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface CompletedRide {
  id: string
  date: string
  distance: number
  participants: number
}

interface CompletedRidesData {
  count: number
  rides: CompletedRide[]
}

// Fallback interface for legacy API format
interface LegacyCompletedRide {
  id: string
  carpool_name: string
  date: string
  time: string
  destination_address: string
  destination_lat?: number
  destination_lng?: number
  passengers: number
  user_id?: string
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [completedRides, setCompletedRides] = useState<CompletedRidesData>({ count: 0, rides: [] })
  const [milesSaved, setMilesSaved] = useState<number | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const api = useApi()
  const { carpools } = useCarpools()
  const { user } = useUser()

  // Function to fetch and process data
  const fetchAndProcessData = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setIsRefreshing(true)
      }
      
      if (user?.id) {
        // Fetch completed rides
        console.log('🔍 Fetching completed rides for user:', user.id)
        const completedRidesData = await api.getCompletedRides(100)
        console.log('📊 Raw completed rides data:', completedRidesData)
        
        // Handle different API response formats
        let processedData: CompletedRidesData
        
        // Check if it's an array (backend format) or object with rides property
        if (Array.isArray(completedRidesData)) {
          // Backend returns array directly
          const backendRides = completedRidesData as any[]
          console.log('🔄 Converting backend array format to frontend format')
          
          const convertedRides: CompletedRide[] = backendRides.map(ride => {
            // Extract date from start_time
            const startDate = new Date(ride.start_time)
            const date = startDate.toISOString().split('T')[0]
            
            // Count participants - handle both array and number formats
            let participantCount = 0
            if (Array.isArray(ride.participants)) {
              participantCount = ride.participants.length
            } else if (typeof ride.participants === 'number') {
              participantCount = ride.participants
            } else if (ride.participants && typeof ride.participants === 'object') {
              // If it's an object with participants array
              participantCount = ride.participants.participants ? ride.participants.participants.length : 0
            }
            
            // Ensure at least 1 participant (the driver)
            participantCount = Math.max(1, participantCount)
            
            // Calculate distance - use miles_saved if available, otherwise estimate
            let distance = ride.miles_saved || 0
            
            // If no miles_saved, try to calculate from participant coordinates
            if (distance === 0 && ride.participants) {
              let participants = ride.participants
              if (Array.isArray(participants) && participants.length > 0) {
                const participant = participants[0]
                if (participant.home_latitude && participant.home_latitude.Valid && 
                    participant.home_longitude && participant.home_longitude.Valid) {
                  // Calculate distance from home to a default destination
                  distance = api.calculateDistance(
                    participant.home_latitude.Float64,
                    participant.home_longitude.Float64,
                    37.547236, // Default destination lat
                    -121.942220 // Default destination lng
                  )
                }
              }
            }
            
            // If still no distance, use a reasonable default based on typical carpool distances
            if (distance === 0) {
              distance = 5.0 // Default 5 miles for completed rides
            }
            
            const convertedRide = {
              id: ride.id,
              date: date,
              distance: Math.round(distance * 10) / 10, // Round to 1 decimal
              participants: participantCount
            }
            
            console.log('🔄 Converted ride:', {
              original: { id: ride.id, start_time: ride.start_time, miles_saved: ride.miles_saved, participants: ride.participants?.length },
              converted: convertedRide
            })
            
            return convertedRide
          })
          
          processedData = {
            count: convertedRides.length,
            rides: convertedRides
          }
        } else if (completedRidesData.rides && completedRidesData.rides.length > 0) {
          // Frontend expected format
          const firstRide = completedRidesData.rides[0] as any
          if (firstRide.distance !== undefined && firstRide.participants !== undefined) {
            processedData = completedRidesData as CompletedRidesData
          } else {
            // Convert legacy format to new format
            const legacyRides = completedRidesData.rides as LegacyCompletedRide[]
            const convertedRides: CompletedRide[] = legacyRides.map(ride => ({
              id: ride.id,
              date: ride.date,
              distance: 10, // Default distance for legacy data
              participants: ride.passengers
            }))
            processedData = {
              count: convertedRides.length,
              rides: convertedRides
            }
          }
        } else {
          processedData = { count: 0, rides: [] }
        }
        
        console.log('🔄 Processed completed rides data:', processedData)
        setCompletedRides(processedData)
        
        // Calculate miles saved based on completed rides data
        let calculatedMilesSaved = 0
        if (processedData.rides.length > 0) {
          // Calculate miles saved from completed rides
          // Each ride with multiple participants saves miles by reducing cars on the road
          calculatedMilesSaved = processedData.rides.reduce((total, ride) => {
            const rideDistance = ride.distance || 0
            const participants = ride.participants || 1
            
            // For completed rides, assume at least 2 participants (driver + passenger)
            // This ensures we calculate meaningful miles saved for carpooling
            const effectiveParticipants = Math.max(2, participants)
            
            // Each additional participant beyond 1 represents a car saved
            const carsSaved = Math.max(1, effectiveParticipants - 1) // At least 1 car saved for carpooling
            const milesSavedForRide = carsSaved * rideDistance
            
            console.log(`📊 Ride ${ride.id}: ${effectiveParticipants} participants, ${rideDistance} miles, ${carsSaved} cars saved, ${milesSavedForRide} miles saved`)
            
            return total + milesSavedForRide
          }, 0)
          console.log('📊 Total miles saved from completed rides:', calculatedMilesSaved)
        } else {
          // Fallback to API calculation if no completed rides data
          calculatedMilesSaved = await api.calculateMilesSaved(user.id)
          console.log('📊 Fallback miles saved from API:', calculatedMilesSaved)
        }
        setMilesSaved(calculatedMilesSaved)

        // Prepare chart data for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split('T')[0]
        }).reverse()

        const weeklyChartData = last7Days.map(date => {
          const ridesForDate = processedData.rides.filter((ride: CompletedRide) => 
            ride.date === date
          )
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            rides: ridesForDate.length,
            distance: ridesForDate.reduce((sum: number, ride: CompletedRide) => sum + ride.distance, 0),
            participants: ridesForDate.reduce((sum: number, ride: CompletedRide) => sum + ride.participants, 0)
          }
        })
        setWeeklyData(weeklyChartData)

                  // Prepare data for average distance per week
          const weeklyDistanceData = last7Days.map(date => {
            const ridesForDate = processedData.rides.filter((ride: CompletedRide) => 
              ride.date === date
            )
            const totalDistanceForDate = ridesForDate.reduce((sum: number, ride: CompletedRide) => sum + ride.distance, 0)
            const avgDistanceForDate = ridesForDate.length > 0 ? totalDistanceForDate / ridesForDate.length : 0
            
            return {
              date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              avgDistance: Math.round(avgDistanceForDate * 10) / 10, // Round to 1 decimal place
              rides: ridesForDate.length
            }
          })
          setChartData(weeklyDistanceData)
        
        // Update last updated timestamp
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchAndProcessData()
  }, [user?.id, api])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      fetchAndProcessData(true) // Pass true to indicate auto-refresh
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user?.id, api])

  if (loading) {
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

  // Calculate total distance
  const totalDistance = completedRides.rides.reduce((sum, ride) => sum + ride.distance, 0)

  // Calculate average participants per ride dynamically
  // This updates automatically as new completed rides are added to the data
  const totalParticipants = completedRides.rides.reduce((sum, ride) => sum + ride.participants, 0)
  const avgParticipants = completedRides.rides.length > 0 
    ? (totalParticipants / completedRides.rides.length).toFixed(1)
    : '0.0'

  // Calculate average distance per ride dynamically
  const avgDistance = completedRides.rides.length > 0 
    ? (totalDistance / completedRides.rides.length).toFixed(1)
    : '0.0'

  // Calculate total participants across all rides
  const totalRidesWithParticipants = completedRides.rides.length

  // Calculate most common ride distance range
  const distanceRanges = completedRides.rides.reduce((acc, ride) => {
    const range = ride.distance <= 10 ? '0-10' : 
                  ride.distance <= 20 ? '11-20' : 
                  ride.distance <= 30 ? '21-30' : '30+'
    acc[range] = (acc[range] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostCommonDistanceRange = Object.keys(distanceRanges).length > 0 
    ? Object.entries(distanceRanges).reduce((a, b) => distanceRanges[a[0]] > distanceRanges[b[0]] ? a : b)[0]
    : 'N/A'

  const metrics = [
    { 
      title: 'Total Carpools', 
      value: myCarpoolsCount, 
      icon: Car, 
      color: 'bg-blue-50', 
      textColor: 'text-blue-700', 
      iconColor: 'text-blue-500',
      description: 'Active carpools'
    },
    { 
      title: 'Completed Rides', 
      value: completedRides.count, 
      icon: Calendar, 
      color: 'bg-purple-50', 
      textColor: 'text-purple-700', 
      iconColor: 'text-purple-500',
      description: 'Total rides finished'
    },
    { 
      title: 'Miles Saved', 
      value: milesSaved !== null ? Math.round(milesSaved) : 'N/A', 
      icon: Route, 
      color: 'bg-[#E8EDDF]', 
      textColor: 'text-[#2B5335]', 
      iconColor: 'text-[#2B5335]',
      description: 'Environmental impact'
    },
    { 
      title: 'Avg. Participants', 
      value: avgParticipants, 
      icon: Users, 
      color: 'bg-orange-50', 
      textColor: 'text-orange-700', 
      iconColor: 'text-orange-500',
      description: 'Per completed ride'
    },
    { 
      title: 'Trees Equivalent', 
      value: treesSaved, 
      icon: Trees, 
      color: 'bg-emerald-50', 
      textColor: 'text-emerald-700', 
      iconColor: 'text-emerald-500',
      description: 'CO2 offset'
    }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Track your carpooling impact and progress</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock size={14} className="sm:w-4 sm:h-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={() => fetchAndProcessData(true)}
            disabled={isRefreshing}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors text-xs sm:text-sm ${
              isRefreshing 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <RefreshCw size={12} className={`sm:w-3.5 sm:h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {isRefreshing && (
            <div className="flex items-center space-x-1 text-blue-600 text-xs sm:text-sm">
              <span>Updating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div 
              key={index}
              className={`${metric.color} rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={`${metric.iconColor} rounded-full p-1.5 sm:p-2 bg-white shadow-sm`}>
                  <Icon size={16} className="sm:w-5 sm:h-5" />
                </div>
                <TrendingUp size={12} className="text-gray-400 sm:w-4 sm:h-4" />
              </div>
              <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                {metric.title}
              </h3>
              <p className={`${metric.textColor} text-lg sm:text-2xl font-bold mb-1`}>
                {metric.value}
              </p>
              <p className="text-gray-500 text-xs">
                {metric.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Weekly Activity</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={10}
                  className="sm:text-xs"
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  className="sm:text-xs"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rides" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
            Number of completed rides per day
          </p>
        </div>

        {/* Average Distance per Week Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Average Distance per Day</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={10}
                  className="sm:text-xs"
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={10}
                  className="sm:text-xs"
                  label={{ value: 'Miles', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '10px' } }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} miles`, 
                    name === 'avgDistance' ? 'Distance Traveled' : 'Average Distance'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar 
                  dataKey="avgDistance" 
                  fill="#10b981" 
                  radius={[3, 3, 0, 0]}
                  name="Average Distance"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Average Distance (miles)</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
            Shows the average distance of rides completed each day
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs sm:text-sm font-medium">Total Distance</p>
              <p className="text-blue-900 text-lg sm:text-2xl font-bold">{totalDistance.toFixed(1)} miles</p>
            </div>
            <Route className="text-blue-500 sm:w-6 sm:h-6" size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-xs sm:text-sm font-medium">Leaves Saved</p>
              <p className="text-green-900 text-lg sm:text-2xl font-bold">{leavesSaved.toLocaleString()}</p>
            </div>
            <Leaf className="text-green-500 sm:w-6 sm:h-6" size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-xs sm:text-sm font-medium">Avg. Ride Distance</p>
              <p className="text-purple-900 text-lg sm:text-2xl font-bold">
                {avgDistance} miles
              </p>
            </div>
            <TrendingUp className="text-purple-500 sm:w-6 sm:h-6" size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 sm:p-6 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-xs sm:text-sm font-medium">Most Common Distance</p>
              <p className="text-indigo-900 text-lg sm:text-2xl font-bold">
                {mostCommonDistanceRange} miles
              </p>
            </div>
            <Users className="text-indigo-500 sm:w-6 sm:h-6" size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}

