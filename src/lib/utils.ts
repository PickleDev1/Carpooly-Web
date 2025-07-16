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
   * Check location permission using actual location request test
   */
  async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    console.log('📍 [PERMISSION DEBUG] Starting standard permission check')
    
    if (typeof window === 'undefined') {
      return 'unknown'
    }
    
    if (!navigator.geolocation) {
      return 'unknown'
    }

    // First try the Permissions API if available
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        console.log('📍 [PERMISSION DEBUG] Permissions API result:', result.state)
        
        // If explicitly denied, return denied
        if (result.state === 'denied') {
          return 'denied'
        }
        
        // If granted, test with actual location request to verify
        if (result.state === 'granted') {
          try {
            // Test with a quick location request to verify permission is actually working
            await this.requestLocation()
            console.log('📍 [PERMISSION DEBUG] Permission verified with location request')
            return 'granted'
          } catch (error) {
            console.log('📍 [PERMISSION DEBUG] Permission API said granted but location request failed:', error)
            // If the location request fails despite "granted" permission, 
            // this indicates a permission issue (common on iOS Safari)
            return 'denied'
          }
        }
        
        // If prompt, return prompt
        return result.state
      } catch (err) {
        console.error('📍 [PERMISSION DEBUG] Error checking geolocation permission:', err)
        // Fall through to actual location test
      }
    }

    // Fallback: test with actual location request
    try {
      console.log('📍 [PERMISSION DEBUG] Testing permission with actual location request')
      await this.requestLocation()
      console.log('📍 [PERMISSION DEBUG] Location request successful, permission granted')
      return 'granted'
    } catch (error) {
      console.log('📍 [PERMISSION DEBUG] Location request failed, checking error type:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('denied') || error.message.includes('Permission denied')) {
          return 'denied'
        } else if (error.message.includes('timeout')) {
          // Timeout might indicate permission issues on some devices
          return 'prompt'
        }
      }
      
      // For other errors, assume we can prompt
      return 'prompt'
    }
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

/**
 * Life360-inspired location strategies for iOS Safari compatibility
 */
