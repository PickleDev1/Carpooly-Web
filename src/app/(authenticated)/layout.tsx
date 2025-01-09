'use client'

import { useLoadScript } from '@react-google-maps/api'
import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'
import Image from 'next/image'

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">Carpooly</Link>
          <nav className="flex items-center space-x-6">
            <Link href="/carpools">Carpools</Link>
            <Link href="/history">History</Link>
            <Link href="/analytics">Analytics</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoaded ? children : <div>Loading maps...</div>}
      </main>
      <footer className="bg-[#2B5335] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <ul className="space-y-2">
                <li><Link href="/about">Our Story</Link></li>
                <li><Link href="/team">Team</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/safety">Safety</Link></li>
                <li><Link href="/blog">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/support">Support</Link></li>
                <li><Link href="/community">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Carpooly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

