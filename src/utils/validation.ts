// Validation utilities for carpool naming feature

export const validateCarpoolName = (name: string): { isValid: boolean; error?: string } => {
  // Check if name exists and is not empty after trimming
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Carpool name is required' }
  }
  
  // Check length limit
  if (name.length > 255) {
    return { isValid: false, error: 'Carpool name must be 255 characters or less' }
  }
  
  return { isValid: true }
}

export const validateCarpoolSize = (size: number): { isValid: boolean; error?: string } => {
  if (size < 2) {
    return { isValid: false, error: 'Carpool size must be at least 2 people' }
  }
  
  if (size > 8) {
    return { isValid: false, error: 'Carpool size must be 8 people or less' }
  }
  
  return { isValid: true }
}
