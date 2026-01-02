'use client'

/**
 * SiteSelectionPrompt - Alert banner prompting user to select a site
 * 
 * Features:
 * - Shows when user is in company scope but hasn't selected a site
 * - Blocks company matching until site is selected (per backend policy)
 * - Provides quick access to site selector
 * 
 * Only shows when:
 * - User is in company scope
 * - User's membership has site_id IS NULL
 */

import { useCompany } from '@/contexts/CompanyContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { SiteSelector } from './SiteSelector'

export function SiteSelectionPrompt() {
  const { activeMembership, activeScope } = useCompany()

  // Only show if in company scope and no site selected
  if (activeScope.type !== 'company' || activeMembership?.site) {
    return null
  }

  return (
    <Alert className="border-orange-500 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 font-semibold">Site Selection Required</AlertTitle>
      <AlertDescription className="text-orange-700 mt-2">
        <p className="mb-3">
          Please select your site to enable company matching. This helps us match you with coworkers at your location.
        </p>
        <div className="flex items-center gap-2">
          <SiteSelector />
        </div>
      </AlertDescription>
    </Alert>
  )
}

