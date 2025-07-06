'use client'

import { ArrowLeft, Users, CheckCircle, Info, Shield } from 'lucide-react'
import Link from 'next/link'

export default function UserVerificationArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/community-safety" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community & Safety
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">User Verification</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">CarPooly verifies users to keep the community safe and trustworthy. Here&apos;s how to complete your verification and why it matters.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Verify Your Account</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>
            <span className="font-semibold">Go to your profile settings</span> after logging in.
          </li>
          <li>
            <span className="font-semibold">Look for the <span className="font-mono bg-gray-100 px-2 py-1 rounded">Verification</span> section</span> and click <b>Start Verification</b>.
          </li>
          <li>
            <span className="font-semibold">Follow the prompts</span> to verify your email and phone number.
          </li>
          <li>
            <span className="font-semibold">Wait for confirmation</span>—you&apos;ll get a notification when your account is verified.
          </li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Why verify?</span> Verified users are more likely to get ride requests and build trust in the community.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Privacy:</span> Your information is encrypted and only used for verification purposes.
        </div>
      </div>
    </div>
  )
} 