'use client'

import { ArrowLeft, Smartphone, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function PerformanceArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/app-technical" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App & Technical
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Performance</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">Want CarPooly to run faster and smoother? Here's how to optimize performance in your web browser.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tips for Better Performance</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li><span className="font-semibold">Close unused tabs</span> to free up memory.</li>
          <li><span className="font-semibold">Clear your browser cache</span> regularly.</li>
          <li><span className="font-semibold">Keep your browser updated</span> for the latest features and security.</li>
          <li><span className="font-semibold">Check your internet connection</span> for speed and stability.</li>
          <li><span className="font-semibold">Disable unnecessary browser extensions</span> that may slow down the site.</li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Still slow?</span> Try another browser or contact support for help.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> A strong internet connection improves site speed and reliability.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Support:</span> We're here to help with any performance issues.
        </div>
      </div>
    </div>
  )
} 