import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

type Props = {
  isOpen: boolean
  onClose: () => void
  carpoolId: string
  recurringOption: 'daily' | 'weekly' | 'monthly' | 'one-time'
  onScheduleUpdate: (schedule: any) => void
}

export function ScheduleModal({ isOpen, onClose, carpoolId, recurringOption, onScheduleUpdate }: Props) {
  const [selectedDay, setSelectedDay] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>()

  const handleSubmit = () => {
    const schedule = {
      carpoolId,
      time: selectedTime,
      ...(recurringOption === 'weekly' && { dayOfWeek: selectedDayOfWeek }),
      ...(recurringOption === 'monthly' && { date: selectedDay }),
    }
    onScheduleUpdate(schedule)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform bg-white p-6 rounded-2xl shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium mb-4">
                Update Schedule
              </Dialog.Title>

              {/* Time selector - shown for all options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>

              {/* Weekly selector */}
              {recurringOption === 'weekly' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedDayOfWeek}
                    onChange={(e) => setSelectedDayOfWeek(Number(e.target.value))}
                  >
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                      <option key={day} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Monthly/One-time selector */}
              {(recurringOption === 'monthly' || recurringOption === 'one-time') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Select Date</label>
                  <DayPicker
                    mode="single"
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    className="border rounded-md p-2"
                  />
                </div>
              )}

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  onClick={handleSubmit}
                >
                  Update
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 