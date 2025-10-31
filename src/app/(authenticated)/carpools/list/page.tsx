'use client'

import { useState, useEffect } from 'react'
import { CarpoolList } from '@/components/CarpoolList'
import { useApi } from '@/services/api'
import { useMatchingService } from '@/services/matching'
import { calculateNextRide, formatNextRide, getTimeUntilNextRide } from '@/utils/nextRideCalculator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

export default function ListCarpoolsPage() {
  const api = useApi()
  const matching = useMatchingService()
  const [nextRideInfo, setNextRideInfo] = useState<{
    nextRide: string;
    timeUntil: string;
    hasSchedule: boolean;
  } | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await api.getCurrentUser()
        console.log('User data:', userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [api])

  // Fetch user preferences and calculate next ride
  useEffect(() => {
    const fetchNextRide = async () => {
      try {
        const preferences = await matching.getPreferences()
        const nextRide = calculateNextRide(preferences.arrival_time, preferences.commute_days)
        
        if (nextRide) {
          setNextRideInfo({
            nextRide: formatNextRide(nextRide),
            timeUntil: getTimeUntilNextRide(nextRide),
            hasSchedule: true
          })
        } else {
          setNextRideInfo({
            nextRide: 'No schedule set',
            timeUntil: 'Set your preferences',
            hasSchedule: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch preferences for next ride:', error)
        setNextRideInfo({
          nextRide: 'No schedule set',
          timeUntil: 'Set your preferences',
          hasSchedule: false
        })
      }
    }

    fetchNextRide()
  }, [matching])

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">My Carpools</h1>
      
      {/* Next Ride Card */}
      <Card className="mb-6 mx-2 sm:mx-0 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white shadow-sm">
        <CardHeader className="px-3 sm:px-6 pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2.5 font-semibold text-gray-800">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            Next Ride
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {nextRideInfo ? nextRideInfo.nextRide : 'Loading...'}
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-full border border-green-100">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{nextRideInfo ? nextRideInfo.timeUntil : 'Calculating...'}</span>
                </div>
              </div>
            </div>
            {nextRideInfo && !nextRideInfo.hasSchedule && (
              <Link 
                href="/matching"
                className="self-start text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors whitespace-nowrap flex items-center gap-1"
              >
                Set Schedule
                <span className="text-green-500">→</span>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
      
      <CarpoolList />
    </div>
  )
} 