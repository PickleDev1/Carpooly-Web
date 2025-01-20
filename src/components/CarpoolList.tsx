'use client'

import { useState } from 'react'
import { Carpool } from '@/types/api'
import { InviteModal } from './InviteModal'
import { useUserUuid } from '@/contexts/UserContext'
import { useCarpools } from '@/hooks/useCarpools'
import { useApi } from '@/services/api'
import { TrashIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { ScheduleModal } from './ScheduleModal'

export function CarpoolList() {
  const [selectedCarpoolId, setSelectedCarpoolId] = useState<string | null>(null)
  const { uuid, loading: uuidLoading, error: uuidError } = useUserUuid()
  const { carpools, loading: carpoolsLoading } = useCarpools()
  const api = useApi()
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedCarpool, setSelectedCarpool] = useState<Carpool | null>(null)

  console.log('CarpoolList render:', {
    uuid,
    uuidLoading,
    uuidError,
    carpools,
    carpoolsLoading
  })

  const handleDelete = async (carpoolId: string) => {
    if (window.confirm('Are you sure you want to delete this carpool?')) {
      try {
        await api.deleteCarpool(carpoolId)
        // Refresh the list
      } catch (error) {
        console.error('Error deleting carpool:', error)
        alert('Failed to delete carpool')
      }
    }
  }

  const handleUpdateSchedule = (carpool: Carpool) => {
    setSelectedCarpool(carpool)
    setScheduleModalOpen(true)
  }

  const handleScheduleUpdate = async (schedule: any) => {
    try {
      // Add API call to update schedule
      await api.updateCarpoolSchedule(schedule)
      // Refresh carpools list
    } catch (error) {
      console.error('Error updating schedule:', error)
      alert('Failed to update schedule')
    }
  }

  if (uuidError) {
    return <div className="text-center py-8 text-red-600">Error loading user data: {uuidError}</div>
  }

  if (uuidLoading) {
    return <div className="text-center py-8">Loading user data...</div>
  }

  if (!uuid) {
    return <div className="text-center py-8">User not authenticated</div>
  }

  if (carpoolsLoading) {
    return <div className="text-center py-8">Loading carpools...</div>
  }

  if (!carpools?.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No carpools created yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carpools.map((carpool) => (
              <tr key={carpool.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {carpool.carpool_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {carpool.recurring_option || 'One-time'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {carpool.available_seats} of {carpool.seats}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {carpool.destination_address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setSelectedCarpoolId(carpool.id || null)}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Invite carpool member
                  </button>
                  <button
                    onClick={() => handleUpdateSchedule(carpool)}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 flex items-center gap-2"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    Update Schedule
                  </button>
                  <button
                    onClick={() => carpool.id && handleDelete(carpool.id)}
                    className="p-2 text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteModal 
        carpoolId={selectedCarpoolId || ''}
        isOpen={!!selectedCarpoolId}
        onClose={() => setSelectedCarpoolId(null)}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        carpoolId={selectedCarpool?.id || ''}
        recurringOption={(selectedCarpool?.recurring_option as "one-time" | "daily" | "weekly" | "monthly") || "one-time"}
        onScheduleUpdate={handleScheduleUpdate}
      />
    </>
  )
} 