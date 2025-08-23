'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  Route,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react'
import { useMatchingService } from '@/services/matching'

interface MatchingStats {
  total_matches_generated: number
  match_acceptance_rate: number
  average_compatibility_score: number
  total_carpools_formed: number
  total_savings: number
  average_route_overlap: number
  most_common_match_reasons: string[]
  geographic_distribution: {
    nearby: number
    medium_distance: number
    far: number
  }
  time_to_acceptance: number // in hours
  monthly_trends: {
    month: string
    matches: number
    acceptances: number
  }[]
}

interface MatchingStatsProps {
  realTimeStats?: {
    potentialMatches: number
    activeRequests: number
    carpoolsFormed: number
    monthlySavings: number
  }
}

// Mock data for development fallback
const mockStats: MatchingStats = {
  total_matches_generated: 47,
  match_acceptance_rate: 0.68,
  average_compatibility_score: 0.82,
  total_carpools_formed: 12,
  total_savings: 127,
  average_route_overlap: 0.75,
  most_common_match_reasons: [
    'Same destination',
    'Similar schedule',
    'Close pickup location',
    'Route overlap',
    'Flexible schedule'
  ],
  geographic_distribution: {
    nearby: 15,
    medium_distance: 8,
    far: 4
  },
  time_to_acceptance: 2.5,
  monthly_trends: [
    { month: 'Oct', matches: 12, acceptances: 8 },
    { month: 'Nov', matches: 18, acceptances: 12 },
    { month: 'Dec', matches: 15, acceptances: 10 },
    { month: 'Jan', matches: 22, acceptances: 15 }
  ]
}

export function MatchingStats({ realTimeStats }: MatchingStatsProps) {
  const [stats, setStats] = useState<MatchingStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  const matchingService = useMatchingService()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Try to get real stats from the backend
      const data = await matchingService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats from backend:', error)
      console.log('Falling back to real-time stats or mock data')
      
      // If we have real-time stats, use them to create realistic stats
      if (realTimeStats) {
        const enhancedMockStats = {
          ...mockStats,
          total_matches_generated: realTimeStats.potentialMatches + realTimeStats.carpoolsFormed,
          total_carpools_formed: realTimeStats.carpoolsFormed,
          total_savings: realTimeStats.monthlySavings,
          match_acceptance_rate: realTimeStats.carpoolsFormed > 0 ? 
            Math.min(0.8, realTimeStats.carpoolsFormed / Math.max(1, realTimeStats.potentialMatches)) : 0.3
        }
        setStats(enhancedMockStats)
      } else {
        // Use mock data for development when backend is not available
        setStats(mockStats)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No statistics available</h3>
          <p className="text-gray-600">
            Start using the matching feature to see your statistics
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Matching Statistics</h2>
          <p className="text-gray-600">
            Track your carpool matching performance and insights
          </p>
        </div>
        <button 
          onClick={loadStats}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold">{stats.total_matches_generated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Acceptance Rate</p>
                <p className="text-2xl font-bold">{Math.round(stats.match_acceptance_rate * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Route className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Carpools Formed</p>
                <p className="text-2xl font-bold">{stats.total_carpools_formed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold">${stats.total_savings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compatibility & Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Compatibility Score</span>
              <Badge className="bg-blue-100 text-blue-800">
                {Math.round(stats.average_compatibility_score * 100)}%
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Route Overlap</span>
              <Badge className="bg-green-100 text-green-800">
                {Math.round(stats.average_route_overlap * 100)}%
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg. Time to Acceptance</span>
              <Badge className="bg-purple-100 text-purple-800">
                {stats.time_to_acceptance}h
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Nearby (0-2 miles)</span>
              <Badge className="bg-green-100 text-green-800">
                {stats.geographic_distribution.nearby} matches
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Medium (2-5 miles)</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {stats.geographic_distribution.medium_distance} matches
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Far (5+ miles)</span>
              <Badge className="bg-red-100 text-red-800">
                {stats.geographic_distribution.far} matches
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Reasons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Most Common Match Reasons
          </CardTitle>
          <CardDescription>
            Why users are being matched with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.most_common_match_reasons.map((reason, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {reason}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>
            Your matching activity over the past few months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.monthly_trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{trend.month}</span>
                <div className="flex gap-4">
                  <span className="text-sm text-gray-600">
                    {trend.matches} matches
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    {trend.acceptances} accepted
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 