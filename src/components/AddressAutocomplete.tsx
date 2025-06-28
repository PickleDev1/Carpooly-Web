'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface AddressAutocompleteProps {
  onSelect: (location: { address: string; lat: number; lng: number }) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({ onSelect, placeholder, className }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const input = inputRef.current
    if (!input) {
      console.log('AddressAutocomplete: Input ref not available')
      return
    }

    console.log('AddressAutocomplete: Initializing...')
    console.log('AddressAutocomplete: window.google exists:', !!window.google)
    console.log('AddressAutocomplete: window.google.maps exists:', !!(window.google && window.google.maps))
    console.log('AddressAutocomplete: window.google.maps.places exists:', !!(window.google && window.google.maps && window.google.maps.places))
    console.log('AddressAutocomplete: API Key exists:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

    // Check if Google Maps is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      const errorMsg = 'Google Maps is not loaded. Please refresh the page.'
      console.error('AddressAutocomplete:', errorMsg)
      setError(errorMsg)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // NOTE: As of March 2025, google.maps.places.Autocomplete is deprecated for new customers.
      // See https://developers.google.com/maps/documentation/javascript/places-migration-overview
      // Plan to migrate to PlaceAutocompleteElement in the future.
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry'],
        types: ['address'] // Only use 'address' to avoid warning
      })

      console.log('AddressAutocomplete: Autocomplete instance created successfully')

      autocomplete.addListener('place_changed', () => {
        console.log('AddressAutocomplete: Place changed event fired')
        const place = autocomplete.getPlace()
        console.log('AddressAutocomplete: Selected place:', place)
        
        if (place.geometry?.location) {
          const locationData = {
            address: place.formatted_address || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
          console.log('AddressAutocomplete: Calling onSelect with:', locationData)
          onSelect(locationData)
          setError(null)
        } else {
          const errorMsg = 'Please select a valid address from the suggestions'
          console.error('AddressAutocomplete:', errorMsg)
          setError(errorMsg)
        }
      })

      setIsLoading(false)
      console.log('AddressAutocomplete: Initialization complete')

      return () => {
        console.log('AddressAutocomplete: Cleaning up...')
        if (window.google && window.google.maps && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(autocomplete)
        }
      }
    } catch (err) {
      console.error('AddressAutocomplete: Error initializing autocomplete:', err)
      setError('Failed to initialize address autocomplete')
      setIsLoading(false)
    }
  }, [onSelect])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Enter address"}
        className={`w-full ${className || ''}`}
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
} 