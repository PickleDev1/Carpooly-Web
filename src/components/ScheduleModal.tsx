'use client'

import { useState } from 'react'
import { useApi } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Carpool } from '@/types/api'

interface ScheduleModalProps {
  carpool: Carpool | null
  isOpen: boolean
  onClose: () => void
}

export function ScheduleModal({ carpool, isOpen, onClose }: ScheduleModalProps) {
  const [schedule, setSchedule] = useState('DAILY')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const api = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carpool?.id) return

    setIsSubmitting(true)
    try {
      await api.updateCarpoolSchedule({
        carpoolId: carpool.id,
        recurringOption: schedule
      })
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Recurring Option</Label>
            <RadioGroup
              value={schedule}
              onValueChange={setSchedule}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DAILY" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WEEKLY" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MONTHLY" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 