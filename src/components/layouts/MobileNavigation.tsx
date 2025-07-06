'use client'

import Link from 'next/link'
import { useUser, useClerk } from "@clerk/nextjs"
import { 
  Home, 
  Car, 
  BarChart3, 
  MapPin, 
  Plus,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function MobileNavigation() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const navigation = [
    { 
      href: '/dashboard', 
      label: 'Home',
      icon: Home,
      activeIcon: Home
    },
    { 
      href: '/carpools', 
      label: 'Carpools',
      icon: Car,
      activeIcon: Car
    },
    { 
      href: '/maps', 
      label: 'Map',
      icon: MapPin,
      activeIcon: MapPin
    },
    { 
      href: '/analytics', 
      label: 'Analytics',
      icon: BarChart3,
      activeIcon: BarChart3
    }
  ]

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowProfileMenu(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {/* Profile/User Menu */}
          <div className="relative flex-1 flex justify-center">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex flex-col items-center justify-center h-full transition-all duration-200 text-gray-500 hover:text-gray-700"
            >
              <div className="relative">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                </div>
                {showProfileMenu && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="absolute bottom-16 left-4 right-4">
            <div 
              ref={menuRef}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            >
              {/* User Info */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2">
                <Link
                  href="/create-carpool"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Plus className="w-5 h-5 text-primary" />
                  Create Carpool
                </Link>
                <Link
                  href="/location-settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <MapPin className="w-5 h-5" />
                  Location Settings
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
              </div>

              {/* Sign Out */}
              <div className="border-t border-gray-100">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom safe area for devices with home indicator */}
      <div className="md:hidden h-4 bg-white"></div>
    </>
  )
} 