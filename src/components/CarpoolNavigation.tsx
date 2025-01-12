'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, List, Info } from 'lucide-react'

const navItems = [
  {
    href: '/carpools/create',
    label: 'Create Carpool',
    icon: PlusCircle
  },
  {
    href: '/carpools/list',
    label: 'My Carpools',
    icon: List
  },
  {
    href: '/carpools/details',
    label: 'View Details',
    icon: Info
  }
]

export function CarpoolNavigation() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 