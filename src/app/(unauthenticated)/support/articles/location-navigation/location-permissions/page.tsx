'use client'

import { ArrowLeft, MapPin, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function LocationPermissionsArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/location-navigation" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Location & Navigation
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Location Permissions</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Allowing CarPooly to access your location helps you find rides, set pickup points, and get real-time updates. Here&apos;s how to enable location permissions for the best experience.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Step-by-Step: Enable Location Permissions</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>
            <span className="font-semibold">Open your device settings</span> and go to <span className="font-mono bg-gray-100 px-2 py-1 rounded">Apps</span> or <span className="font-mono bg-gray-100 px-2 py-1 rounded">Privacy</span>.
          </li>
          <li>
            <span className="font-semibold">Find and select CarPooly</span> from the list of apps.
          </li>
          <li>
            <span className="font-semibold">Tap on <span className="font-mono bg-gray-100 px-2 py-1 rounded">Permissions</span></span> and choose <span className="font-mono bg-gray-100 px-2 py-1 rounded">Location</span>.
          </li>
          <li>
            <span className="font-semibold">Select <span className="font-mono bg-gray-100 px-2 py-1 rounded">Allow While Using App</span></span> (recommended) or <span className="font-mono bg-gray-100 px-2 py-1 rounded">Always Allow</span> for best results.
          </li>
          <li>
            <span className="font-semibold">Restart CarPooly</span> to apply the changes.
          </li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Enabling location lets you use features like address autocomplete, live tracking, and nearby ride suggestions.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Trouble?</span> If you see a location error, double-check your device settings and make sure location services are turned on.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Privacy:</span> CarPooly only uses your location to improve your experience and never shares it without your consent.
        </div>
      </div>
    </div>
  )
} 