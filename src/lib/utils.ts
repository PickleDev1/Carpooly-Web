import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
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