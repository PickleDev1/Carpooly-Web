'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUser, useAuth } from '@clerk/nextjs'
import { CarpoolForm } from '@/components/CarpoolForm'
import { CarpoolTable } from '@/components/CarpoolTable'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useApi } from '@/services/api'
import type { Carpool } from '@/types/api'

export default function CreateCarpoolPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [carpools, setCarpools] = useState<Carpool[]>([])
  const [isFormExpanded, setIsFormExpanded] = useState(true)
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()
  const api = useApi()

  const handleSuccess = async (newCarpool: Carpool) => {
    setCarpools([...carpools, newCarpool])
    setShowSuccess(true)
  }

  const createAnother = () => {
    setShowSuccess(false)
  }

  useEffect(() => {
    const fetchCarpools = async () => {
      try {
        const token = await getToken()
        console.log('Authorization Token:', token)

        setIsLoading(true)
        const data = await api.getCarpools()
        setCarpools(data)
      } catch (err) {
        console.error('Error fetching carpools:', err)
        setError(err instanceof Error ? err.message : 'Failed to load carpools')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCarpools()
  }, [getToken])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create a Carpool</h1>
      </div>
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow">
          <button 
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className="w-full p-6 flex justify-between items-center border-b"
          >
            <h2 className="text-2xl font-bold">Create a New Carpool</h2>
            {isFormExpanded ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </button>
          
          {isFormExpanded && (
            <div className="p-6">
              {showSuccess ? (
                <div className="bg-[#E8EDDF] p-6 rounded-lg mb-8">
                  <h2 className="text-xl font-semibold text-[#2B5335] mb-4">Carpool Created Successfully!</h2>
                  <div className="flex gap-4">
                    <Button onClick={createAnother}>Create Another Carpool</Button>
                    <Button variant="outline" onClick={() => router.push('/carpools')}>
                      View All Carpools
                    </Button>
                  </div>
                </div>
              ) : (
                <CarpoolForm onSuccess={handleSuccess} userId={user?.id || ''} />
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Carpools</h2>
            {carpools.length > 0 ? (
              <CarpoolTable carpools={carpools} />
            ) : (
              <p className="text-gray-500">No carpools created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 