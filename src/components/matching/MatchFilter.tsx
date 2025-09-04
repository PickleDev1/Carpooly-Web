'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MatchingSelect, MatchingSelectContent, MatchingSelectItem, MatchingSelectTrigger, MatchingSelectValue } from '@/components/ui/matching-select'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  X,
  MapPin,
  Star,
  Users,
  Clock
} from 'lucide-react'
import { MatchFilters } from '@/services/matching'

interface MatchFilterProps {
  filters: MatchFilters
  onFilterChange: (filters: MatchFilters) => void
  onClearFilters: () => void
}

export function MatchFilter({ filters, onFilterChange, onClearFilters }: MatchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof MatchFilters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.minScore) count++
    if (filters.maxDistance) count++
    if (filters.ageRanges && filters.ageRanges.length > 0) count++
    if (filters.genders && filters.genders.length > 0) count++
    if (filters.studentPreference) count++
    if (filters.driverPreference) count++
    return count
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Compatibility Score Filter */}
          <div>
            <Label htmlFor="minScore" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Compatibility Score
            </Label>
            <Input
              id="minScore"
              type="number"
              min="0"
              max="100"
              value={filters.minScore || ''}
              onChange={(e) => updateFilter('minScore', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 70"
              className="mt-1"
            />
          </div>

          {/* Distance Filter */}
          <div>
            <Label htmlFor="maxDistance" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Maximum Distance (miles)
            </Label>
            <Input
              id="maxDistance"
              type="number"
              min="1"
              max="50"
              step="0.5"
              value={filters.maxDistance || ''}
              onChange={(e) => updateFilter('maxDistance', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 10"
              className="mt-1"
            />
          </div>

          {/* Age Range Filter */}
          <div>
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Age Ranges
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(['18-25', '26-35', '36-45', '46-55', '56-65', '65+'] as const).map((age) => (
                <label key={age} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.ageRanges?.includes(age) || false}
                    onChange={(e) => {
                      const currentRanges = filters.ageRanges || []
                      const newRanges = e.target.checked
                        ? [...currentRanges, age]
                        : currentRanges.filter(r => r !== age)
                      updateFilter('ageRanges', newRanges.length > 0 ? newRanges : undefined)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{age}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gender
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(['male', 'female', 'non-binary', 'any'] as const).map((gender) => (
                <label key={gender} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.genders?.includes(gender) || false}
                    onChange={(e) => {
                      const currentGenders = filters.genders || []
                      const newGenders = e.target.checked
                        ? [...currentGenders, gender]
                        : currentGenders.filter(g => g !== gender)
                      updateFilter('genders', newGenders.length > 0 ? newGenders : undefined)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Student Preference Filter */}
          <div>
            <Label htmlFor="studentPreference" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Student Preference
            </Label>
            <MatchingSelect
              value={filters.studentPreference || ''}
              onValueChange={(value) => updateFilter('studentPreference', value || undefined)}
            >
              <MatchingSelectTrigger className="mt-1">
                <MatchingSelectValue placeholder="Select preference" />
              </MatchingSelectTrigger>
              <MatchingSelectContent>
                <MatchingSelectItem value="students_only">Students Only</MatchingSelectItem>
                <MatchingSelectItem value="professionals_only">Professionals Only</MatchingSelectItem>
                <MatchingSelectItem value="both">Both Students and Professionals</MatchingSelectItem>
              </MatchingSelectContent>
            </MatchingSelect>
          </div>

          {/* Driver Preference Filter */}
          <div>
            <Label htmlFor="driverPreference" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Driver Preference
            </Label>
            <MatchingSelect
              value={filters.driverPreference || ''}
              onValueChange={(value) => updateFilter('driverPreference', value || undefined)}
            >
              <MatchingSelectTrigger className="mt-1">
                <MatchingSelectValue placeholder="Select preference" />
              </MatchingSelectTrigger>
              <MatchingSelectContent>
                <MatchingSelectItem value="driver">Driver</MatchingSelectItem>
                <MatchingSelectItem value="passenger">Passenger</MatchingSelectItem>
                <MatchingSelectItem value="flexible">Flexible</MatchingSelectItem>
              </MatchingSelectContent>
            </MatchingSelect>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {filters.minScore && (
                  <Badge variant="outline" className="text-xs">
                    Min Score: {filters.minScore}%
                  </Badge>
                )}
                {filters.maxDistance && (
                  <Badge variant="outline" className="text-xs">
                    Max Distance: {filters.maxDistance} miles
                  </Badge>
                )}
                {filters.ageRanges && filters.ageRanges.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Ages: {filters.ageRanges.join(', ')}
                  </Badge>
                )}
                {filters.genders && filters.genders.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Gender: {filters.genders.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}
                  </Badge>
                )}
                {filters.studentPreference && (
                  <Badge variant="outline" className="text-xs">
                    {filters.studentPreference.replace('_', ' ')}
                  </Badge>
                )}
                {filters.driverPreference && (
                  <Badge variant="outline" className="text-xs">
                    {filters.driverPreference.charAt(0).toUpperCase() + filters.driverPreference.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
} 