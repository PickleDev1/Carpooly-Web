'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function CreateCarpoolPage() {
  const [isFormOpen, setIsFormOpen] = useState(true)

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
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Carpool Name
                </label>
                <Input 
                  placeholder="Morning Junior High school drop off"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Recurring Option
                </label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Destination Address
                </label>
                <Input 
                  placeholder="123 Office Building, Downtown, San Francisco, CA"
                  className="w-full"
                />
              </div>

              <Button className="bg-[#2B5335] hover:bg-[#1e3b25] text-white">
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