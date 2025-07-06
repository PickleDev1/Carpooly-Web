'use client'

import { useParams } from 'next/navigation'

const articleTitles: Record<string, string> = {
  'how-to-create-a-carpool': 'How to create a carpool',
  'finding-rides-near-you': 'Finding rides near you',
  'setting-up-your-profile': 'Setting up your profile',
  'first-ride-tips': 'First ride tips',
  'location-permissions': 'Location permissions',
  'route-optimization': 'Route optimization',
  'real-time-tracking': 'Real-time tracking',
  'address-issues': 'Address issues',
  'user-verification': 'User verification',
  'safety-features': 'Safety features',
  'reporting-issues': 'Reporting issues',
  'community-guidelines': 'Community guidelines',
  'payment-methods': 'Payment methods',
  'billing-history': 'Billing history',
  'refunds': 'Refunds',
  'payment-issues': 'Payment issues',
  'app-troubleshooting': 'App troubleshooting',
  'device-compatibility': 'Device compatibility',
  'update-issues': 'Update issues',
  'performance': 'Performance',
  'account-settings': 'Account settings',
  'privacy-controls': 'Privacy controls',
  'notification-preferences': 'Notification preferences',
  'data-management': 'Data management',
}

export default function ArticlePage() {
  const params = useParams() as { slug: string }
  const title = articleTitles[params.slug] || params.slug.replace(/-/g, ' ')

  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>
      <div className="prose prose-lg">
        <p>This page will explain how to {title.toLowerCase()} in detail. (Content coming soon.)</p>
      </div>
    </div>
  )
} 