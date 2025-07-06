'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

const articlesByCategory: Record<string, string[]> = {
  'getting-started': [
    'how-to-create-a-carpool',
    'finding-rides-near-you',
    'setting-up-your-profile',
    'first-ride-tips',
  ],
  'location-navigation': [
    'location-permissions',
    'route-optimization',
    'real-time-tracking',
    'address-issues',
  ],
  'community-safety': [
    'user-verification',
    'safety-features',
    'reporting-issues',
    'community-guidelines',
  ],
  'payments-billing': [
    'payment-methods',
    'billing-history',
    'refunds',
    'payment-issues',
  ],
  'app-technical': [
    'app-troubleshooting',
    'device-compatibility',
    'update-issues',
    'performance',
  ],
  'account-settings': [
    'account-settings',
    'privacy-controls',
    'notification-preferences',
    'data-management',
  ],
}

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

export default function CategoryArticlesPage() {
  const params = useParams() as { category: string }
  const category = params.category
  const articles = articlesByCategory[category] || []

  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8 capitalize">{category.replace(/-/g, ' ')}</h1>
      <ul className="space-y-4">
        {articles.map((slug) => (
          <li key={slug}>
            <Link href={`/support/articles/${category}/${slug}`} className="text-blue-600 hover:underline text-lg">
              {articleTitles[slug]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
} 