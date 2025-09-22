'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MatchingSelect, MatchingSelectContent, MatchingSelectItem, MatchingSelectTrigger, MatchingSelectValue } from '@/components/ui/matching-select'
import { 
  Filter, 
  X, 
  Users, 
  MapPin, 
  Clock, 
  GraduationCap,
  Briefcase,
  Sliders
} from 'lucide-react'
import type { MatchFilters } from '@/services/matching'

interface Props {
  filters: MatchFilters
  onFilterChange: (filters: MatchFilters) => void
  onClearFilters: () => void
  onApplyFilters: () => void
}

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+']
const GENDER_OPTIONS = ['any', 'male', 'female', 'non-binary', 'prefer_not_to_say']
const STUDENT_STATUS_OPTIONS = ['undergraduate', 'graduate', 'not_student']
const OCCUPATION_OPTIONS = [
  'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
  'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education', 'Other'
]

export function MatchFilter({ filters, onFilterChange, onClearFilters, onApplyFilters }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<MatchFilters>(filters)

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Debounced filter application
  const applyFilters = useCallback(() => {
    onFilterChange(localFilters)
  }, [localFilters, onFilterChange])

  // Auto-apply filters after 500ms delay, but only if user-changed values differ from props
  useEffect(() => {
    // Prevent feedback loop: if nothing actually changed, do nothing
    const propsJson = JSON.stringify(filters)
    const localJson = JSON.stringify(localFilters)
    if (propsJson === localJson) return

    const timer = setTimeout(applyFilters, 500)
    return () => clearTimeout(timer)
  }, [localFilters, filters, applyFilters])

  const updateFilter = (key: keyof MatchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: keyof MatchFilters, value: string) => {
    setLocalFilters(prev => {
      const current = (prev[key] as string[]) || []
      const exists = current.includes(value)
      const updated = exists 
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [key]: updated.length > 0 ? updated : undefined }
    })
  }

  const clearAllFilters = () => {
    const clearedFilters: MatchFilters = {}
    setLocalFilters(clearedFilters)
    onClearFilters()
  }

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== undefined && 
      value !== null && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sliders className="w-5 h-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Min Compatibility Score</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={localFilters.min_score ?? ''}
                onChange={e => updateFilter('min_score', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 70"
                min={0}
                max={100}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Max Distance</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={localFilters.max_distance ?? ''}
                onChange={e => updateFilter('max_distance', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 10"
                min={0}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">miles</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Results Limit</Label>
            <Input
              type="number"
              value={localFilters.limit ?? ''}
              onChange={e => updateFilter('limit', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 20"
              min={1}
              max={100}
            />
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <>
            {/* Demographic Filters */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Demographic Filters
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Age Ranges</Label>
                  <div className="space-y-2">
                    {AGE_RANGES.map(age => (
                      <div key={age} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`age-${age}`}
                          checked={localFilters.age_ranges?.includes(age) || false}
                          onChange={() => toggleArrayFilter('age_ranges', age)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`age-${age}`} className="text-sm">
                          {age}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Gender Preferences</Label>
                  <div className="space-y-2">
                    {GENDER_OPTIONS.map(gender => (
                      <div key={gender} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`gender-${gender}`}
                          checked={localFilters.gender_preferences?.includes(gender) || false}
                          onChange={() => toggleArrayFilter('gender_preferences', gender)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`gender-${gender}`} className="text-sm capitalize">
                          {gender.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Filters */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Filters
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Student Status</Label>
                  <div className="space-y-2">
                    {STUDENT_STATUS_OPTIONS.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={localFilters.student_status?.includes(status) || false}
                          onChange={() => toggleArrayFilter('student_status', status)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                          {status.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Occupations</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {OCCUPATION_OPTIONS.map(occupation => (
                      <div key={occupation} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`occupation-${occupation}`}
                          checked={localFilters.occupation_preferences?.includes(occupation) || false}
                          onChange={() => toggleArrayFilter('occupation_preferences', occupation)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`occupation-${occupation}`} className="text-sm">
                          {occupation}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Presets */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">Quick Presets</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalFilters({
                    min_score: 80,
                    max_distance: 5,
                    age_ranges: ['26-35', '36-45'],
                    student_preference: 'professionals_only'
                  })}
                >
                  High Compatibility
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalFilters({
                    min_score: 60,
                    max_distance: 15,
                    student_preference: 'both'
                  })}
                >
                  Broad Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalFilters({
                    min_score: 70,
                    max_distance: 3,
                    age_ranges: ['18-25', '26-35'],
                    student_preference: 'students_only'
                  })}
                >
                  Students Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalFilters({
                    min_score: 75,
                    max_distance: 8,
                    age_ranges: ['26-35', '36-45', '46-55'],
                    student_preference: 'professionals_only'
                  })}
                >
                  Professionals
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Filter Summary */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {localFilters.min_score && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Score ≥ {localFilters.min_score}%
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('min_score', undefined)}
                  />
                </Badge>
              )}
              {localFilters.max_distance && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Distance ≤ {localFilters.max_distance}mi
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('max_distance', undefined)}
                  />
                </Badge>
              )}
              {localFilters.age_ranges && localFilters.age_ranges.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Ages: {localFilters.age_ranges.join(', ')}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('age_ranges', undefined)}
                  />
                </Badge>
              )}
              {localFilters.gender_preferences && localFilters.gender_preferences.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Gender: {localFilters.gender_preferences.join(', ')}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('gender_preferences', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 