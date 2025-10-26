'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMatchingService } from '@/services/matching'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, MessageSquare, Star, Settings, Brain, Zap } from 'lucide-react'
import { PotentialMatches } from '@/components/matching/PotentialMatches'
import { MatchRequests } from '@/components/matching/MatchRequests'
import { AcceptedRequests } from '@/components/matching/AcceptedRequests'
import { MatchingStats } from '@/components/matching/MatchingStats'
import { MatchingPreferences as MatchingPreferencesComponent } from '@/components/matching/MatchingPreferences'
import { AdvancedMatching } from '@/components/matching/AdvancedMatching'
import { RealTimeUpdates } from '@/components/matching/RealTimeUpdates'

export default function MatchingPage() {
  const matching = useMatchingService()
  const [activeTab, setActiveTab] = useState('matches')

  const [stats, setStats] = useState<any | null>(null)
  const [headerLoaded, setHeaderLoaded] = useState(false)
  const [headerCounts, setHeaderCounts] = useState({ potential: 0, incoming: 0, formed: 0, savings: 0 })
  const [requestsRefreshTrigger, setRequestsRefreshTrigger] = useState(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      // Proactively trigger match generation before initial fetch
      try { await matching.findMatches({ filters: {} }) } catch (_) {}
      const [reqs, st] = await Promise.all([
        matching.getRequests(),
        matching.getStats()
      ])
      if (!mounted) return
      setHeaderCounts({
        potential: 0, // Will be updated by PotentialMatches component
        incoming: reqs.incoming.length,
        formed: st.total_carpools_formed ?? 0,
        savings: st.total_savings ?? 0
      })
      setStats(st)
      setHeaderLoaded(true)
    })()
    return () => { mounted = false }
  }, [])

  const header = useMemo(() => (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Matching</h1>
      <p className="text-muted-foreground">Find, review, and manage your carpool matches</p>
    </div>
  ), [])

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      {header}

      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile title="Potential" value={headerCounts.potential} icon={<Users className="w-4 h-4" />} />
            <StatTile title="Incoming" value={headerCounts.incoming} icon={<MessageSquare className="w-4 h-4" />} />
            <StatTile title="Formed" value={headerCounts.formed} icon={<Star className="w-4 h-4" />} />
            <StatTile title="Savings" value={`$${headerCounts.savings}`} icon={<Star className="w-4 h-4" />} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="matches" className="flex items-center gap-2"><Users className="w-4 h-4" />Potential</TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Requests</TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2"><Star className="w-4 h-4" />Accepted</TabsTrigger>
          <TabsTrigger value="algorithm" className="flex items-center gap-2"><Brain className="w-4 h-4" />Algorithm</TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2"><Zap className="w-4 h-4" />Real-time</TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2"><Star className="w-4 h-4" />Statistics</TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2"><Settings className="w-4 h-4" />Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <PotentialMatches 
            onStatsUpdate={async () => {
              const st = await matching.getStats(); setStats(st)
            }}
            onNavigateToPreferences={() => setActiveTab('preferences')}
            onNavigateToRequests={() => setActiveTab('requests')}
            onRequestSent={() => setRequestsRefreshTrigger(prev => prev + 1)}
            onMatchesLoaded={(count) => setHeaderCounts(prev => ({ ...prev, potential: count }))}
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <MatchRequests 
            onStatsUpdate={async () => {
              const st = await matching.getStats(); setStats(st)
            }}
            refreshTrigger={requestsRefreshTrigger}
          />
        </TabsContent>

        <TabsContent value="algorithm" className="space-y-6">
          <AdvancedMatching onMatchesGenerated={async (count) => {
            // Refresh header counts when new matches are generated
            const [matches, reqs, st] = await Promise.all([
              matching.getPotentialMatches(),
              matching.getRequests(),
              matching.getStats()
            ])
            setHeaderCounts({
              potential: matches.pending_matches?.length ?? 0,
              incoming: reqs.incoming.length,
              formed: st.total_carpools_formed ?? 0,
              savings: st.total_savings ?? 0
            })
          }} />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeUpdates 
            onNewMatches={async (count) => {
              // Update header counts when new matches are found
              const [matches, reqs, st] = await Promise.all([
                matching.getPotentialMatches(),
                matching.getRequests(),
                matching.getStats()
              ])
              setHeaderCounts({
                potential: matches.pending_matches?.length ?? 0,
                incoming: reqs.incoming.length,
                formed: st.total_carpools_formed ?? 0,
                savings: st.total_savings ?? 0
              })
            }}
            onNewRequests={async (count) => {
              // Update header counts when new requests are found
              const [matches, reqs, st] = await Promise.all([
                matching.getPotentialMatches(),
                matching.getRequests(),
                matching.getStats()
              ])
              setHeaderCounts({
                potential: matches.pending_matches?.length ?? 0,
                incoming: reqs.incoming.length,
                formed: st.total_carpools_formed ?? 0,
                savings: st.total_savings ?? 0
              })
            }}
            onStatsUpdate={async () => {
              const st = await matching.getStats()
              setStats(st)
            }}
          />
        </TabsContent>

        <TabsContent value="accepted" className="space-y-6">
          <AcceptedRequests 
            onStatsUpdate={async () => {
              const st = await matching.getStats(); setStats(st)
            }}
            refreshTrigger={requestsRefreshTrigger}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <MatchingStats />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <MatchingPreferencesComponent onSaved={async () => {
            setActiveTab('matches')
            // Refresh counts after save
            const [matches, reqs, st] = await Promise.all([
              matching.getPotentialMatches(),
              matching.getRequests(),
              matching.getStats()
            ])
            setHeaderCounts({
              potential: matches.pending_matches?.length ?? 0,
              incoming: reqs.incoming.length,
              formed: st.total_carpools_formed ?? 0,
              savings: st.total_savings ?? 0
            })
          }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatTile({ title, value, icon }: { title: string; value: any; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
} 