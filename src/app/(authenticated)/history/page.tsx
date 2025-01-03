'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import type { CompletedRide } from '@/types/api'

export default function HistoryPage() {
  const [completedRides, setCompletedRides] = useState<CompletedRide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const api = useApi();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const data = await api.getRideHistory()
        setCompletedRides(data)
      } catch (err) {
        setError('Failed to load ride history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [api])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ride History</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B5335]"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : completedRides.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carpool Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passengers
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedRides.map((ride, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{ride.carpool_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{ride.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{ride.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{ride.destination_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{ride.passengers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No completed rides yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}