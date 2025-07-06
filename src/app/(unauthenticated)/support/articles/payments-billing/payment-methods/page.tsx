'use client'

import { ArrowLeft, CreditCard, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentMethodsArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/payments-billing" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments & Billing
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Payment Methods</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">CarPooly supports multiple payment methods for your convenience. Here&apos;s how to add, update, or remove payment options.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Manage Payment Methods</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Go to your account settings</span> and select <span className="font-mono bg-gray-100 px-2 py-1 rounded">Payment Methods</span>.</li>
          <li><span className="font-semibold">Add a new payment method</span> by clicking <b>Add Card</b> or <b>Add Payment Method</b> and entering your details.</li>
          <li><span className="font-semibold">Set a default payment method</span> for faster checkout.</li>
          <li><span className="font-semibold">Remove or update</span> existing payment methods as needed.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Use a credit card or digital wallet for the fastest processing.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Trouble?</span> If your payment fails, double-check your card details or try another method.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Security:</span> All payments are encrypted and processed securely.
        </div>
      </div>
    </div>
  )
} 