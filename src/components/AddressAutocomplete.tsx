'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

// Define libraries array outside component to keep it static
const libraries: ("places")[] = ["places"]

interface AddressAutocompleteProps {
  onSelect: (location: { address: string; lat: number; lng: number }) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({ onSelect, placeholder, className }: AddressAutocompleteProps) {
  console.log('🔄 AddressAutocomplete: Component render')
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Stabilize the onSelect callback to prevent re-initialization
  const stableOnSelect = useCallback((location: { address: string; lat: number; lng: number }) => {
    console.log('🎯 AddressAutocomplete: stableOnSelect called with:', location)
    onSelect(location)
  }, [onSelect])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  useEffect(() => {
    console.log('🔄 AddressAutocomplete: useEffect triggered, isLoaded:', isLoaded)
    if (!isLoaded) {
      console.log('⏳ AddressAutocomplete: Google Maps not loaded yet, waiting...')
      return
    }

    const input = inputRef.current
    if (!input) {
      console.log('❌ AddressAutocomplete: Input ref not available')
      return
    }

    console.log('🚀 AddressAutocomplete: Initializing with @react-google-maps/api...')
    console.log('🔍 AddressAutocomplete: window.google exists:', !!window.google)
    console.log('🔍 AddressAutocomplete: window.google.maps exists:', !!(window.google && window.google.maps))
    console.log('🔍 AddressAutocomplete: window.google.maps.places exists:', !!(window.google && window.google.maps && window.google.maps.places))

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry'],
        types: ['address']
      })

      console.log('✅ AddressAutocomplete: Autocomplete instance created successfully')
      // Add input event listener to track when user types
      input.addEventListener('input', (e) => {
        console.log('⌨️ AddressAutocomplete: User typing:', (e.target as HTMLInputElement).value)
      })

      // Add focus event listener to track when input is focused
      input.addEventListener('focus', () => {
        console.log('🎯 AddressAutocomplete: Input focused')
      })

      // Add blur event listener to track when input loses focus
      input.addEventListener('blur', () => {
        console.log('🎯 AddressAutocomplete: Input blurred')
      })

      autocomplete.addListener('place_changed', () => {
        console.log('🎯 AddressAutocomplete: Place changed event fired')
        const place = autocomplete.getPlace()
        console.log('📍 AddressAutocomplete: Selected place:', place)
        console.log('📍 AddressAutocomplete: Place geometry:', place.geometry)
        console.log('📍 AddressAutocomplete: Place location:', place.geometry?.location)
        
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const locationData = {
            address: place.formatted_address || '',
            lat: lat,
            lng: lng
          }
          console.log('🎯 AddressAutocomplete: Extracted coordinates:', { lat, lng })
          console.log('🎯 AddressAutocomplete: Calling stableOnSelect with:', locationData)
          stableOnSelect(locationData)
          setError(null)
        } else {
          const errorMsg = 'Please select a valid address from the suggestions'
          console.error('❌ AddressAutocomplete:', errorMsg)
          console.error('❌ AddressAutocomplete: Place data:', place)
          setError(errorMsg)
        }
      })

      return () => {
        console.log('🧹 AddressAutocomplete: Cleaning up...')
        if (window.google && window.google.maps && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(autocomplete)
        }
      }
    } catch (err) {
      console.error('❌ AddressAutocomplete: Error initializing autocomplete:', err)
      setError('Failed to initialize address autocomplete')
    }
  }, [isLoaded, stableOnSelect])

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
        onClick={() => console.log('🖱️ AddressAutocomplete: Input clicked')}
        onFocus={() => console.log('🎯 AddressAutocomplete: Input focused via React')}
        onBlur={() => console.log('🎯 AddressAutocomplete: Input blurred via React')}
        onChange={(e) => console.log('⌨️ AddressAutocomplete: Input changed via React:', e.target.value)}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {/* Debug button to test coordinate extraction */}
      <button 
        type="button"
        onClick={() => {
          console.log('🧪 Debug: Testing coordinate extraction with hardcoded values')
          const testLocation = {
            address: '1999 Mowry Ave, Fremont, CA 94538, USA',
            lat: 37.5444,
            lng: -121.9882
          }
          console.log('🧪 Debug: Calling stableOnSelect with test data:', testLocation)
          stableOnSelect(testLocation)
        }}
        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        Test Coordinate Extraction
      </button>
    </div>
  )
} 