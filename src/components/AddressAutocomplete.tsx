'use client'

import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

interface AddressAutocompleteProps {
  onSelect: (location: { address: string; lat: number; lng: number }) => void
  placeholder?: string
}

export function AddressAutocomplete({ onSelect, placeholder }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = inputRef.current
    if (!input || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address', 'geometry']
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry?.location) {
        onSelect({
          address: place.formatted_address || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        })
      }
    })

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete)
    }
  }, [onSelect])

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className="w-full"
    />
  )
} 