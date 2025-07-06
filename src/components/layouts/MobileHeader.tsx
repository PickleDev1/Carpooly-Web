'use client'

import Link from 'next/link'
import { useUser, useClerk } from "@clerk/nextjs"
import { useState, useRef, useEffect } from 'react'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  MapPin,
  Bell,
  Search
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { NotificationPopup } from '@/components/NotificationPopup'

export function MobileHeader() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const navigation = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/carpools', label: 'Carpools', icon: '🚗' },
    { href: '/maps', label: 'Live Map', icon: '📍' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/search', label: 'Search', icon: '🔍' },
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <header className={`fixed top-0 w-full z-50 md:hidden transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-primary'
      }`}>
        <div className="container-responsive">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <img 
                  src="/assets/logo/carpooly-logo.jpg" 
                  alt="CarPooly" 
                  className="h-7 w-7 rounded-lg shadow-sm group-hover:shadow-md transition-shadow" 
                />
              </div>
              <span className={`font-bold text-lg transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                CarPooly
              </span>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationPopup variant="mobile" />

              {/* Menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled 
                    ? 'hover:bg-gray-100 text-gray-700' 
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div 
            ref={menuRef}
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl animate-in slide-in-from-right duration-300"
          >
            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
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

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Settings & Actions */}
            <div className="p-4 border-t border-gray-100">
              <div className="space-y-1">
                <Link
                  href="/location-settings"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  Location Settings
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
              </div>
            </div>

            {/* Sign Out */}
            <div className="p-4 border-t border-gray-100 mt-auto">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 