'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MatchFilters } from '@/services/matching'

interface UseMatchFiltersOptions {
  persistToStorage?: boolean
  storageKey?: string
  debounceMs?: number
}

export function useMatchFilters(options: UseMatchFiltersOptions = {}) {
  const {
    persistToStorage = true,
    storageKey = 'carpooly-match-filters',
    debounceMs = 500
  } = options

  const [filters, setFilters] = useState<MatchFilters>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load filters from localStorage on mount
  useEffect(() => {
    if (persistToStorage) {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsedFilters = JSON.parse(stored)
          setFilters(parsedFilters)
        }
      } catch (error) {
        console.warn('Failed to load filters from storage:', error)
      }
    }
    setIsLoading(false)
  }, [persistToStorage, storageKey])

  // Save filters to localStorage when they change
  useEffect(() => {
    if (!isLoading && persistToStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(filters))
      } catch (error) {
        console.warn('Failed to save filters to storage:', error)
      }
    }
  }, [filters, isLoading, persistToStorage, storageKey])

  const updateFilter = useCallback((key: keyof MatchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === undefined || value === null || (Array.isArray(value) && value.length === 0) 
        ? undefined 
        : value
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<MatchFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      // Clean up undefined values
      Object.keys(updated).forEach(key => {
        const value = updated[key as keyof MatchFilters]
        if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
          delete updated[key as keyof MatchFilters]
        }
      })
      return updated
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({})
  }, [])

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).length > 0
  }, [filters])

  const getFilterCount = useCallback(() => {
    return Object.values(filters).filter(value => 
      value !== undefined && 
      value !== null && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length
  }, [filters])

  // Debounced filter updates
  const [debouncedFilters, setDebouncedFilters] = useState<MatchFilters>(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filters, debounceMs])

  return {
    filters,
    debouncedFilters,
    isLoading,
    updateFilter,
    updateFilters,
    clearFilters,
    resetFilters,
    hasActiveFilters: hasActiveFilters(),
    filterCount: getFilterCount()
  }
}
