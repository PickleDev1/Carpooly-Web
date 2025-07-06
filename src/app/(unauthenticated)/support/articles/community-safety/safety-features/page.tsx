'use client'

import { ArrowLeft, Shield, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function SafetyFeaturesArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/community-safety" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community & Safety
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Safety Features</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">CarPooly is designed with your safety in mind. Here&apos;s an overview of the key safety features and how to use them.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Key Safety Features</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">User Verification:</span> All users must verify their email and phone number before joining carpools.</li>
          <li><span className="font-semibold">Live Location Sharing:</span> Share your trip in real time with trusted contacts.</li>
          <li><span className="font-semibold">Emergency Button:</span> Instantly alert our safety team and share your location if you need help.</li>
          <li><span className="font-semibold">Ratings & Reviews:</span> Rate your experience and read reviews before joining a ride.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Always use in-app features for communication and safety—avoid sharing personal contact info.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Emergency?</span> Use the emergency button in the app for immediate assistance.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Privacy:</span> Your safety and privacy are our top priorities.
        </div>
      </div>
    </div>
  )
} 