'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { MatchFilters } from '@/services/matching'

interface Props {
  filters: MatchFilters
  onFilterChange: (filters: MatchFilters) => void
  onClearFilters: () => void
}

export function MatchFilter({ filters, onFilterChange, onClearFilters }: Props) {
  return (
    <Card>
      <CardContent className="py-4 grid gap-3 md:grid-cols-4 items-end">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Min score (%)</div>
          <Input
            type="number"
            value={filters.minScore ?? ''}
            onChange={e => onFilterChange({ ...filters, minScore: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="e.g. 70"
            min={0}
            max={100}
          />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Max distance (mi)</div>
          <Input
            type="number"
            value={filters.maxDistance ?? ''}
            onChange={e => onFilterChange({ ...filters, maxDistance: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="e.g. 10"
            min={0}
          />
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClearFilters}>Clear</Button>
        </div>
      </CardContent>
    </Card>
  )
} 