'use client'

import { ArrowLeft, MapPin, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AddressIssuesArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/location-navigation" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Location & Navigation
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Address Issues</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Having trouble with addresses in CarPooly? Here's how to fix common issues and ensure accurate pickup and drop-off locations.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Fix Address Issues</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>
            <span className="font-semibold">Use autocomplete:</span> Always select addresses from the suggestions to avoid typos.
          </li>
          <li>
            <span className="font-semibold">Check your location permissions:</span> Make sure CarPooly can access your device's location.
          </li>
          <li>
            <span className="font-semibold">Enter full addresses:</span> Include street, city, and zip code for best results.
          </li>
          <li>
            <span className="font-semibold">Update the app:</span> Make sure you're using the latest version of CarPooly for the best address support.
          </li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Trouble?</span> If an address isn't recognized, try a nearby landmark or check for spelling errors.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Save frequent addresses in your profile for quick access.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Support:</span> If you're still having trouble, contact support for help with address issues.
        </div>
      </div>
    </div>
  )
} 