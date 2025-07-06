'use client'

import { ArrowLeft, Settings, Info, CheckCircle, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyControlsArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/account-settings" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Account & Settings
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Privacy Controls</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Take control of your privacy on CarPooly. Here's how to manage who can see your information and how your data is used.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Adjust Privacy Settings</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Go to Account Settings</span> and select <span className="font-mono bg-gray-100 px-2 py-1 rounded">Privacy</span>.</li>
          <li><span className="font-semibold">Choose what information</span> is visible to other users (e.g., profile photo, ride history).</li>
          <li><span className="font-semibold">Review data sharing options</span> and opt out of marketing or analytics if desired.</li>
          <li><span className="font-semibold">Save your changes</span> to update your privacy preferences.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> You can update your privacy settings at any time.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Security:</span> Your data is encrypted and never sold to third parties.
        </div>
      </div>
    </div>
  )
} 