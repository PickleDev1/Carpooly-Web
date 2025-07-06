'use client'

import { ArrowLeft, MapPin, Info, Eye, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RealTimeTrackingArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/location-navigation" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Location & Navigation
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Eye className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Real-time Tracking</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Stay updated on your carpool's location and progress with CarPooly's real-time tracking. Here's how to use this feature for peace of mind.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Use Real-time Tracking</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>
            <span className="font-semibold">Join or create a carpool</span> and make sure location permissions are enabled.
          </li>
          <li>
            <span className="font-semibold">Open the ride details</span> and look for the <b>Live Map</b> or <b>Track Ride</b> button.
          </li>
          <li>
            <span className="font-semibold">View the live map</span> to see the car's current location, route, and estimated arrival time.
          </li>
          <li>
            <span className="font-semibold">Share your trip</span> with friends or family for added safety.
          </li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Use tracking to coordinate pickups and keep everyone updated on delays.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Privacy:</span> Your location is only shared with your carpool group and is never public.
        </div>
      </div>
    </div>
  )
} 