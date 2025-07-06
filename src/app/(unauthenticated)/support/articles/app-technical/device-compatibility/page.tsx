'use client'

import { ArrowLeft, Smartphone, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function DeviceCompatibilityArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/app-technical" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App & Technical
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Browser Compatibility</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">CarPooly works on most modern web browsers. Here's how to check if your browser is supported and get the best experience.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Supported Browsers</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Google Chrome:</span> Latest version recommended.</li>
          <li><span className="font-semibold">Mozilla Firefox:</span> Latest version recommended.</li>
          <li><span className="font-semibold">Safari:</span> Latest version on macOS or iOS.</li>
          <li><span className="font-semibold">Microsoft Edge:</span> Latest version recommended.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Issues?</span> Some features may not work on outdated browsers or unsupported platforms.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> Update your browser for the best experience and security.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Support:</span> Contact us if you're unsure about browser compatibility.
        </div>
      </div>
    </div>
  )
} 