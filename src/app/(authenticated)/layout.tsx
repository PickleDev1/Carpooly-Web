'use client'

import { useLoadScript } from '@react-google-maps/api'
import { MainLayout } from '@/components/layouts/MainLayout'

// Define libraries array outside component to keep it static
const libraries: ("places")[] = ["places"]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  return isLoaded ? children : <div>Loading maps...</div>
}

