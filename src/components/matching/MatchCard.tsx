'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  MapPin, 
  Clock, 
  Star, 
  MessageSquare,
  Heart,
  X,
  Info,
  Route,
  Users
} from 'lucide-react'
import { PotentialMatch } from '@/services/matching'

interface MatchCardProps {
  match: PotentialMatch
  onAccept: (matchId: string) => void
  onReject: (matchId: string) => void
  onViewDetails: (matchId: string) => void
}

export function MatchCard({ match, onAccept, onReject, onViewDetails }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getCompatibilityText = (score: number) => {
    if (score >= 0.8) return 'Excellent'
    if (score >= 0.6) return 'Good'
    if (score >= 0.4) return 'Fair'
    return 'Poor'
  }

  return (
    <Card className="w-full max-w-md mx-auto hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user2.id}`} />
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{match.user2.displayName}</CardTitle>
              <p className="text-sm text-gray-600">{match.user2.preferences.userDemographics.occupation}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getCompatibilityColor(match.compatibilityScore)}>
              {Math.round(match.compatibilityScore * 100)}%
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {getCompatibilityText(match.compatibilityScore)} Match
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Compatibility Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{Math.round(match.routeOverlapPercentage * 100)}% route overlap</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-green-500" />
            <span>{match.user2.schedule.departureTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Route className="w-4 h-4 text-purple-500" />
            <span>{match.totalDistanceMiles.toFixed(1)} miles</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-orange-500" />
            <span>{match.user2.schedule.frequency}</span>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-800">
              ${match.estimatedSavingsPerMonth}/month savings
            </span>
          </div>
        </div>

        {/* Match Reasons */}
        {match.matchReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Why you match:</h4>
            <div className="space-y-1">
              {match.matchReasons.slice(0, 3).map((reason: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  {reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Compatibility Breakdown */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium">Compatibility Breakdown:</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Location</span>
                <span className={getCompatibilityColor(match.matchScore.locationScore)}>
                  {Math.round(match.matchScore.locationScore * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Schedule</span>
                <span className={getCompatibilityColor(match.matchScore.scheduleScore)}>
                  {Math.round(match.matchScore.scheduleScore * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Demographics</span>
                <span className={getCompatibilityColor(match.matchScore.demographicScore)}>
                  {Math.round(match.matchScore.demographicScore * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Route</span>
                <span className={getCompatibilityColor(match.matchScore.routeScore)}>
                  {Math.round(match.matchScore.routeScore * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1"
          >
            <Info className="w-4 h-4 mr-2" />
            {isExpanded ? 'Less' : 'More'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(match.id)}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Details
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(match.id)}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Pass
          </Button>
          <Button
            size="sm"
            onClick={() => onAccept(match.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Request Carpool
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 