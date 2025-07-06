'use client'

import { ArrowLeft, Users, Info, AlertTriangle, CheckCircle, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ReportingIssuesArticle() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-0">
      <Link href="/support/articles/community-safety" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community & Safety
      </Link>
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Reporting Issues</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">If you experience a problem or need help, CarPooly makes it easy to get support. Here's how to report issues and get help quickly.</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">How to Report an Issue</h2>
        <ol className="list-decimal list-inside space-y-4">
          <li>
            <span className="font-semibold">Click the <span className="font-mono bg-gray-100 px-2 py-1 rounded">Contact Support</span> button</span> at the top of the support page.
          </li>
          <li>
            <span className="font-semibold">Choose <Mail className='inline w-4 h-4 mb-1' /> Email or <Phone className='inline w-4 h-4 mb-1' /> Phone</span> to reach our support team.
          </li>
          <li>
            <span className="font-semibold">Describe your issue</span> in detail so we can help you as quickly as possible.
          </li>
        </ol>
      </div>

      <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
        <div>
          <span className="font-semibold">Urgent?</span> Call us for immediate help.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6">
        <Info className="w-5 h-5 text-blue-400 mt-1" />
        <div>
          <span className="font-semibold">Tip:</span> The more details you provide, the faster we can resolve your issue.
        </div>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6">
        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
        <div>
          <span className="font-semibold">Follow-up:</span> Our team will respond to your report as soon as possible.
        </div>
      </div>
    </div>
  )
} 