'use client'

import { useUser } from '@clerk/nextjs'
import { CarpoolForm } from '@/components/CarpoolForm'

export default function CreateCarpoolPage() {
  const { user } = useUser()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Carpool</h1>
      {user && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <CarpoolForm 
            userId={user.id} 
            onSuccess={() => window.location.href = '/carpools/list'} 
          />
        </div>
      )}
    </div>
  )
} 