'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useApi } from '@/services/api'
import { Autocomplete } from '@react-google-maps/api'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser } from '@clerk/nextjs'

interface CarpoolFormData {
  carpool_name: string
  recurring_option: string
  available_seats: number
  seats: number
  destination_address: string
}

interface Carpool extends CarpoolFormData {
  id: string
}

interface CarpoolResponse {
  data: Carpool[]
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
  const [carpoolsData, setCarpoolsData] = useState<CarpoolResponse>({ data: [] })
  const [successMessage, setSuccessMessage] = useState('')
  const api = useApi()
  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID found')
      return;
    }
    fetchCarpools()
  }, [user?.id])

  const fetchCarpools = async () => {
    if (!user?.id) {
      console.log('No user ID found')
      return;
    }
    try {
      const response = await api.getCarpools(user.id)
      console.log('Raw response from getCarpools:', response)
      
      // If response is the data itself, use it directly
      const carpoolData = {
        data: Array.isArray(response) ? response : response.data || []
      }
      
      console.log('Processed carpool data:', carpoolData)
      setCarpoolsData(carpoolData)
    } catch (error) {
      console.error('Failed to fetch carpools:', error)
      setCarpoolsData({ data: [] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Submitting carpool data:', formData)
      const response = await api.createCarpool(formData)
      console.log('Carpool created:', response)
      
      setSuccessMessage('Carpool created successfully!')
      setIsFormOpen(false)
      
      // Reset form after successful creation
      setFormData({
        carpool_name: '',
        recurring_option: '',
        available_seats: 3,
        seats: 4,
        destination_address: ''
      })

      // Fetch updated carpools
      fetchCarpools()
    } catch (error) {
      console.error('Failed to create carpool:', error)
      setSuccessMessage('Failed to create carpool. Please try again.')
    }
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      setFormData({...formData, destination_address: place.formatted_address})
    }
  }

  const handleInvite = (carpoolId: string) => {
    // Implement invite functionality here
    console.log(`Inviting carpool member for carpool ID: ${carpoolId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {successMessage && (
        <Alert className="mb-6">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <h1 className="text-3xl font-bold mb-6">Create a Carpool</h1>
      
      <div className="bg-white rounded-lg shadow mb-8">
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
        {!carpoolsData.data || carpoolsData.data.length === 0 ? (
          <p className="text-gray-500">No carpools created yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Seats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Seats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {carpoolsData.data.map((carpool, index) => (
                    <tr key={carpool.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{carpool.carpool_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{carpool.recurring_option || 'None'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{carpool.available_seats}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{carpool.seats}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{carpool.destination_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-md text-sm"
                          onClick={() => handleInvite(carpool.id)}
                        >
                          Invite carpool member
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



