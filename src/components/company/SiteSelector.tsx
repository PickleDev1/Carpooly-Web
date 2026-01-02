'use client'

/**
 * SiteSelector - Component for selecting site within a company
 * 
 * Features:
 * - Shows current site or "Select Site" prompt
 * - Opens dialog to select/change site
 * - Updates user's site selection via API
 * 
 * Only shows when user is in company scope
 */

import { useState, useEffect } from 'react'
import { useCompany } from '@/contexts/CompanyContext'
import { useApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MatchingSelect, MatchingSelectContent, MatchingSelectItem, MatchingSelectTrigger, MatchingSelectValue } from '@/components/ui/matching-select'
import { MapPin, Loader2 } from 'lucide-react'
import { Site } from '@/types/company'

export function SiteSelector() {
  const { activeMembership, activeScope, refreshMemberships } = useCompany()
  const api = useApi()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(activeMembership?.site?.id || null)
  const [isSaving, setIsSaving] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [loadingSites, setLoadingSites] = useState(false)

  // Load sites for the company when dialog opens
  useEffect(() => {
    if (isOpen && activeMembership?.company_id && activeScope.type === 'company') {
      loadSites()
    }
  }, [isOpen, activeMembership?.company_id, activeScope.type])

  // Only show if in company scope
  if (activeScope.type !== 'company' || !activeMembership) {
    return null
  }

  const loadSites = async () => {
    // TODO: Add getCompanySites API method when backend provides it
    // For now, we'll get sites from membership data or a future endpoint
    setLoadingSites(true)
    try {
      // This will be implemented when backend provides GET /api/companies/{id}/sites
      // For now, we'll use a placeholder
      setSites([])
    } catch (error) {
      console.error('Failed to load sites:', error)
      setSites([])
    } finally {
      setLoadingSites(false)
    }
  }

  const handleSave = async () => {
    if (!activeMembership) return

    setIsSaving(true)
    try {
      await api.updateCompanySite(activeMembership.company_id, selectedSiteId)
      await refreshMemberships()
      setIsOpen(false)
    } catch (error: any) {
      console.error('Failed to update site:', error)
      alert(error.message || 'Failed to update site selection. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <MapPin className="h-4 w-4" />
        {activeMembership.site ? activeMembership.site.name : 'Select Site'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Your Site</DialogTitle>
            <DialogDescription>
              Choose your site location to enable company matching. You can change this anytime.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {loadingSites ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading sites...</span>
              </div>
            ) : (
              <MatchingSelect 
                value={selectedSiteId || ''} 
                onValueChange={(value) => setSelectedSiteId(value || null)}
              >
                <MatchingSelectTrigger>
                  <MatchingSelectValue placeholder="Choose a site" />
                </MatchingSelectTrigger>
                <MatchingSelectContent>
                  <MatchingSelectItem value="">None (Company-wide)</MatchingSelectItem>
                  {sites.map((site) => (
                    <MatchingSelectItem key={site.id} value={site.id}>
                      {site.name} {site.code && `(${site.code})`}
                    </MatchingSelectItem>
                  ))}
                </MatchingSelectContent>
              </MatchingSelect>
            )}
            
            {sites.length === 0 && !loadingSites && (
              <p className="text-sm text-gray-500">
                No sites available. Contact your company admin to add sites.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || loadingSites}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

