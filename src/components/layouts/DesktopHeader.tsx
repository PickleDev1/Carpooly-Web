'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SignInButton, useUser, useClerk } from "@clerk/nextjs"
import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Car,
  BarChart3,
  Home,
  Menu,
  X
} from 'lucide-react'
import { usePathname } from 'next/navigation'

export function DesktopHeader() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const navigation = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/carpools', label: 'Carpools', icon: Car },
    { href: '/maps', label: 'Live Map', icon: MapPin },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href={isSignedIn ? "/dashboard" : "/"} 
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <Image 
                src="/assets/logo/carpooly-logo.jpg" 
                alt="CarPooly" 
                className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow" 
                width={32}
                height={32}
              />
            </div>
            <span className={`font-bold text-xl transition-colors ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              CarPooly
            </span>
          </Link>

          {/* Navigation */}
          {isSignedIn && (
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isScrolled
                        ? 'text-gray-700 hover:text-primary hover:bg-primary/10'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* User Menu / Sign In */}
          <div className="flex items-center gap-4">
            {isSignedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isScrolled 
                      ? 'hover:bg-gray-100' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                    {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className={`hidden sm:block font-medium ${
                    isScrolled ? 'text-gray-900' : 'text-white'
                  }`}>
                    {user.firstName || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  } ${isScrolled ? 'text-gray-600' : 'text-white/80'}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/location-settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <MapPin className="w-4 h-4" />
                        Location Settings
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className={`btn-ghost ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                    Sign in
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="btn-primary">
                    Get Started
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 