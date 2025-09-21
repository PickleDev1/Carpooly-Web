'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '../ui/progress'
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  MapPin,
  Users,
  Star,
  RefreshCw
} from 'lucide-react'
import { useMatchingService, type MatchFilters } from '@/services/matching'

interface AdvancedMatchingProps {
  onMatchesGenerated?: (count: number) => void
}

interface MatchingAlgorithm {
  id: string
  name: string
  description: string
  weight: number
  icon: React.ReactNode
  color: string
}

const ALGORITHMS: MatchingAlgorithm[] = [
  {
    id: 'location',
    name: 'Location Compatibility',
    description: 'Distance and route overlap analysis',
    weight: 25,
    icon: <MapPin className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  {
    id: 'schedule',
    name: 'Schedule Compatibility',
    description: 'Work hours and frequency matching',
    weight: 25,
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  {
    id: 'demographics',
    name: 'Demographic Preferences',
    description: 'Age, gender, and background matching',
    weight: 20,
    icon: <Users className="w-4 h-4" />,
    color: 'bg-purple-500'
  },
  {
    id: 'route',
    name: 'Route Overlap',
    description: 'Common travel paths and destinations',
    weight: 15,
    icon: <Target className="w-4 h-4" />,
    color: 'bg-orange-500'
  },
  {
    id: 'group_size',
    name: 'Group Size Preferences',
    description: 'Preferred carpool group size',
    weight: 10,
    icon: <Users className="w-4 h-4" />,
    color: 'bg-pink-500'
  },
  {
    id: 'role',
    name: 'Role Compatibility',
    description: 'Driver vs passenger preferences',
    weight: 5,
    icon: <Star className="w-4 h-4" />,
    color: 'bg-indigo-500'
  }
]

export function AdvancedMatching({ onMatchesGenerated }: AdvancedMatchingProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [lastGeneration, setLastGeneration] = useState<Date | null>(null)
  const [matchesFound, setMatchesFound] = useState(0)
  const [generationTime, setGenerationTime] = useState(0)
  const [algorithmWeights, setAlgorithmWeights] = useState<Record<string, number>>(
    ALGORITHMS.reduce((acc, algo) => ({ ...acc, [algo.id]: algo.weight }), {})
  )

  const matchingService = useMatchingService()

  const generateMatches = useCallback(async (filters: MatchFilters = {}) => {
    setIsGenerating(true)
    setGenerationProgress(0)
    const startTime = Date.now()

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await matchingService.findMatches({
        max_results: 20,
        force_refresh: true,
        filters
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      const endTime = Date.now()
      const duration = endTime - startTime

      setMatchesFound(result.matches_found || 0)
      setGenerationTime(duration)
      setLastGeneration(new Date())

      onMatchesGenerated?.(result.matches_found || 0)

      // Reset progress after a delay
      setTimeout(() => {
        setGenerationProgress(0)
      }, 2000)

    } catch (error) {
      console.error('Failed to generate matches:', error)
      setGenerationProgress(0)
    } finally {
      setIsGenerating(false)
    }
  }, [matchingService, onMatchesGenerated])

  const updateAlgorithmWeight = useCallback((algorithmId: string, weight: number) => {
    setAlgorithmWeights(prev => ({
      ...prev,
      [algorithmId]: Math.max(0, Math.min(100, weight))
    }))
  }, [])

  const resetWeights = useCallback(() => {
    setAlgorithmWeights(
      ALGORITHMS.reduce((acc, algo) => ({ ...acc, [algo.id]: algo.weight }), {})
    )
  }, [])

  const totalWeight = useMemo(() => {
    return Object.values(algorithmWeights).reduce((sum, weight) => sum + weight, 0)
  }, [algorithmWeights])

  const normalizedWeights = useMemo(() => {
    const total = totalWeight || 100
    return Object.entries(algorithmWeights).reduce((acc, [id, weight]) => ({
      ...acc,
      [id]: Math.round((weight / total) * 100)
    }), {} as Record<string, number>)
  }, [algorithmWeights, totalWeight])

  return (
    <div className="space-y-6">
      {/* Algorithm Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Matching Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALGORITHMS.map(algorithm => (
              <div key={algorithm.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${algorithm.color} text-white`}>
                    {algorithm.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{algorithm.name}</h4>
                    <p className="text-xs text-muted-foreground">{algorithm.description}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Weight</span>
                    <span className="font-medium">{normalizedWeights[algorithm.id] || 0}%</span>
                  </div>
                  <Progress 
                    value={normalizedWeights[algorithm.id] || 0} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Generate New Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Use our advanced algorithm to find the best carpool matches
              </p>
              {lastGeneration && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last generated: {lastGeneration.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button
              onClick={() => generateMatches()}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Matches'}
            </Button>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating matches...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          {matchesFound > 0 && !isGenerating && (
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-green-900">
                  Found {matchesFound} new matches!
                </p>
                <p className="text-sm text-green-700">
                  Generated in {generationTime}ms
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Algorithm Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{matchesFound}</div>
              <div className="text-sm text-blue-700">Matches Found</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{generationTime}ms</div>
              <div className="text-sm text-green-700">Generation Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {totalWeight > 0 ? Math.round(totalWeight) : 100}%
              </div>
              <div className="text-sm text-purple-700">Total Weight</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
