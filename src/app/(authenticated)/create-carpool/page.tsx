'use client'

import { useUser } from '@clerk/nextjs'
import { CarpoolForm } from '@/components/CarpoolForm'
import { CarpoolList } from '@/components/CarpoolList'

export default function CreateCarpoolPage() {
  const { user } = useUser()

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Create a Carpool</h1>
      {user && <CarpoolForm onSuccess={() => window.location.reload()} userId={user.id} />}
      <CarpoolList />
    </div>
  )
}



