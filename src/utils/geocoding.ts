/**
 * Geocoding utilities for converting coordinates to addresses
 */

import { useState, useEffect } from 'react'

export interface GeocodingResult {
  address: string;
  success: boolean;
  error?: string;
}

// Global variable to track if script is loading/loaded
let googleMapsScriptPromise: Promise<void> | null = null;

// Function to load Google Maps API script
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(); // Server-side rendering, no browser API
  }

  if (window.google?.maps?.Geocoder) {
    console.log('🌍 Google Maps API (Geocoder) already loaded.');
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    console.log('🌍 Google Maps API script already initiated, returning existing promise.');
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Define a global callback that resolves when the API is ready
    (window as any).initMap = () => {
      console.log('🌍 Google Maps API script loaded, waiting for Geocoder...');
      // Poll until Geocoder is available
      const checkGeocoder = () => {
        if (window.google?.maps?.Geocoder) {
          console.log('🌍 Google Maps Geocoder is now available.');
          resolve();
        } else {
          console.log('🌍 Google Maps Geocoder not yet available, polling...');
          setTimeout(checkGeocoder, 100); // Check again after 100ms
        }
      };
      checkGeocoder();
    };

    script.onerror = (e) => {
      console.error('🌍 Google Maps API script failed to load:', e);
      googleMapsScriptPromise = null; // Reset on error
      reject(e);
    };
    document.head.appendChild(script);
    console.log('🌍 Google Maps API script appended to head.');
  });

  return googleMapsScriptPromise;
};

/**
 * Reverse geocode coordinates to a human-readable address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with geocoding result
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  try {
    // Check if Google Maps is available
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.warn('Google Maps not available for geocoding')
      return {
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        success: false,
        error: 'Google Maps not available'
      }
    }

    const geocoder = new window.google.maps.Geocoder()
    
    return new Promise((resolve) => {
      console.log('🌍 reverseGeocode: Starting geocoding for:', lat, lng)
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          console.log('🌍 reverseGeocode: Geocoding status:', status)
          console.log('🌍 reverseGeocode: Results:', results)
          
          if (status === 'OK' && results && results[0]) {
            console.log('🌍 reverseGeocode: Success, address:', results[0].formatted_address)
            resolve({
              address: results[0].formatted_address,
              success: true
            })
          } else {
            console.warn('🌍 reverseGeocode: Geocoding failed:', status)
            resolve({
              address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              success: false,
              error: `Geocoding failed: ${status}`
            })
          }
        }
      )
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return {
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Parse coordinate string and reverse geocode if needed
 * @param destinationAddress - The destination address string (could be coordinates or address)
 * @returns Promise with formatted address
 */
export async function formatDestinationAddress(destinationAddress: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is not set.');
    return destinationAddress; // Fallback to original input
  }

  // Ensure Google Maps API is loaded and Geocoder is available
  try {
    await loadGoogleMapsScript(apiKey);
  } catch (error) {
    console.error('Failed to load Google Maps API script:', error);
    return destinationAddress; // Fallback if script loading fails
  }

  try {
    // Check if it's already a formatted address (contains letters) - but allow coordinates with "Carpool to" prefix
    if (/[a-zA-Z]/.test(destinationAddress) && !destinationAddress.includes(',')) {
      console.log('🌍 formatDestinationAddress: Already readable address, using as-is')
      return destinationAddress
    }

    // Check if it looks like coordinates (lat,lng format) - handle both pure coordinates and "Carpool to X,Y" format
    const coordMatch = destinationAddress.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1])
      const lng = parseFloat(coordMatch[2])
      
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('🌍 formatDestinationAddress: Geocoding coordinates:', lat, lng)
        console.log('🌍 formatDestinationAddress: Google Maps available:', !!window.google?.maps)
        console.log('🌍 formatDestinationAddress: Geocoder available:', !!window.google?.maps?.Geocoder)
        
        try {
          const result = await reverseGeocode(lat, lng)
          console.log('🌍 formatDestinationAddress: Geocoding result:', result)
          console.log('🌍 formatDestinationAddress: Success:', result.success)
          console.log('🌍 formatDestinationAddress: Address:', result.address)
          return result.address
        } catch (geocodingError) {
          console.error('🌍 formatDestinationAddress: Geocoding failed:', geocodingError)
          return destinationAddress
        }
      }
    }

    // If we can't parse it, return as-is
    return destinationAddress
  } catch (error) {
    console.error('Error formatting destination address:', error)
    return destinationAddress
  }
}

/**
 * Hook for geocoding coordinates to addresses
 * @param coordinates - Object with lat and lng
 * @returns Object with address, loading state, and error
 */
export function useGeocoding(coordinates: { lat: number; lng: number } | null) {
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coordinates) {
      setAddress('')
      return
    }

    setLoading(true)
    setError(null)

    reverseGeocode(coordinates.lat, coordinates.lng)
      .then((result) => {
        setAddress(result.address)
        if (!result.success) {
          setError(result.error || 'Geocoding failed')
        }
      })
      .catch((err) => {
        setError(err.message || 'Geocoding failed')
        setAddress(`${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [coordinates])

  return { address, loading, error }
}
