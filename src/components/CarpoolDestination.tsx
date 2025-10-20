'use client'

import { useState, useEffect } from 'react'
import { formatDestinationAddress } from '@/utils/geocoding'

interface CarpoolDestinationProps {
  destinationAddress: string;
  className?: string;
  fallback?: string;
}

export function CarpoolDestination({ 
  destinationAddress, 
  className = '',
  fallback = 'Unknown Destination'
}: CarpoolDestinationProps) {
  const [formattedAddress, setFormattedAddress] = useState<string>(destinationAddress)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const geocodeDestination = async () => {
      // If it's already a readable address, don't geocode
      if (/[a-zA-Z]/.test(destinationAddress) && !destinationAddress.includes(',')) {
        setFormattedAddress(destinationAddress)
        return
      }

      // If it looks like coordinates, geocode them
      const coordMatch = destinationAddress.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
      if (coordMatch) {
        setLoading(true)
        setError(null)

        try {
          const result = await formatDestinationAddress(destinationAddress)
          setFormattedAddress(result)
        } catch (err) {
          console.error('Geocoding error:', err)
          setError(err instanceof Error ? err.message : 'Geocoding failed')
          setFormattedAddress(destinationAddress) // Fallback to original
        } finally {
          setLoading(false)
        }
      } else {
        // Not coordinates, use as-is
        setFormattedAddress(destinationAddress)
      }
    }

    geocodeDestination()
  }, [destinationAddress])

  if (loading) {
    return (
      <span className={`${className} text-gray-500`}>
        Loading address...
      </span>
    )
  }

  if (error) {
    console.warn('Geocoding failed for destination:', destinationAddress, error)
  }

  return (
    <span className={className} title={error ? `Geocoding failed: ${error}` : undefined}>
      {formattedAddress || fallback}
    </span>
  )
}
