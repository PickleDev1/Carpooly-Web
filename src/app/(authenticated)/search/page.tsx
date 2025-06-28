'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'

export default function SearchPage() {
  const [searchLocation, setSearchLocation] = useState<{ address: string; lat: number; lng: number } | null>(null)

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setSearchLocation(location)
  }

  const handleSearch = () => {
    if (searchLocation) {
      // TODO: Implement search functionality
      console.log('Searching for carpools to:', searchLocation)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Find Carpools</h1>
      <div className="flex gap-4">
        <AddressAutocomplete
          onSelect={handleLocationSelect}
          placeholder="Enter destination or route"
        />
        <Button onClick={handleSearch} disabled={!searchLocation}>
          Search
        </Button>
      </div>
      <div className="mt-8">
        <p>No carpools found. Try adjusting your search.</p>
      </div>
    </div>
  )
}

