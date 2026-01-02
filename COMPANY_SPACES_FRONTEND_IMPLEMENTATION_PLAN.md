# Company Spaces Feature - Frontend Implementation Plan

**Version:** 1.0  
**Date:** 2025-01-XX  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Phases](#implementation-phases)
3. [Phase-by-Phase Breakdown](#phase-by-phase-breakdown)
4. [Testing Strategy](#testing-strategy)
5. [UI/UX Considerations](#uiux-considerations)
6. [API Integration Checklist](#api-integration-checklist)
7. [Risk Mitigation](#risk-mitigation)

---

## Overview

### Goal

Implement frontend support for Company Spaces feature, allowing users to:
- Join and switch between company contexts
- Use company-specific matching, preferences, and requests
- Maintain separate personal and company carpool spaces
- Access company admin features (if applicable)

### Key Principles

- ✅ **Backward Compatible** - All existing functionality continues to work
- ✅ **Progressive Enhancement** - Company features are additive, not replacements
- ✅ **Clear UI Separation** - Personal vs Company contexts are visually distinct
- ✅ **Graceful Degradation** - Works even if backend company features aren't enabled

---

## Implementation Phases

### Frontend Phases (Aligned with Backend)

| Phase | Backend Phase | Frontend Work | Status |
|-------|--------------|---------------|--------|
| **Phase 0** | N/A | Foundation & Preparation | 🔄 Ready |
| **Phase 1** | Phase 1-2 | No changes (backend setup) | ✅ N/A |
| **Phase 2** | Phase 3 | Backward Compatibility Verification | 🔄 Ready |
| **Phase 3** | Phase 4 | Company Context & Membership UI | 🔄 Ready |
| **Phase 4** | Phase 5 | Auto-Detection & Site Selection | 🔄 Ready |
| **Phase 5** | Phase 6 | Company Matching & Requests | 🔄 Ready |
| **Phase 6** | Phase 7 | Company Carpools & Calendar | 🔄 Ready |
| **Phase 7** | Phase 8 | Admin Analytics (Optional) | 🔄 Ready |

---

## Phase-by-Phase Breakdown

### Phase 0: Foundation & Preparation

**Duration:** 1-2 days  
**Dependencies:** None  
**Risk:** Low ✅

#### Objectives

1. Set up TypeScript types and interfaces
2. Create company context management utilities
3. Set up API service methods (stubbed)
4. Create reusable UI components

#### Tasks

##### 1.1 Type Definitions

**File:** `src/types/company.ts` (NEW)

```typescript
export interface Company {
  id: string;
  name: string;
  slug: string;
  primary_domain: string;
  additional_domains?: string[];
  logo_url?: string;
  settings: CompanySettings;
  is_active: boolean;
}

export interface CompanySettings {
  require_invite_code: boolean;
  allow_cross_site_matching: boolean;
  default_timezone: string;
  estimated_avg_commute_distance_km: number;
  emission_factor_kg_co2_per_km: number;
}

export interface Site {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  is_active: boolean;
}

export interface CompanyMembership {
  id: string;
  company_id: string;
  company_name: string;
  company_slug: string;
  role: 'employee' | 'site_admin' | 'company_admin';
  status: 'active' | 'pending' | 'invited' | 'inactive';
  site?: {
    id: string;
    name: string;
    code?: string;
    timezone?: string;
  };
}

export interface CompanyMembershipsResponse {
  memberships: CompanyMembership[];
}

export interface CompanyStats {
  company_id: string;
  name: string;
  total_users: number;
  active_users_last_30d: number;
  total_carpools: number;
  active_carpools: number;
  rides_last_30d: number;
  miles_saved_last_30d: number;
  co2_saved_last_30d_kg: number;
}

export interface SiteStats extends CompanyStats {
  site_id: string;
  site_name: string;
  site_code?: string;
}

export interface CompanyAdoption {
  sites: {
    site_id: string;
    site_name: string;
    site_code?: string;
    users_onboarded: number;
    active_users_last_30d: number;
    carpools: number;
    rides_last_30d: number;
  }[];
}

export type Scope = 
  | { type: 'personal' }
  | { type: 'company'; companyId: string; siteId?: string };
```

**File:** `src/types/matching.ts` (UPDATE)

```typescript
// Add to existing MatchingPreferences interface
export interface MatchingPreferences {
  id?: string;  // NEW - surrogate primary key (added in backend Phase 2)
  user_id: string;
  // ... existing fields
  company_id?: string | null;  // NEW
  site_id?: string | null;    // NEW
}

// Add to existing MatchRequest interface
export interface MatchRequest {
  id: string;
  // ... existing fields
  company_id?: string | null;  // NEW
  site_id?: string | null;     // NEW
}
```

##### 1.2 Company Context Management

**File:** `src/contexts/CompanyContext.tsx` (NEW)

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { CompanyMembership, Scope } from '@/types/company'
import { useApi } from '@/services/api'

interface CompanyContextType {
  memberships: CompanyMembership[]
  activeMembership: CompanyMembership | null
  activeScope: Scope
  isLoading: boolean
  error: string | null
  setActiveCompany: (companyId: string) => void
  clearActiveCompany: () => void
  refreshMemberships: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const api = useApi()
  const [memberships, setMemberships] = useState<CompanyMembership[]>([])
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeMembership = memberships.find(m => m.company_id === activeCompanyId) || null

  const activeScope: Scope = activeCompanyId
    ? { type: 'company', companyId: activeCompanyId, siteId: activeMembership?.site?.id }
    : { type: 'personal' }

  const loadMemberships = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await api.getCompanyMemberships()
      setMemberships(data.memberships || [])
      
      // Auto-select first active membership if none selected
      if (!activeCompanyId && data.memberships?.length > 0) {
        const firstActive = data.memberships.find(m => m.status === 'active')
        if (firstActive) {
          setActiveCompanyId(firstActive.company_id)
        }
      }
    } catch (err: any) {
      console.error('Failed to load company memberships:', err)
      setError(err.message || 'Failed to load company memberships')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMemberships()
  }, [user?.id])

  const setActiveCompany = (companyId: string) => {
    const membership = memberships.find(m => m.company_id === companyId && m.status === 'active')
    if (membership) {
      setActiveCompanyId(companyId)
      // Store in localStorage for persistence
      localStorage.setItem('activeCompanyId', companyId)
    }
  }

  const clearActiveCompany = () => {
    setActiveCompanyId(null)
    localStorage.removeItem('activeCompanyId')
  }

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('activeCompanyId')
    if (stored && memberships.some(m => m.company_id === stored && m.status === 'active')) {
      setActiveCompanyId(stored)
    }
  }, [memberships])

  return (
    <CompanyContext.Provider
      value={{
        memberships,
        activeMembership,
        activeScope,
        isLoading,
        error,
        setActiveCompany,
        clearActiveCompany,
        refreshMemberships: loadMemberships,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within CompanyProvider')
  }
  return context
}
```

##### 1.3 API Service Methods

**File:** `src/services/api.ts` (UPDATE)

Add new methods:

```typescript
// Company endpoints
async getCompanyMemberships(): Promise<CompanyMembershipsResponse> {
  const headers = await getHeaders()
  const response = await fetch(`${API_URL}/api/me/company`, { headers })
  if (!response.ok) throw new Error(`Failed to fetch memberships: ${response.status}`)
  return response.json()
}

async updateCompanySite(companyId: string, siteId: string | null): Promise<{ company_id: string; site_id: string | null; updated_at: string }> {
  const headers = await getHeaders()
  const response = await fetch(`${API_URL}/api/me/company-site`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ company_id: companyId, site_id: siteId }),
  })
  if (!response.ok) throw new Error(`Failed to update site: ${response.status}`)
  return response.json()
}

// Admin endpoints (if user is admin)
async getCompanyStats(companyId: string): Promise<CompanyStats> {
  const headers = await getHeaders()
  const response = await fetch(`${API_URL}/api/companies/${companyId}/stats`, { headers })
  if (!response.ok) throw new Error(`Failed to fetch company stats: ${response.status}`)
  return response.json()
}

async getSiteStats(companyId: string, siteId: string): Promise<SiteStats> {
  const headers = await getHeaders()
  const response = await fetch(`${API_URL}/api/companies/${companyId}/sites/${siteId}/stats`, { headers })
  if (!response.ok) throw new Error(`Failed to fetch site stats: ${response.status}`)
  return response.json()
}

async getCompanyAdoption(companyId: string): Promise<CompanyAdoption> {
  const headers = await getHeaders()
  const response = await fetch(`${API_URL}/api/companies/${companyId}/adoption`, { headers })
  if (!response.ok) throw new Error(`Failed to fetch adoption: ${response.status}`)
  return response.json()
}
```

**File:** `src/services/matching.ts` (UPDATE)

Update existing methods to accept scope:

```typescript
// Handle both normal preferences and "not configured" response
type PreferencesResponse = 
  | MatchingPreferences
  | { configured: false; message: string; company_id: string }

async getPreferences(scope?: Scope): Promise<PreferencesResponse> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/preferences`
  const params = new URLSearchParams()
  
  if (scope?.type === 'company') {
    params.set('scope', 'company')
    params.set('company_id', scope.companyId)
  } else {
    params.set('scope', 'personal')
  }
  
  const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint
  const headers = await api.getHeaders()
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch preferences: ${response.status}`)
  }
  
  const data = await response.json()
  
  // Handle "not configured" response for company preferences
  if (data.configured === false) {
    return data as { configured: false; message: string; company_id: string }
  }
  
  // Handle normal preferences response
  return (data.preferences || data) as MatchingPreferences
}

