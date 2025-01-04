'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useApi } from '@/services/api'
import { Autocomplete } from '@react-google-maps/api'

interface CarpoolFormData {
  carpool_name: string
  recurring_option: string
  available_seats: number
  seats: number
  destination_address: string
}

export default function CreateCarpoolPage() {
  const [isFormOpen, setIsFormOpen] = useState(true)
  const [formData, setFormData] = useState<CarpoolFormData>({
    carpool_name: '',
    recurring_option: '',
    available_seats: 3,
    seats: 4,
    destination_address: ''
  })
  const api = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createCarpool(formData)
      // Reset form after successful creation
      setFormData({
        carpool_name: '',
        recurring_option: '',
        available_seats: 3,
        seats: 4,
        destination_address: ''
      })
    } catch (error) {
      console.error('Failed to create carpool:', error)
    }
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setFormData({...formData, destination_address: place.formatted_address})
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create a Carpool</h1>
      
      <div className="bg-white rounded-lg shadow">
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-bold">Create a New Carpool</h2>
          {isFormOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {isFormOpen && (
          <div className="p-6 border-t">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Carpool Name
                </label>
                <Input 
                  value={formData.carpool_name}
                  onChange={e => setFormData({...formData, carpool_name: e.target.value})}
                  placeholder="Morning drop off"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Recurring Option
                </label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.recurring_option}
                  onChange={e => setFormData({...formData, recurring_option: e.target.value})}
                >
                  <option value="">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Available Seats
                </label>
                <Input 
                  type="number"
                  min="1"
                  max={formData.seats}
                  value={formData.available_seats}
                  onChange={e => setFormData({...formData, available_seats: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Seats
                </label>
                <Input 
                  type="number"
                  min="1"
                  value={formData.seats}
                  onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Destination Address
                </label>
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocomplete.setFields(['formatted_address'])
                  }}
                  onPlaceChanged={() => {
                    const place = (
                      document.querySelector('#destination-input') as HTMLInputElement
                    )?.value
                    setFormData({...formData, destination_address: place})
                  }}
                >
                  <Input 
                    id="destination-input"
                    value={formData.destination_address}
                    onChange={e => setFormData({...formData, destination_address: e.target.value})}
                    placeholder="123 Office Building, Downtown, San Francisco, CA"
                    className="w-full"
                  />
                </Autocomplete>
              </div>

              <Button type="submit" className="bg-[#2B5335] hover:bg-[#1e3b25] text-white">
                Create Carpool
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">My Carpools</h2>
        <p className="text-gray-500">No carpools created yet.</p>
      </div>
    </div>
  )
} 