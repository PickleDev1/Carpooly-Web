'use client'

import { ArrowLeft, Smartphone, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AppTroubleshootingArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/app-technical" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App & Technical
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Website Troubleshooting</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">If CarPooly isn't working as expected in your browser, try these troubleshooting steps to quickly resolve common issues.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Quick Fixes</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Refresh the page</span> to clear temporary glitches.</li>
          <li><span className="font-semibold">Clear your browser cache</span> if the site is slow or unresponsive.</li>
          <li><span className="font-semibold">Try a different browser</span> (Chrome, Firefox, Safari, or Edge) to see if the issue persists.</li>
          <li><span className="font-semibold">Disable browser extensions</span> that might interfere with the site.</li>
          <li><span className="font-semibold">Check your internet connection</span> for stability.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Still stuck?</span> Contact support with details about your browser and the issue.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Keeping your browser updated prevents most issues.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Support:</span> Our team is here to help with any technical problems.
        </div>
      </div>
    </div>
  )
} 