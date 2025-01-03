'use client'

import { useLoadScript } from '@react-google-maps/api'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  })

  return (
    <div>
      <header className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">Carpooly</Link>
          <nav className="flex items-center space-x-6">
            <Link href="/carpools">Carpools</Link>
            <Link href="/history">History</Link>
            <Link href="/analytics">Analytics</Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {isLoaded ? children : <div>Loading maps...</div>}
      </main>
      <footer className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Carpooly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

