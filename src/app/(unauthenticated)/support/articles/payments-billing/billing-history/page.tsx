'use client'

import { ArrowLeft, CreditCard, Info, CheckCircle, FileText } from 'lucide-react'
import Link from 'next/link'

export default function BillingHistoryArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/payments-billing" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments & Billing
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Billing History</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">View and manage your past payments and ride receipts in CarPooly. Here&apos;s how to access your billing history.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to View Billing History</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Go to your account settings</span> and select <span className="font-mono bg-gray-100 px-2 py-1 rounded">Billing History</span>.</li>
          <li><span className="font-semibold">Browse your list of transactions</span> by date, amount, or ride.</li>
          <li><span className="font-semibold">Download receipts</span> for your records by clicking <b>Download</b> next to each transaction.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Keep digital copies of receipts for expense tracking or reimbursement.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Privacy:</span> Your billing history is only visible to you.
        </div>
      </div>
    </div>
  )
} 