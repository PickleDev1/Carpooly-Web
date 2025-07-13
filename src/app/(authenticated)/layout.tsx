'use client'

import { useLoadScript } from '@react-google-maps/api'
import { MainLayout } from '@/components/layouts/MainLayout'
import { SignInRedirect } from '@/components/SignInRedirect'

// Define libraries array outside component to keep it static
const libraries: ("places")[] = ["places"]

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('AuthenticatedLayout: API Key exists:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  console.log('AuthenticatedLayout: API Key length:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length || 0)
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  console.log('AuthenticatedLayout: Google Maps loaded:', isLoaded)
  if (loadError) {
    console.error('AuthenticatedLayout: Google Maps load error:', loadError)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5335] mx-auto mb-4"></div>
          <p>Loading Google Maps...</p>
          {loadError && (
            <p className="text-red-600 mt-2">Error loading Google Maps: {loadError.message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <SignInRedirect />
      {children}
    </>
  )
}

