'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, addMonths, addDays, isSameDay, startOfWeek, endOfWeek, getDay, nextDay, startOfDay, isBefore, isAfter } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useApi } from '@/services/api'
import { Schedule } from '@/types/api'
import { CarpoolDayModal } from '@/components/CarpoolDayModal'

export default function CarpoolCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [recurringDates, setRecurringDates] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const params = useParams()
  const api = useApi()

  useEffect(() => {
    const fetchSchedules = async () => {
      if (params.id) {
        console.log('📅 Calendar: ==========================================')
        console.log('📅 Calendar: Starting schedule fetch for carpool:', params.id)
        try {
          const fetchedSchedules = await api.getCarpoolSchedules(params.id as string)
          console.log('📅 Calendar: Raw API response:', JSON.stringify(fetchedSchedules, null, 2))
          console.log('📅 Calendar: Number of schedules:', fetchedSchedules?.length || 0)
          
          if (fetchedSchedules && Array.isArray(fetchedSchedules) && fetchedSchedules.length > 0) {
            console.log('📅 Calendar: ✅ Schedules found! Processing...')
            fetchedSchedules.forEach((schedule, idx) => {
              console.log(`📅 Calendar: Schedule ${idx + 1}:`, {
                type: schedule.schedule_type,
                day_of_week: schedule.day_of_week,
                start_date: schedule.start_date,
                end_date: schedule.end_date,
                start_time: schedule.start_time
              })
            })
            setSchedules(fetchedSchedules)
            calculateRecurringDatesFromAllSchedules(fetchedSchedules)
          } else {
            console.warn('📅 Calendar: ⚠️ No schedules found for carpool:', params.id)
            console.warn('📅 Calendar: This means the backend did not create schedules when the match was accepted')
            setRecurringDates([])
          }
        } catch (error) {
          console.error('📅 Calendar: ❌ Error fetching schedules:', error)
          setRecurringDates([])
        }
        console.log('📅 Calendar: ==========================================')
      }
    }
    fetchSchedules()
  }, [params.id, api, activeScope])

  const calculateRecurringDatesFromAllSchedules = (allSchedules: Schedule[]) => {
    const allDates: Date[] = []
    const now = new Date()
    const maxDate = startOfDay(addDays(now, 90)) // Show dates up to 90 days ahead, normalized to start of day

    allSchedules.forEach((schedule, index) => {
      if (!schedule.start_date) {
        console.log(`📅 Calendar: Schedule ${index + 1} has no start_date, skipping`)
        return
      }

      // Normalize dates to start of day for consistent comparison
      const startDate = startOfDay(new Date(schedule.start_date))
      
      // Use end_date if provided, otherwise calculate 90 days from start
      const endDate = schedule.end_date 
        ? startOfDay(new Date(schedule.end_date)) 
        : startOfDay(addDays(startDate, 90))

      // Ensure endDate is not before startDate
      if (isBefore(endDate, startDate)) {
        console.log(`📅 Calendar: Schedule ${index + 1} has end_date before start_date, skipping`)
        return
      }

      // Don't go beyond 90 days from now
      const effectiveEndDate = isAfter(endDate, maxDate) ? maxDate : endDate
      
      // Ensure effectiveEndDate is not before startDate
      if (isBefore(effectiveEndDate, startDate)) {
        console.log(`📅 Calendar: Schedule ${index + 1} effective end date is before start date, skipping`)
        return
      }
      
      console.log(`📅 Calendar: Processing schedule ${index + 1}:`, {
        type: schedule.schedule_type,
        day_of_week: schedule.day_of_week,
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        normalized_start: startDate.toISOString(),
        effective_end_date: effectiveEndDate.toISOString()
      })

      if (schedule.schedule_type === 'daily') {
        let currentDate = new Date(startDate)
        while (currentDate <= effectiveEndDate) {
          allDates.push(new Date(currentDate))
          currentDate = startOfDay(addDays(currentDate, 1))
        }
      } else if (schedule.schedule_type === 'weekly') {
        // For weekly schedules, use day_of_week if available
        if (schedule.day_of_week !== undefined && schedule.day_of_week !== null) {
          // day_of_week: 0 = Sunday, 1 = Monday, etc.
          let currentDate = new Date(startDate)
          
          // Find the first occurrence of the target day of week on or after startDate
          const startDayOfWeek = getDay(currentDate)
          const targetDay = schedule.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6
          
          if (startDayOfWeek === targetDay) {
            // Start date is already on the target day, use it
            // currentDate is already set to startDate (normalized)
          } else {
            // Find next occurrence of the target day
            // nextDay returns the NEXT occurrence, even if date is on that day
            const nextOccurrence = nextDay(currentDate, targetDay)
            currentDate = startOfDay(nextOccurrence)
            
            // If nextDay skipped past effectiveEndDate, this schedule has no valid dates
            if (isAfter(currentDate, effectiveEndDate)) {
              console.log(`📅 Calendar: Schedule ${index + 1} next occurrence is after end date, skipping`)
              return
            }
          }
          
          // Generate all occurrences of this day of week up to endDate
          while (currentDate <= effectiveEndDate) {
            allDates.push(new Date(currentDate))
            const nextWeek = addDays(currentDate, 7)
            currentDate = startOfDay(nextWeek)
          }
        } else {
          // Fallback: if no day_of_week specified, use start date and add 7 days
          let currentDate = new Date(startDate)
          while (currentDate <= effectiveEndDate) {
            allDates.push(new Date(currentDate))
            const nextWeek = addDays(currentDate, 7)
            currentDate = startOfDay(nextWeek)
          }
        }
      } else {
        // one_time - only add if within the effective date range
        if (startDate <= effectiveEndDate) {
          allDates.push(new Date(startDate))
        }
      }
    })

    // Remove duplicates and sort
    const uniqueDates = Array.from(
      new Set(allDates.map(date => date.getTime()))
    )
      .map(time => new Date(time))
      .sort((a, b) => a.getTime() - b.getTime())

    console.log(`📅 Calendar: ✅ Calculated ${uniqueDates.length} unique dates from ${allSchedules.length} schedule(s)`)
    if (uniqueDates.length > 0) {
      console.log('📅 Calendar: First 10 dates:', uniqueDates.slice(0, 10).map(d => format(d, 'yyyy-MM-dd (EEEE)')))
      console.log('📅 Calendar: Last 5 dates:', uniqueDates.slice(-5).map(d => format(d, 'yyyy-MM-dd (EEEE)')))
    } else {
      console.warn('📅 Calendar: ⚠️ No dates calculated! This means no valid dates were found in the schedules.')
    }
    setRecurringDates(uniqueDates)
  }

  const handleEventClick = (date: Date) => {
    console.log('📅 Calendar: Date clicked:', format(date, 'yyyy-MM-dd (EEEE)'))
    console.log('📅 Calendar: This date should have a ride. Opening modal to check...')
    setSelectedDate(date)
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-2 px-3 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-[#2B5335] text-center sm:text-left">
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex space-x-2 sm:space-x-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(prev => addMonths(prev, -1))}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(prev => addMonths(prev, 1))}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[560px] grid grid-cols-7 gap-px bg-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-white p-2 sm:p-4 text-center text-xs sm:text-sm font-semibold text-gray-700">
                  {day}
                </div>
              ))}
              
              {eachDayOfInterval({
                start: startOfWeek(startOfMonth(currentDate)),
                end: endOfWeek(endOfMonth(currentDate))
              }).map((day) => {
                const hasEvent = recurringDates.some(date => isSameDay(date, day))
                
                return (
                  <div
                    key={day.toString()}
                    className={`
                      bg-white p-1 sm:p-4 text-center relative min-h-[60px] sm:min-h-[100px]
                      ${isToday(day) ? 'bg-green-50' : ''}
                      ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}
                    `}
                  >
                    <time
                      dateTime={format(day, 'yyyy-MM-dd')}
                      className={`
                        block w-5 h-5 sm:w-6 sm:h-6 mx-auto rounded-full flex items-center justify-center text-xs sm:text-sm
                        ${isToday(day) ? 'bg-[#2B5335] text-white' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </time>
                    {hasEvent && (
                      <button
                        onClick={() => handleEventClick(day)}
                        className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#2B5335] hover:bg-[#1e3b25] transition-colors duration-200 flex items-center justify-center"
                      >
                        <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedDate && (
        <CarpoolDayModal
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          date={selectedDate}
          carpoolId={params.id as string}
        />
      )}
    </div>
  )
} 