'use client'

import { ArrowLeft, MapPin, Info, CheckCircle, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default function RouteOptimizationArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/location-navigation" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Location & Navigation
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Route Optimization</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">CarPooly helps you find the fastest and most efficient routes for your carpool. Here&apos;s how to use route optimization features for a smoother ride.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Optimize Your Route</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>
            <span className="font-semibold">Create or join a carpool</span> and enter all pickup and drop-off locations.
          </li>
          <li>
            <span className="font-semibold">Enable route optimization</span> when prompted during carpool setup or in the ride details page.
          </li>
          <li>
            <span className="font-semibold">Review the suggested route</span> on the map. CarPooly will automatically arrange stops for the shortest travel time.
          </li>
          <li>
            <span className="font-semibold">Adjust stops if needed</span> by dragging points on the map or editing the order in the app.
          </li>
          <li>
            <span className="font-semibold">Save and share the route</span> with your riders for transparency and coordination.
          </li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Lightbulb className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Use real-time traffic updates to avoid delays and keep everyone informed.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Efficiency:</span> Optimized routes save time, fuel, and reduce your carbon footprint.
        </div>
      </div>
    </div>
  )
} 