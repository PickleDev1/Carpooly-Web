'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'
import { DayPicker } from 'react-day-picker'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"
import "react-day-picker/dist/style.css"
import { addDays, addMonths, format } from 'date-fns'

interface CarpoolFormProps {
  userId: string
  onSuccess: () => void
}

export function CarpoolForm({ userId, onSuccess }: CarpoolFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const api = useApi()

  // Carpool fields
  const [carpoolName, setCarpoolName] = useState('')
  const [seats, setSeats] = useState('2')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [destinationLat, setDestinationLat] = useState<number | null>(null)
  const [destinationLng, setDestinationLng] = useState<number | null>(null)

  // Schedule fields
  const [scheduleType, setScheduleType] = useState('one_time')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [selectedDays, setSelectedDays] = useState<Date[]>([])
  const [dayOfWeek, setDayOfWeek] = useState<string>('MONDAY')

  const handleDestinationSelect = (location: { address: string; lat: number; lng: number }) => {
    setDestinationAddress(location.address)
    setDestinationLat(location.lat)
    setDestinationLng(location.lng)
  }

  const createRidesForSchedule = async (carpoolId: string, scheduleData: any) => {
    console.log('Starting ride creation process with data:', {
      carpoolId,
      scheduleType: scheduleData.scheduleType,
      startDate: scheduleData.startDate,
      endDate: scheduleData.endDate,
      startTime: scheduleData.startTime,
      dayOfWeek: scheduleData.dayOfWeek
    })

    const startDate = new Date(scheduleData.startDate)
    const endDate = scheduleData.endDate ? new Date(scheduleData.endDate) : addMonths(startDate, 3)
    
    console.log('Calculated date range:', {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    })

    let currentDate = startDate
    const dates: Date[] = []

    while (currentDate <= endDate) {
      if (scheduleData.scheduleType === 'daily') {
        dates.push(new Date(currentDate))
        currentDate = addDays(currentDate, 1)
      } else if (scheduleData.scheduleType === 'weekly') {
        const currentDayOfWeek = format(currentDate, 'EEEE').toUpperCase()
        console.log(`Checking weekly date: ${format(currentDate, 'yyyy-MM-dd')} (${currentDayOfWeek})`)
        if (currentDayOfWeek === scheduleData.dayOfWeek) {
          console.log(`Adding weekly date: ${format(currentDate, 'yyyy-MM-dd')}`)
          dates.push(new Date(currentDate))
        }
        currentDate = addDays(currentDate, 1)
      } else {
        console.log(`One-time schedule, adding single date: ${format(currentDate, 'yyyy-MM-dd')}`)
        dates.push(new Date(currentDate))
        break
      }
    }

    console.log(`Generated ${dates.length} dates for ride creation`)
    console.log('Dates:', dates.map(date => format(date, 'yyyy-MM-dd')))

    for (const date of dates) {
      try {
        console.log(`Creating ride for date: ${format(date, 'yyyy-MM-dd')} at time: ${scheduleData.startTime}`)
        const ride = await api.createCarpoolRide(
          carpoolId, 
          format(date, 'yyyy-MM-dd'),
          scheduleData.startTime
        )
        console.log(`Successfully created ride:`, ride)
      } catch (error) {
        console.error(`Failed to create ride for date ${format(date, 'yyyy-MM-dd')}:`, error)
      }
    }
    console.log('Finished creating all rides')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Starting carpool creation process')
    
    if (!startDate) {
      console.warn('No start date selected')
      alert('Please select a start date')
      return
    }

    setIsSubmitting(true)

    try {
      // Create carpool
      const carpoolData = {
        carpool_name: carpoolName,
        seats: parseInt(seats),
        available_seats: parseInt(seats), // Initially all seats are available
        destination_address: destinationAddress,
        destination_lat: destinationLat,
        destination_lng: destinationLng,
        created_by: userId
      }

      console.log('Creating carpool with data:', carpoolData)
      const newCarpool = await api.createCarpool(carpoolData, activeScope)
      console.log('Carpool created successfully:', newCarpool)

      // Create schedule
      const scheduleData = {
        carpoolId: newCarpool.id,
        scheduleType,
        startDate,
        endDate: scheduleType !== 'one_time' ? endDate : undefined,
        startTime,
        endTime,
        dayOfWeek: scheduleType === 'weekly' ? dayOfWeek : undefined
      }

      console.log('Creating schedule with data:', scheduleData)
      const schedule = await api.createCarpoolSchedule(scheduleData)
      console.log('Schedule created successfully:', schedule)

      console.log('Starting ride creation process')
      await createRidesForSchedule(newCarpool.id, scheduleData)
      console.log('All processes completed successfully')

      onSuccess()
    } catch (error) {
      console.error('Error in form submission:', error)
      alert('Failed to create carpool and schedule')
    } finally {
      setIsSubmitting(false)
      console.log('Form submission process completed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Carpool Details Section */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Carpool Details</h2>
        
        <div>
          <Label htmlFor="carpoolName" className="text-sm sm:text-base">Carpool Name</Label>
          <Input
            id="carpoolName"
            value={carpoolName}
            onChange={(e) => setCarpoolName(e.target.value)}
            required
            className="text-sm sm:text-base"
          />
        </div>

        <div>
          <Label htmlFor="seats" className="text-sm sm:text-base">Number of Seats</Label>
          <Input
            id="seats"
            type="number"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
            className="text-sm sm:text-base"
          />
        </div>

        <div>
          <Label htmlFor="destinationAddress" className="text-sm sm:text-base">Destination Address</Label>
          <AddressAutocomplete
            onSelect={handleDestinationSelect}
            placeholder="Enter destination address"
          />
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t">
        <h2 className="text-lg sm:text-xl font-semibold">Schedule Details</h2>

        <RadioGroup value={scheduleType} onValueChange={setScheduleType} className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one_time" id="one-time" />
            <Label htmlFor="one-time" className="text-sm sm:text-base">One-time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="text-sm sm:text-base">Daily</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly" className="text-sm sm:text-base">Weekly</Label>
          </div>
        </RadioGroup>

        <div>
          <Label className="text-sm sm:text-base">Start Date</Label>
          <div className="mt-1">
            <DayPicker
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              required
              disabled={false}
              className="text-sm"
            />
          </div>
        </div>

        {scheduleType !== 'one_time' && (
          <div>
            <Label className="text-sm sm:text-base">End Date</Label>
            <div className="mt-1">
              <DayPicker
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                fromDate={startDate}
                footer={!startDate ? "Please select a start date first" : undefined}
                className="text-sm"
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="startTime" className="text-sm sm:text-base">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="text-sm sm:text-base"
          />
        </div>

        {scheduleType === 'weekly' && (
          <div>
            <Label htmlFor="dayOfWeek" className="text-sm sm:text-base">Day of Week</Label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full border rounded-md p-2 text-sm sm:text-base"
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full text-sm sm:text-base"
      >
        {isSubmitting ? 'Creating...' : 'Create Carpool'}
      </Button>
    </form>
  )
} 