'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, addMonths, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useApi } from '@/services/api'
import { Schedule } from '@/types/api'
import { CarpoolDayModal } from '@/components/CarpoolDayModal'

export default function CarpoolCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [recurringDates, setRecurringDates] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const params = useParams()
  const api = useApi()

  useEffect(() => {
    const fetchSchedule = async () => {
      if (params.id) {
        try {
          const schedules = await api.getCarpoolSchedules(params.id as string)
          if (schedules && schedules.length > 0) {
            setSchedule(schedules[0])  // Take the first (and only) schedule
            calculateRecurringDates(schedules[0])
          }
        } catch (error) {
          console.error('Error fetching schedule:', error)
        }
      }
    }
    fetchSchedule()
  }, [params.id])

  const calculateRecurringDates = (scheduleData: Schedule) => {
    if (!scheduleData.start_date) return

    const dates: Date[] = []
    const startDate = new Date(scheduleData.start_date)
    const endDate = addMonths(new Date(), 2) // 2 months from now

    if (scheduleData.schedule_type === 'daily') {
      let currentDate = startDate
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate = addDays(currentDate, 1)
      }
    } else if (scheduleData.schedule_type === 'weekly') {
      let currentDate = startDate
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate = addDays(currentDate, 7)
      }
    } else {
      // one_time
      dates.push(startDate)
    }

    setRecurringDates(dates)
  }

  const handleEventClick = (date: Date) => {
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
          <div className="grid grid-cols-7 gap-px bg-gray-200">
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