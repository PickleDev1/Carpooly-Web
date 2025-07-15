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
   * Get iOS-specific geolocation options
   */
  getGeolocationOptions() {
    const baseOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }

    if (isIOSDevice()) {
      return {
        ...baseOptions,
        timeout: 15000, // Longer timeout for iOS
        maximumAge: 10000 // Allow slightly older cached locations on iOS
      }
    }

    return baseOptions
  },

  /**
   * Get iOS-specific error message for geolocation errors
   */
  getErrorMessage(error: GeolocationPositionError): string {
    if (!isIOSDevice()) {
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
    }

    // iOS-specific error messages with more detailed guidance
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please go to Settings → Safari → Location → Allow for this website, then refresh the page.'
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable. Please check that Location Services are enabled in Settings → Privacy & Security → Location Services.'
      case error.TIMEOUT:
        return 'Location request timed out. This can happen on iOS when GPS signal is weak. Please try again or move to an area with better GPS reception.'
      default:
        return 'Unable to get your location. Please check your device settings and try again.'
    }
  },

  /**
   * Check if location permission is available and handle iOS-specific cases
   */
  async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    console.log('📍 [PERMISSION DEBUG] Starting permission check at:', new Date().toISOString())
    
    if (typeof window === 'undefined') {
      console.log('📍 [PERMISSION DEBUG] Window undefined - server side')
      return 'unknown'
    }
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('📍 [PERMISSION DEBUG] Geolocation not supported')
      return 'unknown'
    }

    // For iOS devices, the permissions API is unreliable
    // We need to use a more robust approach
    if (isIOSDevice()) {
      console.log('📍 [PERMISSION DEBUG] iOS device detected - using enhanced permission check')
      const result = await this.checkIOSPermission()
      console.log('📍 [PERMISSION DEBUG] iOS permission check result:', result)
      return result
    }

    // Check if permissions API is available for non-iOS devices
    if (!navigator.permissions) {
      console.log('📍 [PERMISSION DEBUG] Permissions API not available - will check via geolocation request')
      return 'prompt'
    }

    try {
      console.log('📍 [PERMISSION DEBUG] Using Permissions API for non-iOS device')
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      console.log('📍 [PERMISSION DEBUG] Permissions API result:', result.state)
      return result.state
    } catch (err) {
      console.error('📍 [PERMISSION DEBUG] Error checking geolocation permission:', err)
      // If permissions API fails, assume we need to prompt
      return 'prompt'
    }
  },

  /**
   * Enhanced permission checking specifically for iOS devices
   * iOS has unreliable permissions API, so we need to be more careful
   */
  async checkIOSPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    return new Promise((resolve) => {
      const startTime = Date.now()
      console.log('📍 [iOS DEBUG] Starting iOS permission check at:', new Date().toISOString())
      console.log('📍 [iOS DEBUG] User agent:', navigator.userAgent)
      console.log('📍 [iOS DEBUG] Geolocation available:', !!navigator.geolocation)
      console.log('📍 [iOS DEBUG] Permissions API available:', !!navigator.permissions)
      
      // Use a very short timeout to quickly determine permission status
      const options = {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 0
      }
      
      console.log('📍 [iOS DEBUG] Using geolocation options:', options)

      const timeoutId = setTimeout(() => {
        const elapsed = Date.now() - startTime
        console.log('📍 [iOS DEBUG] iOS permission check timed out after', elapsed, 'ms - likely denied or prompt')
        console.log('📍 [iOS DEBUG] Resolving as: prompt')
        resolve('prompt')
      }, 3500)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          const elapsed = Date.now() - startTime
          console.log('📍 [iOS DEBUG] iOS permission check successful after', elapsed, 'ms')
          console.log('📍 [iOS DEBUG] Position received:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          })
          console.log('📍 [iOS DEBUG] Resolving as: granted')
          resolve('granted')
        },
        (error) => {
          clearTimeout(timeoutId)
          const elapsed = Date.now() - startTime
          console.log('📍 [iOS DEBUG] iOS permission check failed after', elapsed, 'ms')
          console.log('📍 [iOS DEBUG] Error details:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT
          })
          
          let resolution: 'granted' | 'denied' | 'prompt' | 'unknown' = 'prompt'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('📍 [iOS DEBUG] iOS permission explicitly denied')
              resolution = 'denied'
              break
            case error.POSITION_UNAVAILABLE:
              console.log('📍 [iOS DEBUG] iOS position unavailable - likely permission issue')
              resolution = 'prompt'
              break
            case error.TIMEOUT:
              console.log('📍 [iOS DEBUG] iOS permission check timed out')
              resolution = 'prompt'
              break
            default:
              console.log('📍 [iOS DEBUG] iOS permission check unknown error code:', error.code)
              resolution = 'prompt'
          }
          
          console.log('📍 [iOS DEBUG] Resolving as:', resolution)
          resolve(resolution)
        },
        options
      )
    })
  },

  /**
   * Request location with iOS-specific handling
   */
  requestLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      console.log('📍 [LOCATION DEBUG] Starting location request at:', new Date().toISOString())
      console.log('📍 [LOCATION DEBUG] Is iOS device:', isIOSDevice())
      
      if (typeof window === 'undefined') {
        console.log('📍 [LOCATION DEBUG] Window undefined - server side')
        reject(new Error('Geolocation not available in server environment'))
        return
      }

      if (!navigator.geolocation) {
        console.log('📍 [LOCATION DEBUG] Geolocation not supported')
        reject(new Error('Geolocation not supported'))
        return
      }

      const options = this.getGeolocationOptions()
      console.log('📍 [LOCATION DEBUG] Requesting location with options:', options)
      console.log('📍 [LOCATION DEBUG] User agent:', navigator.userAgent)

      // Add timeout safety
      const timeoutId = setTimeout(() => {
        const elapsed = Date.now() - startTime
        console.log('📍 [LOCATION DEBUG] Location request timed out after', elapsed, 'ms')
        reject(new Error('Location request timed out'))
      }, options.timeout + 2000) // Add 2 seconds buffer

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          const elapsed = Date.now() - startTime
          console.log('📍 [LOCATION DEBUG] Location request successful after', elapsed, 'ms')
          
          // Validate position data
          if (!position || !position.coords) {
            console.log('📍 [LOCATION DEBUG] Invalid position data received:', position)
            reject(new Error('Invalid position data received'))
            return
          }

          // Validate coordinates
          if (isNaN(position.coords.latitude) || isNaN(position.coords.longitude)) {
            console.log('📍 [LOCATION DEBUG] Invalid coordinates received:', position.coords)
            reject(new Error('Invalid coordinates received'))
            return
          }

          // Check coordinate bounds
          if (position.coords.latitude < -90 || position.coords.latitude > 90 ||
              position.coords.longitude < -180 || position.coords.longitude > 180) {
            console.log('📍 [LOCATION DEBUG] Coordinates out of bounds:', position.coords)
            reject(new Error('Coordinates out of valid range'))
            return
          }

          console.log('📍 [LOCATION DEBUG] Location obtained successfully:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          })
          resolve(position)
        },
        (error) => {
          clearTimeout(timeoutId)
          const elapsed = Date.now() - startTime
          console.log('📍 [LOCATION DEBUG] Location request failed after', elapsed, 'ms')
          console.log('📍 [LOCATION DEBUG] Geolocation error details:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT
          })
          const errorMessage = this.getErrorMessage(error)
          console.log('📍 [LOCATION DEBUG] Resolved error message:', errorMessage)
          reject(new Error(errorMessage))
        },
        options
      )
    })
  },

  /**
   * Get iOS-specific help text for location permissions
   */
  getHelpText() {
    if (!isIOSDevice()) return null

    return {
      title: 'iOS Device Detected',
      description: 'Location features on iOS require explicit permission. You may need to allow location access when prompted.',
      steps: [
        'Go to Settings → Safari → Location',
        'Select "Allow" or "Ask" for this website',
        'Ensure Location Services are enabled in Settings → Privacy & Security → Location Services',
        'Refresh this page and try again'
      ]
    }
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