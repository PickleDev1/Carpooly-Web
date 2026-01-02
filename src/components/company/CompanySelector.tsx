'use client'

/**
 * CompanySelector - Component for selecting active company context
 * 
 * Features:
 * - Shows current active company or "Personal" mode
 * - Allows switching between companies
 * - Allows switching back to personal mode
 * - Only shows if user has company memberships
 * 
 * Backward compatible: If no memberships, component doesn't render
 */

import { useCompany } from '@/contexts/CompanyContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, ChevronDown } from 'lucide-react'
import {
  MatchingSelect,
  MatchingSelectContent,
  MatchingSelectItem,
  MatchingSelectTrigger,
  MatchingSelectValue,
} from '@/components/ui/matching-select'

export function CompanySelector() {
  const { memberships, activeMembership, activeScope, setActiveCompany, clearActiveCompany, isLoading } = useCompany()

  // Don't render if no memberships (backward compatible - personal mode only)
  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span className="text-sm">Loading company memberships...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (memberships.length === 0) {
    return null // No memberships, don't show selector (personal mode only)
  }

  return (
    <Card className="border-gray-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            {activeScope.type === 'personal' ? (
              <>
                <div className="p-2 rounded-lg bg-gray-100">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Personal Space</span>
                  <span className="text-xs text-gray-500">Your personal carpools</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{activeMembership?.company_name || 'Company'}</span>
                  <span className="text-xs text-gray-500">
                    {activeMembership?.site?.name || 'Company-wide'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {memberships.length > 0 && (
              <MatchingSelect
                value={activeScope.type === 'company' ? activeMembership?.company_id || '' : 'personal'}
                onValueChange={(value) => {
                  if (value === 'personal') {
                    clearActiveCompany()
                  } else {
                    setActiveCompany(value)
                  }
                }}
              >
                <MatchingSelectTrigger className="w-[180px] h-9">
                  <MatchingSelectValue placeholder="Select space" />
                </MatchingSelectTrigger>
                <MatchingSelectContent>
                  <MatchingSelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Personal</span>
                    </div>
                  </MatchingSelectItem>
                  {memberships
                    .filter(m => m.status === 'active')
                    .map((membership) => (
                      <MatchingSelectItem key={membership.company_id} value={membership.company_id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{membership.company_name}</span>
                        </div>
                      </MatchingSelectItem>
                    ))}
                </MatchingSelectContent>
              </MatchingSelect>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

