'use client'

import { ArrowLeft, Smartphone, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function UpdateIssuesArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/app-technical" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App & Technical
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Update Issues</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Having trouble seeing the latest features or updates on CarPooly? Here&apos;s how to resolve update issues in your browser.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Fix Update Issues</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Refresh the page</span> to load the latest version.</li>
          <li><span className="font-semibold">Clear your browser cache</span> if you still see old content.</li>
          <li><span className="font-semibold">Update your browser</span> to the latest version for best compatibility.</li>
          <li><span className="font-semibold">Try a different browser</span> if the issue persists.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Still not updating?</span> Contact support for help with update issues.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Enable automatic browser updates for hassle-free upgrades.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Support:</span> Contact us if you need help updating the website.
        </div>
      </div>
    </div>
  )
} 