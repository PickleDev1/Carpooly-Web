'use client'

import { useState } from 'react'
import { InvitesTable } from '@/components/invitesTable'
import { ActiveRideSection } from '@/components/ActiveRideSection'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function Dashboard() {
  const [isInvitesOpen, setIsInvitesOpen] = useState(true)
  const [isActiveRideOpen, setIsActiveRideOpen] = useState(true)
  
  const menuItems = [
    {
      title: "Create Carpool",
      description: "Start a new carpool group for your children",
      href: "/create-carpool",
      icon: "🚗"
    },
    {
      title: "Invite Friends",
      description: "Grow your carpool network",
      href: "/invite",
      icon: "👥"
    },
    {
      title: "Schedule Updates",
      description: "Manage your carpool schedule",
      href: "/schedule",
      icon: "📅"
    },
    {
      title: "Join Carpool",
      description: "Find and join existing carpools",
      href: "/join",
      icon: "🤝"
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {/* Pending Invites Section */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => setIsInvitesOpen(!isInvitesOpen)}
            className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold">Pending Invites</h2>
            {isInvitesOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {isInvitesOpen && (
            <div className="p-6 pt-0">
              <InvitesTable />
            </div>
          )}
        </div>

        {/* Active Ride Section */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => setIsActiveRideOpen(!isActiveRideOpen)}
            className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold">Active Carpool Rides</h2>
            {isActiveRideOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {isActiveRideOpen && (
            <div className="p-6 pt-0">
              <ActiveRideSection />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 