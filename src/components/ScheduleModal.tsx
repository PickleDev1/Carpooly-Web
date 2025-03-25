'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'
import { DayPicker } from 'react-day-picker'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Carpool } from '@/types/api'
import "react-day-picker/dist/style.css"

interface ScheduleModalProps {
  carpool: Carpool | null
  isOpen: boolean
  onClose: () => void
}

export function ScheduleModal({ carpool, isOpen, onClose }: ScheduleModalProps) {
  const [scheduleType, setScheduleType] = useState('one_time')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startTime, setStartTime] = useState('09:00')
  const [dayOfWeek, setDayOfWeek] = useState<string>('MONDAY')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const api = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carpool?.id || !startDate) return

    const scheduleData = {
      carpoolId: carpool.id,
      scheduleType,
      startDate,
      endDate: scheduleType !== 'one_time' ? endDate : undefined,
      startTime,
      dayOfWeek: scheduleType === 'weekly' ? dayOfWeek : undefined
    }

    console.log('Sending schedule data to backend:', scheduleData)
    setIsSubmitting(true)
    try {
      await api.updateCarpoolSchedule(scheduleData)
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error updating schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-background z-10 pb-4 border-b">
          <DialogHeader>
            <DialogTitle>Update Schedule</DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>Schedule Type</Label>
            <RadioGroup
              value={scheduleType}
              onValueChange={setScheduleType}
              className="flex flex-col space-y-2"
              >
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
          </div>

          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <div className="border rounded-md p-3">
              <DayPicker
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                className="border-none"
              />
            </div>
          </div>

          {scheduleType !== 'one_time' && (
            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="border rounded-md p-3">
                <DayPicker
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  className="border-none"
                />
              </div>
            </div>
          )}

          {scheduleType === 'weekly' && (
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <RadioGroup
                value={dayOfWeek}
                onValueChange={setDayOfWeek}
                className="flex flex-col space-y-2"
              >
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <RadioGroupItem value={day} id={day.toLowerCase()} />
                    <Label htmlFor={day.toLowerCase()}>{day.charAt(0) + day.slice(1).toLowerCase()}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#2B5335] hover:bg-[#1e3b25] text-white"
            >
              {isSubmitting ? 'Updating...' : 'Update Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}