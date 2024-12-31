'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'
import { api } from '@/services/api'
import type { Carpool } from '@/types/api'

interface CarpoolFormProps {
  onSuccess: (carpool: any) => void
  userId: string
}

export function CarpoolForm({ onSuccess, userId }: CarpoolFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const availableSeats = parseInt(formData.get('available_seats')?.toString() || '0')
    
    const carpoolData: Omit<Carpool, 'id'> = {
      carpool_name: formData.get('carpool_name')?.toString() || '',
      recurring_option: formData.get('recurring_option')?.toString() || '',
      available_seats: availableSeats,
      destination_address: formData.get('destination_address')?.toString() || '',
      seats: availableSeats + 1,
      created_by: userId,
    }

    try {
      const newCarpool = await api.createCarpool(carpoolData)
      onSuccess(newCarpool)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Carpool Name</label>
        <Input 
          type="text" 
          name="carpool_name" 
          placeholder="Morning Junior High school drop off" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Recurring Option</label>
        <select name="recurring_option" className="w-full border rounded-md p-2" required>
          <option value="NONE">None</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Available Seats</label>
        <Input type="number" name="available_seats" min="1" required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Destination Address</label>
        {isLoaded ? (
          <Autocomplete
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={() => {
              const place = autocompleteRef.current?.getPlace();
              if (place?.formatted_address) {
                setDestinationAddress(place.formatted_address);
              }
            }}
          >
            <Input 
              type="text" 
              name="destination_address" 
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="123 Office Building, Downtown, San Francisco, CA" 
              required 
            />
          </Autocomplete>
        ) : (
          <Input 
            type="text" 
            name="destination_address" 
            placeholder="Loading..." 
            disabled 
          />
        )}
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">{error}</div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Carpool'}
      </Button>
    </form>
  )
} 