async updatePreferences(update: Partial<MatchingPreferences>, scope?: Scope): Promise<MatchingPreferences> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/preferences`
  const payload = {
    ...update,
    ...(scope?.type === 'company' && {
      company_id: scope.companyId,
      site_id: scope.siteId,
    }),
  }
  // ... rest of implementation
}

async getRequests(scope?: Scope): Promise<MatchRequestsResponse> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests`
  const params = new URLSearchParams()
  
  if (scope?.type === 'company') {
    params.set('scope', 'company')
    params.set('company_id', scope.companyId)
  }
  
  const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint
  // ... rest of implementation
}

async sendRequest(
  toUserId: string,
  potentialMatchId: string,        // ✅ Required (not optional)
  carpoolName: string,               // ✅ Required (not optional)
  preferredCarpoolSize: number,     // ✅ Required (not optional)
  message?: string,                  // Optional
  scope?: Scope
): Promise<MatchRequestResponse> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/requests`
  const body = {
    to_user_id: toUserId,
    potential_match_id: potentialMatchId,  // Required
    carpool_name: carpoolName,             // Required
    preferred_carpool_size: preferredCarpoolSize,  // Required
    ...(message && { message }),          // Optional
    ...(scope?.type === 'company' && {
      company_id: scope.companyId,
      site_id: scope.siteId,
    }),
  }
  // ... rest of implementation
}

async getPotentialMatches(filters: MatchFilters = {}, scope?: Scope): Promise<PotentialMatchesResponse> {
  const base = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/find-matches`  // ✅ Correct endpoint name
  const params = new URLSearchParams()
  
  // Existing filters
  // ...
  
  // Add scope
  if (scope?.type === 'company') {
    params.set('scope', 'company')
    params.set('company_id', scope.companyId)
    if (scope.siteId) {
      params.set('site_id', scope.siteId)
    }
  }
  
  // ... rest of implementation
}
```

##### 1.4 UI Components (Stubs)

**File:** `src/components/company/CompanySelector.tsx` (NEW)

```typescript
'use client'

