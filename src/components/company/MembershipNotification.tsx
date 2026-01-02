'use client'

/**
 * MembershipNotification - Shows notification when user has new company memberships
 * 
 * Features:
 * - Detects new/auto-detected memberships
 * - Shows welcome message for new companies
 * - Allows dismissing notifications
 * - Provides link to company space
 * 
 * Backward compatible: Only shows if memberships exist
 */

import { useEffect, useState } from 'react'
import { useCompany } from '@/contexts/CompanyContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Building2, X } from 'lucide-react'
import Link from 'next/link'

export function MembershipNotification() {
  const { memberships, isLoading } = useCompany()
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    // Load dismissed notifications from localStorage
    const stored = localStorage.getItem('dismissedMembershipNotifications')
    if (stored) {
      try {
        setDismissed(JSON.parse(stored))
      } catch {
        setDismissed([])
      }
    }
  }, [])

  if (isLoading || memberships.length === 0) {
    return null
  }

  // Filter out dismissed memberships
  const newMemberships = memberships.filter(
    m => m.status === 'active' && !dismissed.includes(m.company_id)
  )

  if (newMemberships.length === 0) {
    return null
  }

  const handleDismiss = (companyId: string) => {
    const updated = [...dismissed, companyId]
    setDismissed(updated)
    localStorage.setItem('dismissedMembershipNotifications', JSON.stringify(updated))
  }

  return (
    <div className="space-y-2">
      {newMemberships.map((membership) => (
        <Alert key={membership.company_id} className="border-blue-500 bg-blue-50">
          <Building2 className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold">
            Welcome to {membership.company_name}!
          </AlertTitle>
          <AlertDescription className="text-blue-700 mt-2">
            <div className="flex items-center justify-between">
              <span>
                You&apos;ve been added to {membership.company_name}. Switch to company space to start matching with coworkers.
              </span>
              <div className="flex gap-2 ml-4">
                <Link href={`/company/${membership.company_slug}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Go to Company Space
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(membership.company_id)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

