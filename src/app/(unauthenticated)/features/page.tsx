'use client'

import { Car, Calendar, Users, MapPin, Bell, BarChart2, History, AlertCircle, Globe, CheckCircle, CalendarCheck, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Car,
    title: 'Create Carpools',
    description: 'Easily organize carpools for any occasion-commutes, school runs, or group events-with people you know.'
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Set up one-time or recurring rides, manage your carpool calendar, and keep everyone on the same page.'
  },
  {
    icon: Users,
    title: 'Invite Friends & Groups',
    description: 'Send invites to friends, family, or coworkers. Manage your carpool group and see who\'s joining each ride.'
  },
  {
    icon: MapPin,
    title: 'Real-Time Location Tracking',
    description: 'Monitor live locations of all carpool members during active rides for peace of mind and coordination.'
  },
  {
    icon: Globe,
    title: 'Live Map View',
    description: 'See your carpool\'s route and member locations on an interactive map.'
  },
  {
    icon: Bell,
    title: 'Notifications & Alerts',
    description: 'Get instant updates for ride reminders, schedule changes, and important alerts.'
  },
  {
    icon: History,
    title: 'Ride History',
    description: 'View your past carpools, completed rides, and group activity.'
  },
  {
    icon: BarChart2,
    title: 'Analytics & Environmental Impact',
    description: 'Track your miles saved, CO2 reduction, and see your positive impact on the environment.'
  },
  {
    icon: CalendarCheck,
    title: 'Calendar View',
    description: 'Visualize all your upcoming and past rides in a convenient calendar format.'
  },
  {
    icon: AlertCircle,
    title: 'Support & Safety Tools',
    description: 'Access help articles, contact support, and review safety features designed for trusted groups.'
  },
  {
    icon: CheckCircle,
    title: 'Verified Members',
    description: 'All users verify their email and phone number for a trusted, closed community.'
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-16">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">CarPooly Features</h1>
        <p className="text-xl text-gray-600 mb-6">Everything you need to organize safe, efficient carpools with people you know.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <Card key={idx} className="hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                <CardDescription className="text-base text-center">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 