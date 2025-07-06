'use client'

import { ArrowLeft, Settings, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AccountSettingsArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/account-settings" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Account & Settings
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Settings className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Manage your CarPooly account details, preferences, and security settings all in one place. Here's how to update your account settings.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Update Account Settings</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Go to your profile</span> and select <span className="font-mono bg-gray-100 px-2 py-1 rounded">Account Settings</span>.</li>
          <li><span className="font-semibold">Edit your details</span> such as name, email, phone number, and password.</li>
          <li><span className="font-semibold">Set your preferences</span> for notifications, language, and more.</li>
          <li><span className="font-semibold">Save changes</span> to update your account.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Use a strong password and keep your contact info up to date.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Locked out?</span> Use the <b>Forgot Password</b> link to reset your password.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Support:</span> Contact us if you need help updating your account.
        </div>
      </div>
    </div>
  )
} 