export const Life360LocationUtils = {
  /**
   * Progressive permission request - start gentle, escalate if needed
   */
  async requestPermissionProgressive(): Promise<'granted' | 'denied' | 'prompt'> {
    console.log('📍 [LIFE360 DEBUG] Starting progressive permission request')
    
    // Step 1: Try gentle request first
    try {
      const gentleOptions = {
        enableHighAccuracy: false, // Start with low accuracy
        timeout: 5000, // Shorter timeout
        maximumAge: 30000 // Accept older positions
      }
      
      const position = await this.requestLocationWithOptions(gentleOptions)
      console.log('📍 [LIFE360 DEBUG] Gentle request successful')
      return 'granted'
    } catch (error) {
      console.log('📍 [LIFE360 DEBUG] Gentle request failed, trying standard request')
    }
    
    // Step 2: Try standard request
    try {
      const position = await iOSLocationUtils.requestLocation()
      console.log('📍 [LIFE360 DEBUG] Standard request successful')
      return 'granted'
    } catch (error) {
      console.log('📍 [LIFE360 DEBUG] Standard request failed, trying high accuracy')
    }
    
    // Step 3: Try high accuracy request
    try {
      const highAccuracyOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
      
      const position = await this.requestLocationWithOptions(highAccuracyOptions)
      console.log('📍 [LIFE360 DEBUG] High accuracy request successful')
      return 'granted'
    } catch (error) {
      console.log('📍 [LIFE360 DEBUG] All location requests failed')
      
      if (error instanceof Error && error.message.includes('denied')) {
        return 'denied'
      }
      
      return 'prompt'
    }
  },

  /**
   * Request location with custom options
   */
  requestLocationWithOptions(options: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not available'))
        return
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timed out'))
      }, (options.timeout || 10000) + 2000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          resolve(position)
        },
        (error) => {
          clearTimeout(timeoutId)
          const errorMessage = iOSLocationUtils.getErrorMessage(error)
          reject(new Error(errorMessage))
        },
        options
      )
    })
  },

  /**
   * Get approximate location from IP (fallback method)
   */
  async getApproximateLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    console.log('📍 [LIFE360 DEBUG] Getting approximate location from IP')
    
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.latitude && data.longitude) {
        console.log('📍 [LIFE360 DEBUG] IP-based location obtained:', {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 5000 // IP-based location is approximate
        })
        
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          accuracy: 5000
        }
      }
      
      throw new Error('Could not get location from IP')
    } catch (error) {
      console.error('📍 [LIFE360 DEBUG] IP-based location failed:', error)
      throw new Error('Could not determine approximate location')
    }
  },

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    console.log('📍 [LIFE360 DEBUG] Geocoding address:', address)
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        throw new Error('Google Maps API key not available')
      }
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      )
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        console.log('📍 [LIFE360 DEBUG] Address geocoded successfully:', location)
        
        return {
          latitude: location.lat,
          longitude: location.lng
        }
      }
      
      throw new Error('Address not found')
    } catch (error) {
      console.error('📍 [LIFE360 DEBUG] Address geocoding failed:', error)
      throw new Error('Could not find location for this address')
    }
  },

  /**
   * Get location with multiple fallback strategies
   */
  async getLocationWithFallbacks(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    source: 'gps' | 'ip' | 'manual';
  }> {
    console.log('📍 [LIFE360 DEBUG] Getting location with fallbacks')
    
    // Try GPS first
    try {
      const position = await iOSLocationUtils.requestLocation()
      console.log('📍 [LIFE360 DEBUG] GPS location obtained')
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 10,
        source: 'gps'
      }
    } catch (error) {
      console.log('📍 [LIFE360 DEBUG] GPS failed, trying IP-based location')
    }
    
    // Try IP-based location
    try {
      const ipLocation = await this.getApproximateLocation()
      console.log('📍 [LIFE360 DEBUG] IP-based location obtained')
      
      return {
        ...ipLocation,
        source: 'ip'
      }
    } catch (error) {
      console.log('📍 [LIFE360 DEBUG] IP-based location failed')
    }
    
    // If all else fails, throw error
    throw new Error('Could not determine location. Please try enabling location services or enter your location manually.')
  },

  /**
   * Check if device supports PWA installation
   */
  isPWAInstallable(): boolean {
    if (typeof window === 'undefined') return false
    
    // Check for iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    // Check for standalone mode (already installed as PWA)
    const isStandalone = (window.navigator as any).standalone === true
    
    // Check for beforeinstallprompt event support
    const hasBeforeInstallPrompt = 'onbeforeinstallprompt' in window
    
    return (isIOS && isSafari) || isStandalone || hasBeforeInstallPrompt
  },

  /**
   * Get PWA installation instructions
   */
  getPWAInstallInstructions(): string[] {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    if (isIOS && isSafari) {
      return [
        'Tap the Share button (square with arrow)',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install the app',
        'Open the app from your home screen for better location access'
      ]
    }
    
    return [
      'Look for the install button in your browser address bar',
      'Or go to your browser menu and select "Install App"',
      'Install the app for better location access'
    ]
  }
} 

/**
 * Safari-specific location utilities for iOS Safari quirks
 */