import { useCompany } from '@/contexts/CompanyContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users } from 'lucide-react'

export function CompanySelector() {
  const { memberships, activeMembership, setActiveCompany, clearActiveCompany } = useCompany()

  if (memberships.length === 0) {
    return null // No memberships, don't show selector
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-600" />
            <span className="font-medium">Active Space:</span>
            {activeMembership ? (
              <span className="text-blue-600">{activeMembership.company_name}</span>
            ) : (
              <span className="text-gray-500">Personal</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={clearActiveCompany}>
            Switch to Personal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**File:** `src/components/company/SiteSelector.tsx` (NEW)

```typescript
'use client'

import { useState } from 'react'
import { useCompany } from '@/contexts/CompanyContext'
import { useApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin } from 'lucide-react'

export function SiteSelector() {
  const { activeMembership, refreshMemberships } = useCompany()
  const api = useApi()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(activeMembership?.site?.id || null)
  const [isSaving, setIsSaving] = useState(false)

  if (!activeMembership) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await api.updateCompanySite(activeMembership.company_id, selectedSiteId)
      await refreshMemberships()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to update site:', error)
      alert('Failed to update site selection')
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
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedSiteId || ''} onValueChange={setSelectedSiteId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Company-wide)</SelectItem>
                {/* Sites will be loaded from company data */}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

**Verification Checklist:**
- [ ] Type definitions compile without errors
- [ ] CompanyContext provides correct values
- [ ] API service methods have correct signatures
- [ ] UI components render without errors

---

### Phase 2: Backward Compatibility Verification

**Duration:** 1 day  
**Dependencies:** Backend Phase 3 complete  
**Risk:** Low ✅

#### Objectives

1. Verify all existing functionality still works
2. Test that personal scope is default
3. Verify no data leaks
4. Update tests if needed

#### Tasks

##### 2.1 Test Existing Endpoints

**Test Cases:**

1. **GET /api/matching/preferences** (no params)
   - ✅ Returns personal preferences
   - ✅ Response shape unchanged
   - ✅ `company_id` is `null`

2. **GET /api/matching/requests** (no params)
   - ✅ Returns only personal requests
   - ✅ Response shape unchanged
   - ✅ No company requests included

3. **GET /api/carpools/users/{userId}**
   - ✅ Returns only personal carpools
   - ✅ Response shape unchanged
   - ✅ No company carpools included

4. **POST /api/matching/requests** (no company_id)
   - ✅ Creates personal request
   - ✅ Request accepted and carpool created
   - ✅ Carpool has `company_id IS NULL`

##### 2.2 Update Component Tests

**Files to Update:**
- `src/components/matching/MatchingPreferences.test.tsx`
- `src/components/matching/MatchRequests.test.tsx`
- `src/components/matching/PotentialMatches.test.tsx`
- `src/components/CarpoolList.test.tsx`

**Test Updates:**
- Verify components work without company context
- Verify components handle `company_id: null` in responses
- Verify no errors when company features aren't available

##### 2.3 Manual Testing Checklist

- [ ] Dashboard loads correctly
- [ ] Matching page loads correctly
- [ ] Preferences page loads and saves correctly
- [ ] Match requests send/receive correctly
- [ ] Carpools list shows correctly
- [ ] Calendar shows correctly
- [ ] No console errors
- [ ] No network errors

**Verification Checklist:**
- [ ] All existing tests pass
- [ ] Manual testing confirms no regressions
- [ ] No data leaks (only personal data shown)
- [ ] Performance is acceptable

---

### Phase 3: Company Context & Membership UI

**Duration:** 2-3 days  
**Dependencies:** Backend Phase 4 complete  
**Risk:** Medium ⚠️

#### Objectives

1. Integrate CompanyContext into app layout
2. Add company selector to navigation
3. Display company memberships
4. Handle membership errors gracefully

#### Tasks

##### 3.1 Integrate CompanyProvider

**File:** `src/app/layout.tsx` or `src/app/(authenticated)/layout.tsx` (UPDATE)

```typescript
import { CompanyProvider } from '@/contexts/CompanyContext'

export default function AuthenticatedLayout({ children }) {
  return (
    <CompanyProvider>
      {/* Existing layout */}
      {children}
    </CompanyProvider>
  )
}
```

##### 3.2 Add Company Selector to Navigation

**File:** `src/components/navigation/Sidebar.tsx` or similar (UPDATE)

```typescript
import { CompanySelector } from '@/components/company/CompanySelector'
import { useCompany } from '@/contexts/CompanyContext'

export function Sidebar() {
  const { activeScope } = useCompany()
  
  return (
    <nav>
      {/* Existing navigation */}
      <CompanySelector />
      {/* Rest of navigation */}
    </nav>
  )
}
```

##### 3.3 Create Company Hub Pages

**File:** `src/app/(authenticated)/company/[slug]/page.tsx` (NEW)

```typescript
'use client'

import { useParams } from 'next/navigation'
import { useCompany } from '@/contexts/CompanyContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, MapPin } from 'lucide-react'

export default function CompanyHubPage() {
  const params = useParams()
  const { memberships, activeMembership } = useCompany()
  const membership = memberships.find(m => m.company_slug === params.slug)

  if (!membership) {
    return <div>Company not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {membership.company_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Role:</span> {membership.role}
            </div>
            {membership.site && (
              <div>
                <span className="font-medium">Site:</span> {membership.site.name}
              </div>
            )}
            {/* Company-specific content */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

##### 3.4 Error Handling

**File:** `src/components/company/CompanyErrorBoundary.tsx` (NEW)

```typescript
'use client'

import { Component, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class CompanyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Company Feature Error</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'An error occurred with company features'}
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}
```

**Verification Checklist:**
- [ ] CompanyProvider integrated into layout
- [ ] Company selector appears in navigation
- [ ] Company hub pages load correctly
- [ ] Errors handled gracefully
- [ ] Personal mode still works when no company selected

---

### Phase 4: Auto-Detection & Site Selection

**Duration:** 2 days  
**Dependencies:** Backend Phase 5 complete  
**Risk:** Low ✅

#### Objectives

1. Handle auto-detected memberships
2. Implement site selection flow
3. Show site selection prompt when needed
4. Handle site selection errors

#### Tasks

##### 4.1 Membership Detection UI

**File:** `src/components/company/MembershipNotification.tsx` (NEW)

```typescript
'use client'

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
    const stored = localStorage.getItem('dismissedMembershipNotifications')
    if (stored) {
      setDismissed(JSON.parse(stored))
    }
  }, [])

  if (isLoading || memberships.length === 0) return null

  const newMemberships = memberships.filter(
    m => m.status === 'active' && !dismissed.includes(m.company_id)
  )

  if (newMemberships.length === 0) return null

  const handleDismiss = (companyId: string) => {
    const updated = [...dismissed, companyId]
    setDismissed(updated)
    localStorage.setItem('dismissedMembershipNotifications', JSON.stringify(updated))
  }

  return (
    <div className="space-y-2">
      {newMemberships.map(membership => (
        <Alert key={membership.company_id} className="border-blue-500">
          <Building2 className="h-4 w-4" />
          <AlertTitle>Welcome to {membership.company_name}!</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>You've been added to {membership.company_name}. Switch to company space to start matching with coworkers.</span>
            <div className="flex gap-2">
              <Link href={`/company/${membership.company_slug}`}>
                <Button size="sm">Go to Company Space</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(membership.company_id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
```

##### 4.2 Site Selection Flow

**File:** `src/components/company/SiteSelectionPrompt.tsx` (NEW)

```typescript
'use client'

import { useCompany } from '@/contexts/CompanyContext'
import { SiteSelector } from './SiteSelector'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { MapPin, AlertCircle } from 'lucide-react'

export function SiteSelectionPrompt() {
  const { activeMembership, activeScope } = useCompany()

  // Only show if in company scope and no site selected
  if (activeScope.type !== 'company' || activeMembership?.site) {
    return null
  }

  return (
    <Alert className="border-orange-500 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Site Selection Required</AlertTitle>
      <AlertDescription className="text-orange-700">
        <p className="mb-2">
          Please select your site to enable company matching.
        </p>
        <SiteSelector />
      </AlertDescription>
    </Alert>
  )
}
```

##### 4.3 Update Matching Pages

**File:** `src/app/(authenticated)/matching/page.tsx` (UPDATE)

```typescript
import { SiteSelectionPrompt } from '@/components/company/SiteSelectionPrompt'

export default function MatchingPage() {
  return (
    <div>
      <SiteSelectionPrompt />
      {/* Existing matching page content */}
    </div>
  )
}
```

**Verification Checklist:**
- [ ] New memberships are detected and shown
- [ ] Site selection prompt appears when needed
- [ ] Site selection saves correctly
- [ ] Matching is blocked until site selected (if required)
- [ ] Errors handled gracefully

---

### Phase 5: Company Matching & Requests

**Duration:** 3-4 days  
**Dependencies:** Backend Phase 6 complete  
**Risk:** Medium ⚠️

#### Objectives

1. Update matching components to use company scope
2. Show company vs personal context clearly
3. Handle company-specific matching
4. Update request flows for company context

#### Tasks

##### 5.1 Update Matching Preferences Component

**File:** `src/components/matching/MatchingPreferences.tsx` (UPDATE)

```typescript
import { useCompany } from '@/contexts/CompanyContext'

export function MatchingPreferences() {
  const { activeScope } = useCompany()
  const matching = useMatchingService()

  useEffect(() => {
    const load = async () => {
      // Pass scope to getPreferences
      const prefs = await matching.getPreferences(activeScope)
      // ... rest of logic
    }
    load()
  }, [activeScope])

  const handleSave = async () => {
    // Pass scope to updatePreferences
    await matching.updatePreferences(formData, activeScope)
  }

  return (
    <div>
      {activeScope.type === 'company' && (
        <Alert>
          <AlertTitle>Company Preferences</AlertTitle>
          <AlertDescription>
            These preferences apply to {activeScope.companyId} matching only.
          </AlertDescription>
        </Alert>
      )}
      {/* Existing form */}
    </div>
  )
}
```

##### 5.2 Update Potential Matches Component

**File:** `src/components/matching/PotentialMatches.tsx` (UPDATE)

```typescript
import { useCompany } from '@/contexts/CompanyContext'

export function PotentialMatches() {
  const { activeScope } = useCompany()

  const loadMatches = async () => {
    // Pass scope to getPotentialMatches
    const matches = await matching.getPotentialMatches(filters, activeScope)
    // ... rest of logic
  }

  const handleSendRequest = async (matchId: string) => {
    // Pass scope to sendRequest
    await matching.sendRequest(
      toUserId,
      matchId,
      message,
      carpoolName,
      preferredSize,
      activeScope
    )
  }

  return (
    <div>
      {activeScope.type === 'company' && (
        <Alert>
          <AlertTitle>Company Matches</AlertTitle>
          <AlertDescription>
            Showing matches from {activeScope.companyId} only.
          </AlertDescription>
        </Alert>
      )}
      {/* Existing matches display */}
    </div>
  )
}
```

##### 5.3 Update Match Requests Component

**File:** `src/components/matching/MatchRequests.tsx` (UPDATE)

```typescript
import { useCompany } from '@/contexts/CompanyContext'

export function MatchRequests() {
  const { activeScope } = useCompany()

  const load = async () => {
    // Pass scope to getRequests
    const data = await matching.getRequests(activeScope)
    // ... rest of logic
  }

  return (
    <div>
      {activeScope.type === 'company' && (
        <Alert>
          <AlertTitle>Company Requests</AlertTitle>
          <AlertDescription>
            Showing requests from {activeScope.companyId} only.
          </AlertDescription>
        </Alert>
      )}
      {/* Existing requests display */}
    </div>
  )
}
```

##### 5.4 Add Scope Indicator to All Matching Pages

**File:** `src/components/matching/ScopeIndicator.tsx` (NEW)

```typescript
'use client'

import { useCompany } from '@/contexts/CompanyContext'
import { Badge } from '@/components/ui/badge'
import { Building2, Users } from 'lucide-react'

export function ScopeIndicator() {
  const { activeScope, activeMembership } = useCompany()

  if (activeScope.type === 'personal') {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        Personal
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="flex items-center gap-1 bg-blue-600">
      <Building2 className="h-3 w-3" />
      {activeMembership?.company_name || 'Company'}
    </Badge>
  )
}
```

**Verification Checklist:**
- [ ] Matching preferences load/save with correct scope
- [ ] Potential matches filtered by company
- [ ] Match requests filtered by company
- [ ] Scope indicator shows correctly
- [ ] Company vs personal context is clear
- [ ] All matching flows work in both scopes

---

### Phase 6: Company Carpools & Calendar

**Duration:** 2-3 days  
**Dependencies:** Backend Phase 7 complete  
**Risk:** Medium ⚠️

#### Objectives

1. Filter carpools by scope
2. Show company carpools separately
3. Update calendar to be scope-aware
4. Handle carpool access validation

#### Tasks

##### 6.1 Update Carpool List

**File:** `src/components/CarpoolList.tsx` (UPDATE)

```typescript
import { useCompany } from '@/contexts/CompanyContext'

export function CarpoolList() {
  const { activeScope } = useCompany()
  const api = useApi()

  useEffect(() => {
    const fetchCarpools = async () => {
      // API will filter by scope automatically
      const carpools = await api.getCarpools(user.id)
      // Filter client-side if needed
      const filtered = activeScope.type === 'personal'
        ? carpools.filter(c => !c.company_id)
        : carpools.filter(c => c.company_id === activeScope.companyId)
      setCarpools(filtered)
    }
    fetchCarpools()
  }, [activeScope, user.id])
}
```

##### 6.2 Update Carpool Calendar

**File:** `src/app/(authenticated)/carpools/[id]/calendar/page.tsx` (UPDATE)

```typescript
import { useCompany } from '@/contexts/CompanyContext'

export default function CarpoolCalendarPage() {
  const { activeScope } = useCompany()
  const params = useParams()

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const schedules = await api.getCarpoolSchedules(params.id as string)
        // Backend will validate access based on company_id
        setSchedules(schedules)
      } catch (error: any) {
        if (error.status === 403) {
          // User doesn't have access to this company carpool
          router.push('/carpools')
        }
      }
    }
    fetchSchedules()
  }, [params.id, activeScope])
}
```

##### 6.3 Add Scope Tabs to Carpools Page

**File:** `src/app/(authenticated)/carpools/list/page.tsx` (UPDATE)

```typescript
import { useCompany } from '@/contexts/CompanyContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ListCarpoolsPage() {
  const { memberships, activeScope } = useCompany()
  const [activeTab, setActiveTab] = useState<'personal' | 'company'>('personal')

  return (
    <div>
      {memberships.length > 0 && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'personal' | 'company')}>
          <TabsList>
            <TabsTrigger value="personal">Personal Carpools</TabsTrigger>
            <TabsTrigger value="company">Company Carpools</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <CarpoolList scope={{ type: 'personal' }} />
          </TabsContent>
          <TabsContent value="company">
            <CarpoolList scope={activeScope.type === 'company' ? activeScope : undefined} />
          </TabsContent>
        </Tabs>
      )}
      {memberships.length === 0 && <CarpoolList scope={{ type: 'personal' }} />}
    </div>
  )
}
```

**Verification Checklist:**
- [ ] Carpools filtered by scope correctly
- [ ] Company carpools shown separately
- [ ] Calendar loads company carpools
- [ ] Access validation works (403 errors handled)
- [ ] Scope tabs work correctly
- [ ] No data leaks between scopes

---

### Phase 7: Admin Analytics (Optional)

**Duration:** 2-3 days  
**Dependencies:** Backend Phase 8 complete  
**Risk:** Low ✅

#### Objectives

1. Create admin dashboard for company stats
2. Show site-level analytics
3. Display adoption metrics
4. Handle role-based access

#### Tasks

##### 7.1 Company Stats Page

**File:** `src/app/(authenticated)/company/[slug]/analytics/page.tsx` (NEW)

```typescript
'use client'

import { useParams } from 'next/navigation'
import { useCompany } from '@/contexts/CompanyContext'
import { useApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { CompanyStats } from '@/types/company'

export default function CompanyAnalyticsPage() {
  const params = useParams()
  const { activeMembership } = useCompany()
  const api = useApi()
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeMembership || activeMembership.role === 'employee') {
      // Not authorized
      return
    }

    const load = async () => {
      try {
        const data = await api.getCompanyStats(activeMembership.company_id)
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeMembership])

  if (!activeMembership || activeMembership.role === 'employee') {
    return <div>Access denied. Admin role required.</div>
  }

  if (loading) return <div>Loading...</div>
  if (!stats) return <div>Failed to load stats</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Company Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_users}</div>
          </CardContent>
        </Card>
        {/* More stat cards */}
      </div>
    </div>
  )
}
```

**Verification Checklist:**
- [ ] Admin pages only accessible to admins
- [ ] Company stats display correctly
- [ ] Site stats display correctly
- [ ] Adoption metrics display correctly
- [ ] Role-based access enforced

---

## Testing Strategy

### Unit Tests

**Files to Test:**
- `src/contexts/CompanyContext.tsx`
- `src/services/api.ts` (company methods)
- `src/services/matching.ts` (scope-aware methods)
- `src/components/company/*.tsx`

**Test Coverage:**
- Company context provides correct values
- Scope resolution works correctly
- API methods handle errors
- Components render correctly

### Integration Tests

**Test Scenarios:**
1. User with no memberships - personal mode only
2. User with one membership - can switch to company
3. User with multiple memberships - can switch between companies
4. Site selection required - matching blocked until site selected
5. Company matching - only shows company users
6. Company requests - only shows company requests
7. Company carpools - only shows company carpools
8. Access validation - 403 errors handled

### E2E Tests

**Critical Flows:**
1. Join company → Select site → Match with coworker → Create carpool
2. Switch between personal and company contexts
3. View company analytics (admin only)
4. Handle membership errors gracefully

---

## UI/UX Considerations

### Visual Separation

- **Personal Mode:** Default styling, "Personal" badge
- **Company Mode:** Blue accent, "Company" badge, company name visible
- **Clear Indicators:** Always show active scope
- **Context Switching:** Easy toggle between personal/company

### Error States

- **No Membership:** Hide company features
- **No Site Selected:** Show prompt, block matching
- **Access Denied:** Clear error message, redirect
- **API Errors:** User-friendly error messages

### Loading States

- **Membership Loading:** Show skeleton/spinner
- **Company Data Loading:** Show loading indicators
- **Graceful Degradation:** Fall back to personal if company fails

---

## API Integration Checklist

### New Endpoints

- [ ] `GET /api/me/company` - Get memberships
- [ ] `PUT /api/me/company-site` - Update site
- [ ] `GET /api/companies/{id}/stats` - Company stats (admin)
- [ ] `GET /api/companies/{id}/sites/{id}/stats` - Site stats (admin)
- [ ] `GET /api/companies/{id}/adoption` - Adoption metrics (admin)

### Modified Endpoints

- [ ] `GET /api/matching/preferences` - Add scope query params
- [ ] `PUT /api/matching/preferences` - Add scope in body
- [ ] `GET /api/matching/requests` - Add scope query params
- [ ] `POST /api/matching/requests` - Add scope in body
- [ ] `POST /api/matching/find-matches` - Add scope in body
- [ ] `GET /api/carpools/users/{userId}` - Filter by scope (backend)

### Error Handling

- [ ] 403 Forbidden - Membership/role errors
- [ ] 404 Not Found - Company/site not found
- [ ] 400 Bad Request - Invalid scope parameters
- [ ] Network errors - Retry logic, user feedback

---

## Risk Mitigation

### Backward Compatibility

- ✅ All existing endpoints work without scope
- ✅ Default to personal scope
- ✅ Graceful degradation if company features fail
- ✅ Feature flags for gradual rollout

### Data Isolation

- ✅ Client-side filtering as backup
- ✅ Clear error messages for access violations
- ✅ No mixing of personal/company data in UI

### Performance

- ✅ Lazy load company features
- ✅ Cache memberships
- ✅ Optimize API calls (batch if possible)

### User Experience

- ✅ Clear visual indicators
- ✅ Helpful error messages
- ✅ Smooth context switching
- ✅ Progressive disclosure (show company features only when relevant)

---

## Timeline Estimate

| Phase | Duration | Total Days |
|-------|----------|------------|
| Phase 0: Foundation | 1-2 days | 2 |
| Phase 2: Backward Compatibility | 1 day | 1 |
| Phase 3: Company Context UI | 2-3 days | 3 |
| Phase 4: Site Selection | 2 days | 2 |
| Phase 5: Company Matching | 3-4 days | 4 |
| Phase 6: Company Carpools | 2-3 days | 3 |
| Phase 7: Admin Analytics | 2-3 days | 3 |
| **Total** | | **18-22 days** |

**Note:** Phases can be done in parallel with backend development. Frontend can start Phase 0-3 while backend completes Phase 1-3.

---

## Next Steps

1. **Review this plan** with team
2. **Set up development environment** for company features
3. **Begin Phase 0** (Foundation) - can start immediately
4. **Coordinate with backend** on Phase 2 timing
5. **Iterate on UI/UX** based on user feedback

---

**Document Status:** Ready for Implementation  
**Last Updated:** 2025-01-XX  
**Contact:** Frontend Team

