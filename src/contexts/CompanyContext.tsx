'use client'

/**
 * CompanyContext - React Context for managing company/site state
 * 
 * This context provides:
 * - User's company memberships
 * - Active company/site selection
 * - Scope resolution (personal vs company)
 * - Helper functions to switch between contexts
 * 
 * All features are backward compatible - if user has no memberships,
 * they remain in personal mode (existing behavior).
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { CompanyMembership, Scope, CompanyMembershipsResponse } from '@/types/company'
import { useApi } from '@/services/api'

/**
 * CompanyContextType - Interface for the context value
 */
interface CompanyContextType {
  // State
  memberships: CompanyMembership[]
  activeMembership: CompanyMembership | null
  activeScope: Scope
  isLoading: boolean
  error: string | null
  
  // Actions
  setActiveCompany: (companyId: string) => void
  clearActiveCompany: () => void
  refreshMemberships: () => Promise<void>
}

/**
 * Create the context with undefined default (will throw if used outside provider)
 */
const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

/**
 * CompanyProvider - Provides company context to the app
 * 
 * Features:
 * - Loads user's company memberships on mount
 * - Persists active company selection in localStorage
 * - Auto-selects first active membership if none selected
 * - Provides scope resolution (personal vs company)
 */
export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const api = useApi()
  const [memberships, setMemberships] = useState<CompanyMembership[]>([])
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Find the active membership based on activeCompanyId
   */
  const activeMembership = memberships.find(m => m.company_id === activeCompanyId && m.status === 'active') || null

  /**
   * Resolve the active scope (personal or company)
   * - If activeCompanyId is set and membership is active → company scope
   * - Otherwise → personal scope (default)
   */
  const activeScope: Scope = activeCompanyId && activeMembership
    ? { 
        type: 'company', 
        companyId: activeCompanyId, 
        siteId: activeMembership.site?.id 
      }
    : { type: 'personal' }

  /**
   * Load user's company memberships from the backend
   * 
   * This is called:
   * - On mount (when user is available)
   * - When refreshMemberships() is called
   * 
   * Backward compatible: If endpoint doesn't exist yet, gracefully handles error
   */
  const loadMemberships = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Try to fetch memberships
      // If endpoint doesn't exist yet (backend Phase 4 not complete), this will fail gracefully
      const data = await api.getCompanyMemberships()
      setMemberships(data.memberships || [])
      
      // Auto-select first active membership if none selected and localStorage has no preference
      if (!activeCompanyId && data.memberships?.length > 0) {
        const firstActive = data.memberships.find((m: CompanyMembership) => m.status === 'active')
        if (firstActive) {
          const stored = localStorage.getItem('activeCompanyId')
          if (!stored) {
            // Only auto-select if no stored preference
            setActiveCompanyId(firstActive.company_id)
            localStorage.setItem('activeCompanyId', firstActive.company_id)
          }
        }
      }
    } catch (err: any) {
      // Gracefully handle error (endpoint might not exist yet)
      console.warn('Failed to load company memberships (this is OK if backend Phase 4 not complete):', err)
      setError(err.message || 'Failed to load company memberships')
      setMemberships([]) // Empty array = personal mode only
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, api, activeCompanyId])

  /**
   * Load memberships when user is available
   */
  useEffect(() => {
    loadMemberships()
  }, [loadMemberships])

  /**
   * Set the active company
   * 
   * Validates that:
   * - Company ID exists in memberships
   * - Membership status is 'active'
   * 
   * Persists selection to localStorage for page reloads
   */
  const setActiveCompany = useCallback((companyId: string) => {
    const membership = memberships.find(m => m.company_id === companyId && m.status === 'active')
    if (membership) {
      setActiveCompanyId(companyId)
      localStorage.setItem('activeCompanyId', companyId)
    } else {
      console.warn('Cannot set active company: membership not found or not active', companyId)
    }
  }, [memberships])

  /**
   * Clear active company (switch back to personal mode)
   */
  const clearActiveCompany = useCallback(() => {
    setActiveCompanyId(null)
    localStorage.removeItem('activeCompanyId')
  }, [])

  /**
   * Restore active company from localStorage on mount
   * Only restores if membership still exists and is active
   */
  useEffect(() => {
    if (memberships.length > 0) {
      const stored = localStorage.getItem('activeCompanyId')
      if (stored) {
        const membership = memberships.find(m => m.company_id === stored && m.status === 'active')
        if (membership) {
          setActiveCompanyId(stored)
        } else {
          // Stored company no longer valid, clear it
          localStorage.removeItem('activeCompanyId')
        }
      }
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

/**
 * useCompany - Hook to access company context
 * 
 * Usage:
 * ```tsx
 * const { activeScope, setActiveCompany, memberships } = useCompany()
 * ```
 * 
 * Throws error if used outside CompanyProvider
 */
export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within CompanyProvider')
  }
  return context
}

