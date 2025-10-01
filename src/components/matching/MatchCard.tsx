'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PotentialMatch } from '@/types/matching'

interface Props {
  match: PotentialMatch
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onViewDetails: (id: string) => void
}

export function MatchCard({ match, onAccept, onReject, onViewDetails }: Props) {
  if (!match) return null
  return (
    <Card className="w-full max-w-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{typeof match.user2.display_name === 'string' ? match.user2.display_name : match.user2.display_name?.String || match.user2.name}</span>
          <span className="text-sm px-2 py-1 rounded bg-muted">{Math.round(match.compatibility_score * 100)}%</span>
        </CardTitle>
        <CardDescription>{match.match_reasons?.join(' • ')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-muted-foreground">{match.user2.name}</div>
          <div className="text-right">{match.schedule?.departure_time || 'Not specified'}</div>
        </div>
        <div className="mt-4 flex gap-3 justify-center">
          <Button onClick={() => onAccept(match.id)}>Accept</Button>
          <Button variant="outline" onClick={() => onReject(match.id)}>Reject</Button>
          <Button variant="ghost" onClick={() => onViewDetails(match.id)}>Details</Button>
        </div>
      </CardContent>
    </Card>
  )
} 