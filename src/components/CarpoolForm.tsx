'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'
import { DayPicker } from 'react-day-picker'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import "react-day-picker/dist/style.css"

interface CarpoolFormProps {
  userId: string
  onSuccess: () => void
}

export function CarpoolForm({ userId, onSuccess }: CarpoolFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const api = useApi()

  // Carpool fields
  const [carpoolName, setCarpoolName] = useState('')
  const [seats, setSeats] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')

  // Schedule fields
  const [scheduleType, setScheduleType] = useState('one_time')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startTime, setStartTime] = useState('09:00')
  const [dayOfWeek, setDayOfWeek] = useState<string>('MONDAY')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required date
    if (!startDate) {
      alert('Please select a start date')
      return
    }

    setIsSubmitting(true)

    try {
      // Only send carpool-specific data to createCarpool
      const carpoolData = {
        carpool_name: carpoolName,
        seats: parseInt(seats),
        destination_address: destinationAddress,
        created_by: userId
      }

      console.log('Creating carpool with data:', carpoolData)
      const newCarpool = await api.createCarpool(carpoolData)
      console.log('Carpool created:', newCarpool)

      // Create schedule with the new carpool ID
      const scheduleData = {
        carpoolId: newCarpool.id,
        scheduleType,
        startDate,
        endDate: scheduleType !== 'one_time' ? endDate : undefined,
        startTime,
        dayOfWeek: scheduleType === 'weekly' ? dayOfWeek : undefined
      }

      console.log('Creating schedule with data:', scheduleData)
      await api.createCarpoolSchedule(scheduleData)
      console.log('Schedule created successfully')

      onSuccess()
    } catch (error) {
      console.error('Error in form submission:', error)
      alert('Failed to create carpool and schedule')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Carpool Details Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Carpool Details</h2>
        
        <div>
          <Label htmlFor="carpoolName">Carpool Name</Label>
          <Input
            id="carpoolName"
            value={carpoolName}
            onChange={(e) => setCarpoolName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="seats">Number of Seats</Label>
          <Input
            id="seats"
            type="number"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="destinationAddress">Destination Address</Label>
          <Input
            id="destinationAddress"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-4 pt-6 border-t">
        <h2 className="text-xl font-semibold">Schedule Details</h2>

        <RadioGroup value={scheduleType} onValueChange={setScheduleType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one_time" id="one-time" />
            <Label htmlFor="one-time">One-time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily">Daily</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly">Weekly</Label>
          </div>
        </RadioGroup>

        <div>
          <Label>Start Date</Label>
          <DayPicker
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            required
            disabled={false}
          />
        </div>

        {scheduleType !== 'one_time' && (
          <div>
            <Label>End Date</Label>
            <DayPicker
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              fromDate={startDate}
              footer={!startDate ? "Please select a start date first" : undefined}
            />
          </div>
        )}

        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        {scheduleType === 'weekly' && (
          <div>
            <Label htmlFor="dayOfWeek">Day of Week</Label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full border rounded-md p-2"
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
        className="w-full"
      >
        {isSubmitting ? 'Creating...' : 'Create Carpool'}
      </Button>
    </form>
  )
} 