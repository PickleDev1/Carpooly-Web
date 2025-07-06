'use client'

import { ArrowLeft, CreditCard, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentIssuesArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/payments-billing" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments & Billing
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Payment Issues</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Having trouble with payments? Here's how to resolve common payment issues in CarPooly.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Fix Payment Issues</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Check your payment details</span> for typos or expired cards.</li>
          <li><span className="font-semibold">Try a different payment method</span> if your card is declined.</li>
          <li><span className="font-semibold">Contact your bank</span> if the issue persists—they may be blocking the transaction.</li>
          <li><span className="font-semibold">Contact CarPooly support</span> for further assistance if needed.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Note:</span> Some banks may block new or unusual transactions for security reasons.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Always keep your payment info up to date for smooth transactions.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Support:</span> Our team is here to help with any payment problems.
        </div>
      </div>
    </div>
  )
} 