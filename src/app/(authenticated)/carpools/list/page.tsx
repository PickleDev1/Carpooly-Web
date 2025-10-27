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
      <Card className="mb-6 mx-2 sm:mx-0">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next Ride
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {nextRideInfo ? nextRideInfo.nextRide : 'Loading...'}
              </div>
              <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {nextRideInfo ? nextRideInfo.timeUntil : 'Calculating...'}
              </div>
            </div>
            {nextRideInfo && !nextRideInfo.hasSchedule && (
              <Link 
                href="/matching"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                Set Schedule
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
      
      <CarpoolList />
    </div>
  )
} 