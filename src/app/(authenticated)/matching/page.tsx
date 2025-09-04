'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  MessageSquare, 
  Settings,
  RefreshCw,
  UserPlus,
  Route,
  DollarSign,
  Calendar
} from 'lucide-react'
import { MatchingPreferences } from '@/components/matching/MatchingPreferences'
import { PotentialMatches } from '@/components/matching/PotentialMatches'
import { MatchRequests } from '@/components/matching/MatchRequests'
import { MatchingStats } from '@/components/matching/MatchingStats'
import { useMatchingService } from '@/services/matching'

export default function MatchingPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('matches')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    potentialMatches: 0,
    activeRequests: 0,
    carpoolsFormed: 0,
    monthlySavings: 0
  })

  const matchingService = useMatchingService()

  const loadStats = useCallback(async () => {
    try {
      const [potentialMatches, requests] = await Promise.all([
        matchingService.getPotentialMatches(),
        matchingService.getRequests()
      ])

      setStats({
        potentialMatches: potentialMatches.pendingMatches.length,
        activeRequests: requests.incoming.filter(r => r.status === 'pending').length,
        carpoolsFormed: potentialMatches.acceptedMatches.length,
        monthlySavings: potentialMatches.acceptedMatches.reduce((sum, match) => sum + match.estimatedSavingsPerMonth, 0)
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
      // Use fallback stats for development
      setStats({
        potentialMatches: 12,
        activeRequests: 3,
        carpoolsFormed: 8,
        monthlySavings: 127
      })
    }
  }, [matchingService])

  // Load initial stats
  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleRefreshMatches = async () => {
    setIsLoading(true)
    try {
      const result = await matchingService.findMatches({
        forceRefresh: true,
        limit: 10
      })
      console.log('Matches found:', result.matchesFound, result.message)
      await loadStats() // Refresh stats after finding new matches
    } catch (error) {
      console.error('Failed to refresh matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Carpool Matching</h1>
            <p className="text-gray-600 mt-2">
              Find your perfect carpool buddies based on location, schedule, and preferences
            </p>
          </div>
          <Button 
            onClick={handleRefreshMatches} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Finding Matches...' : 'Find Carpool Partners'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Potential Matches</p>
                  <p className="text-2xl font-bold">{stats.potentialMatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Active Requests</p>
                  <p className="text-2xl font-bold">{stats.activeRequests}</p>
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
                  <p className="text-2xl font-bold">{stats.carpoolsFormed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Monthly Savings</p>
                  <p className="text-2xl font-bold">${stats.monthlySavings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Potential Matches
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <PotentialMatches onStatsUpdate={loadStats} onTabChange={setActiveTab} />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <MatchRequests onStatsUpdate={loadStats} onTabChange={setActiveTab} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <MatchingStats realTimeStats={stats} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <MatchingPreferences />
        </TabsContent>
      </Tabs>
    </div>
  )
} 