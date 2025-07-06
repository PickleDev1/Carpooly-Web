'use client'

import { ArrowLeft, CreditCard, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function RefundsArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/payments-billing" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments & Billing
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Refunds</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Need a refund for a ride? Here's how CarPooly handles refunds and what you need to do.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Request a Refund</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Go to your billing history</span> and find the ride you want refunded.</li>
          <li><span className="font-semibold">Click <span className="font-mono bg-gray-100 px-2 py-1 rounded">Request Refund</span></span> and provide a reason for your request.</li>
          <li><span className="font-semibold">Submit your request</span>—our support team will review it and notify you of the outcome.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Note:</span> Refunds are typically processed within 3-5 business days.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Contact support if you have questions about your refund status.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Transparency:</span> You'll receive email updates throughout the refund process.
        </div>
      </div>
    </div>
  )
} 