export const SafariLocationUtils = {
  /**
   * Check if we're running in Safari on iOS
   */
  isIOSSafari(): boolean {
    if (typeof window === 'undefined') return false
    
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
    
    return isIOS && isSafari
  },

  /**
   * Check if we're running as a PWA on iOS
   */
  isPWAMode(): boolean {
    if (typeof window === 'undefined') return false
    
    // Check for PWA indicators
    const isStandalone = (window.navigator as any).standalone === true
    const hasDisplayMode = window.matchMedia('(display-mode: standalone)').matches
    
    return isStandalone || hasDisplayMode
  },

  /**
   * Safari-specific permission check with workarounds
   */
  async checkSafariPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
    console.log('📍 [SAFARI DEBUG] Starting Safari-specific permission check')
    
    if (!this.isIOSSafari()) {
      console.log('📍 [SAFARI DEBUG] Not iOS Safari, using standard check')
      return iOSLocationUtils.checkLocationPermission()
    }

    // Safari-specific permission checking
    try {
      // First, try to clear any cached permission state
      await this.clearSafariPermissionCache()
      
      // Try a gentle location request first
      const gentleOptions = {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 60000 // Accept very old positions
      }
      
      const position = await this.requestLocationWithOptions(gentleOptions)
      console.log('📍 [SAFARI DEBUG] Gentle location request successful')
      return 'granted'
      
    } catch (error) {
      console.log('📍 [SAFARI DEBUG] Gentle request failed:', error)
      
      // Check if it's a permission error
      if (error instanceof Error && error.message.includes('denied')) {
        return 'denied'
      }
      
      // For other errors, we might need user interaction
      return 'prompt'
    }
  },

  /**
   * Clear Safari's permission cache by making a test request
   */
  async clearSafariPermissionCache(): Promise<void> {
    console.log('📍 [SAFARI DEBUG] Clearing Safari permission cache')
    
    try {
      // Make a very quick test request to reset Safari's internal state
      const testOptions = {
        enableHighAccuracy: false,
        timeout: 1000,
        maximumAge: 300000 // 5 minutes
      }
      
      await this.requestLocationWithOptions(testOptions)
    } catch (error) {
      // Expected to fail, this is just to clear the cache
      console.log('📍 [SAFARI DEBUG] Cache clearing test completed')
    }
  },

  /**
   * Request location with Safari-specific optimizations
   */
  async requestSafariLocation(): Promise<GeolocationPosition> {
    console.log('📍 [SAFARI DEBUG] Starting Safari-specific location request')
    
    if (!this.isIOSSafari()) {
      console.log('📍 [SAFARI DEBUG] Not iOS Safari, using standard request')
      return iOSLocationUtils.requestLocation()
    }

    // Safari-specific location request strategy
    const strategies = [
      // Strategy 1: Low accuracy, short timeout (most likely to work)
      {
        name: 'gentle',
        options: { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
      },
      // Strategy 2: Standard accuracy
      {
        name: 'standard',
        options: { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      },
      // Strategy 3: High accuracy, longer timeout
      {
        name: 'high-accuracy',
        options: { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      }
    ]

    for (const strategy of strategies) {
      try {
        console.log('📍 [SAFARI DEBUG] Trying strategy:', strategy.name)
        const position = await this.requestLocationWithOptions(strategy.options)
        console.log('📍 [SAFARI DEBUG] Strategy successful:', strategy.name)
        return position
      } catch (error) {
        console.log('📍 [SAFARI DEBUG] Strategy failed:', strategy.name, error)
        
        // If it's a permission error, don't try other strategies
        if (error instanceof Error && error.message.includes('denied')) {
          throw error
        }
        
        // Wait before trying next strategy
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    throw new Error('All Safari location strategies failed')
  },

  /**
   * Request location with custom options (Safari-optimized)
   */
  requestLocationWithOptions(options: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not available'))
        return
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timed out'))
      }, (options.timeout || 10000) + 1000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          resolve(position)
        },
        (error) => {
          clearTimeout(timeoutId)
          const errorMessage = this.getSafariErrorMessage(error)
          reject(new Error(errorMessage))
        },
        options
      )
    })
  },

  /**
   * Safari-specific error messages
   */
  getSafariErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. On iOS Safari, try: 1) Refresh the page, 2) Install as PWA, or 3) Use Chrome instead.'
      case error.POSITION_UNAVAILABLE:
        return 'Location unavailable. Please check your device location settings.'
      case error.TIMEOUT:
        return 'Location request timed out. This is common on iOS Safari. Try refreshing or installing as PWA.'
      default:
        return 'Failed to get location on iOS Safari.'
    }
  },

  /**
   * Get Safari-specific help text
   */
  getSafariHelpText(): string[] {
    return [
      'iOS Safari has known location permission issues. Here are solutions:',
      '1. Refresh the page and try again',
      '2. Install this app as a PWA (Add to Home Screen)',
      '3. Use Chrome or Firefox instead',
      '4. Check Settings > Safari > Location > Allow',
      '5. Try enabling "Precise Location" in iOS Settings'
    ]
  },

  /**
   * Check if location request requires user interaction
   */
  requiresUserInteraction(): boolean {
    return this.isIOSSafari() && !this.isPWAMode()
  },

  /**
   * Get recommended action for Safari users
   */
  getRecommendedAction(): 'refresh' | 'install-pwa' | 'use-chrome' | 'none' {
    if (!this.isIOSSafari()) return 'none'
    
    if (this.isPWAMode()) return 'none'
    
    // If not in PWA mode, recommend PWA installation
    return 'install-pwa'
  }
} 