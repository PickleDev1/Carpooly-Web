import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Comprehensive device compatibility check for location tracking
 */
export const LocationCompatibility = {
  /**
   * Check if location tracking is supported on this device/browser
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false
    
    // Check for geolocation support
    if (!navigator.geolocation) {
      console.log('📍 Geolocation not supported')
      return false
    }

    // Check for HTTPS (required for geolocation in modern browsers)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.log('📍 HTTPS required for geolocation')
      return false
    }

    return true
  },

  /**
   * Get detailed compatibility information
   */
  getCompatibilityInfo() {
    const info = {
      geolocationSupported: typeof navigator !== 'undefined' && !!navigator.geolocation,
      permissionsSupported: typeof navigator !== 'undefined' && !!navigator.permissions,
      isHTTPS: typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost'),
      isIOS: isIOSDevice(),
      isMobile: isMobileDevice(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    }

    console.log('📍 Device compatibility info:', info)
    return info
  },

  /**
   * Get recommended settings for this device
   */
  getRecommendedSettings() {
    const isIOS = isIOSDevice()
    const isMobile = isMobileDevice()

    return {
      timeout: isIOS ? 15000 : 10000,
      maximumAge: isIOS ? 10000 : 5000,
      enableHighAccuracy: true,
      retryAttempts: isIOS ? 3 : 2,
      retryDelay: isIOS ? 2000 : 1000
    }
  }
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return true;
  }
  
  // Android detection
  if (/android/i.test(userAgent)) {
    return true;
  }
  
  // Mobile detection
  if (/Mobi|Android/i.test(userAgent)) {
    return true;
  }
  
  // Check screen size
  if (window.innerWidth <= 768) {
    return true;
  }
  
  return false;
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Primary iOS detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  
  // Additional check for iOS Safari specifically
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isIOSSafari = isIOS && isSafari;
  
  // Also check for iOS WebKit
  const isIOSWebKit = /iPad|iPhone|iPod/.test(userAgent) && /WebKit/.test(userAgent) && !/Chrome/.test(userAgent);
  
  return isIOS || isIOSSafari || isIOSWebKit;
}

/**
 * iOS-specific location permission utilities
 */
export const iOSLocationUtils = {
  /**
   * Get standard geolocation options (same for all devices)
   */
  getGeolocationOptions() {
    return {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }
  },

  /**
   * Get standard error message for geolocation errors
   */
  getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please allow location access in your browser settings.'
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable.'
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.'
      default:
        return 'Failed to get your location.'
    }
  },

  /**
   * Check location permission using standard approach
   */
  async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    console.log('📍 [PERMISSION DEBUG] Starting standard permission check')
    
    if (typeof window === 'undefined') {
      return 'unknown'
    }
    
    if (!navigator.geolocation) {
      return 'unknown'
    }

    // Use standard permissions API if available
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        return result.state
      } catch (err) {
        console.error('📍 [PERMISSION DEBUG] Error checking geolocation permission:', err)
        return 'prompt'
      }
    }

    // Fallback: assume we can prompt
    return 'prompt'
  },

  /**
   * Request location using standard approach (no iOS-specific workarounds)
   */
  requestLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      console.log('📍 [LOCATION DEBUG] Starting standard location request')
      
      if (typeof window === 'undefined') {
        reject(new Error('Geolocation not available in server environment'))
        return
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      const options = this.getGeolocationOptions()
      console.log('📍 [LOCATION DEBUG] Requesting location with options:', options)

      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timed out'))
      }, options.timeout + 2000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          console.log('📍 [LOCATION DEBUG] Location request successful')
          
          // Validate position data
          if (!position || !position.coords) {
            reject(new Error('Invalid position data received'))
            return
          }

          // Validate coordinates
          if (isNaN(position.coords.latitude) || isNaN(position.coords.longitude)) {
            reject(new Error('Invalid coordinates received'))
            return
          }

          // Check coordinate bounds
          if (position.coords.latitude < -90 || position.coords.latitude > 90 ||
              position.coords.longitude < -180 || position.coords.longitude > 180) {
            reject(new Error('Coordinates out of valid range'))
            return
          }

          console.log('📍 [LOCATION DEBUG] Location obtained successfully:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          resolve(position)
        },
        (error) => {
          clearTimeout(timeoutId)
          console.log('📍 [LOCATION DEBUG] Location request failed:', error.message)
          const errorMessage = this.getErrorMessage(error)
          reject(new Error(errorMessage))
        },
        options
      )
    })
  },

  /**
   * Simple location request with one retry (standard approach)
   */
  async requestLocationWithRetry(maxAttempts: number = 2): Promise<GeolocationPosition> {
    console.log('📍 [LOCATION DEBUG] Starting location request with retry')
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log('📍 [LOCATION DEBUG] Location request attempt', attempt, 'of', maxAttempts)
      
      try {
        const position = await this.requestLocation()
        console.log('📍 [LOCATION DEBUG] Location request successful on attempt', attempt)
        return position
      } catch (error) {
        console.error('📍 [LOCATION DEBUG] Location request failed on attempt', attempt, ':', error)
        
        if (attempt === maxAttempts) {
          throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    throw new Error('Location request failed after all attempts')
  },

  /**
   * Get standard help text for location issues
   */
  getHelpText() {
    return 'To use location features, please allow location access when prompted by your browser. If you have previously denied access, you can change this in your browser settings.'
  }
}

/**
 * Comprehensive email validation function
 * Validates email format and common patterns
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  // Check if email is empty
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email address is required' };
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check for common invalid patterns
  const invalidPatterns = [
    /^[^@]+@[^@]+$/, // Must have @ symbol
    /^[^@]*@[^@]*$/, // Must have domain after @
    /^[^@]+@[^@]+\.[^@]+$/, // Must have TLD after domain
  ];

  for (const pattern of invalidPatterns) {
    if (!pattern.test(trimmedEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
  }

  // Check for common invalid domains
  const invalidDomains = [
    'example.com',
    'test.com',
    'localhost',
    'invalid.com',
    'fake.com',
    'dummy.com'
  ];

  const domain = trimmedEmail.split('@')[1]?.toLowerCase();
  if (domain && invalidDomains.includes(domain)) {
    return { isValid: false, error: 'Please enter a real email address' };
  }

  // Check for suspicious patterns
  if (trimmedEmail.includes('..') || trimmedEmail.includes('--')) {
    return { isValid: false, error: 'Email address contains invalid characters' };
  }

  // Check length limits
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  const localPart = trimmedEmail.split('@')[0];
  if (localPart && localPart.length > 64) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
} 

// Reverse geocoding function to convert coordinates to address
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    console.log('🌍 Reverse geocoding coordinates:', latitude, longitude)
    
    // Use server-side API route to avoid referer restrictions
    const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)
    
    console.log('🌍 Response status:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('🌍 Response error:', errorText)
      throw new Error(`Failed to fetch address: ${response.status}`)
    }

    const data = await response.json()
    console.log('🌍 Geocoding response:', data)

    if (data.address) {
      console.log('🌍 Found address:', data.address)
      return data.address
    } else {
      console.warn('🌍 No address found for coordinates:', latitude, longitude)
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }
  } catch (error) {
    console.error('🌍 Reverse geocoding error:', error)
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }
}

// Cache for reverse geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, string>()

export async function reverseGeocodeWithCache(latitude: number, longitude: number): Promise<string> {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!
  }

  const address = await reverseGeocode(latitude, longitude)
  geocodeCache.set(cacheKey, address)
  
  return address
} 