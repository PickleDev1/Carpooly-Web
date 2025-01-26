'use client'

import Link from 'next/link'
import { useUser, useClerk } from "@clerk/nextjs"
import { Home, Car, BarChart2, User } from 'lucide-react'
import { useState } from 'react'

export function MobileNavigation() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [showModal, setShowModal] = useState(false)

  const links = [
    { 
      href: '/dashboard', 
      label: 'Home',
      icon: <Home className="w-6 h-6" />
    },
    { 
      href: '/carpools', 
      label: 'Carpools',
      icon: <Car className="w-6 h-6" />
    },
    { 
      href: '/analytics', 
      label: 'Analytics',
      icon: <BarChart2 className="w-6 h-6" />
    }
  ]

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-top border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          {links.map(link => (
            <Link 
              key={link.href}
              href={link.href} 
              className="flex flex-col items-center justify-center text-gray-600 hover:text-green-700"
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
          <button 
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>

      {/* Mobile Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:hidden">
          <div className="bg-white w-full rounded-t-xl p-4">
            <button
              onClick={() => signOut()}
              className="block w-full text-left py-3 text-red-600 font-medium"
            >
              Sign out
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="block w-full text-center py-3 text-gray-500 border-t"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
} 