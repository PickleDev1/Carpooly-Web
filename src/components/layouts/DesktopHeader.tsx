'use client'

import Link from 'next/link'
import { SignInButton, useUser, useClerk } from "@clerk/nextjs"
import { useState } from 'react'

export function DesktopHeader() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const [showDropdown, setShowDropdown] = useState(false)

  const links = [
    { href: '/carpools', label: 'Carpools' },
    { href: '/history', label: 'History' },
    { href: '/analytics', label: 'Analytics' }
  ]

  return (
    <header className="fixed top-0 w-full bg-green-800 text-white z-50 hidden md:block">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-gray-200">
            <img src="/assets/logo/carpooly-logo.jpg" alt="CarPooly" className="h-8 w-8" />
            <span className="font-bold">CarPooly</span>
          </Link>
          <nav className="flex items-center space-x-6">
            {links.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-white hover:text-gray-200"
              >
                {link.label}
              </Link>
            ))}
            {isSignedIn && user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center"
                >
                  {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="text-white hover:text-gray-200">
                  Sign in
                </button>
              </SignInButton>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 