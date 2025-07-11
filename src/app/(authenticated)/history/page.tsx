'use client'

import { useState, useEffect, useRef } from 'react'
import { useApi } from '@/services/api'

interface RideHistory {
  carpool_name: string
  date: string
  time: string
  destination_address: string
  destination_lat?: number
  destination_lng?: number
  passengers: number
  user_id?: string
}

export default function HistoryPage() {
  const [completedRides, setCompletedRides] = useState<RideHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    
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
    fetchedRef.current = true
  }, [api])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Ride History</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {completedRides.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carpool</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
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