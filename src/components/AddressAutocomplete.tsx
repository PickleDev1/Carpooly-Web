'use client'

import { useEffect, useRef, useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface AddressAutocompleteProps {
  onSelect: (location: { address: string; lat: number; lng: number }) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({ onSelect, placeholder, className }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  useEffect(() => {
    if (!isLoaded) return

    const input = inputRef.current
    if (!input) {
      console.log('AddressAutocomplete: Input ref not available')
      return
    }

    console.log('AddressAutocomplete: Initializing with @react-google-maps/api...')

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry'],
        types: ['address']
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

      return () => {
        console.log('AddressAutocomplete: Cleaning up...')
        if (window.google && window.google.maps && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(autocomplete)
        }
      }
    } catch (err) {
      console.error('AddressAutocomplete: Error initializing autocomplete:', err)
      setError('Failed to initialize address autocomplete')
    }
  }, [isLoaded, onSelect])

  if (loadError) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Enter address"}
          className={`w-full ${className || ''}`}
          disabled
        />
        <p className="text-sm text-red-600 mt-1">Error loading Google Maps: {loadError.message}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Enter address"}
          className={`w-full ${className || ''}`}
          disabled
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mt-1">Loading Google Maps...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Enter address"}
        className={`w-full ${className || ''}`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
} 