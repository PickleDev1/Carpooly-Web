'use client'

import { ArrowLeft, Settings, Info, CheckCircle, Bell } from 'lucide-react'
import Link from 'next/link'

export default function NotificationPreferencesArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/account-settings" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Account & Settings
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Stay informed your way! Here's how to customize your CarPooly notifications for rides, messages, and more.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Set Notification Preferences</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Go to Account Settings</span> and select <span className="font-mono bg-gray-100 px-2 py-1 rounded">Notifications</span>.</li>
          <li><span className="font-semibold">Choose which notifications</span> you want to receive (e.g., ride updates, messages, promotions).</li>
          <li><span className="font-semibold">Set your preferred channels</span> (push, email, SMS).</li>
          <li><span className="font-semibold">Save your preferences</span> to apply changes.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Enable push notifications for real-time ride updates.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Control:</span> You can change your notification settings anytime.
        </div>
      </div>
    </div>
  )
} 