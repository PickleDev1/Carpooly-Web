/**
 * Company Error Handling Utilities
 * 
 * Provides utilities for handling company-specific error codes
 * returned by the backend API.
 * 
 * All error codes are documented in the backend blueprint.
 */

/**
 * Company-specific error codes from backend
 */
export enum CompanyErrorCode {
  // Validation errors (400)
  MISSING_CARPOOL_NAME = 'MISSING_CARPOOL_NAME',
  EMPTY_CARPOOL_NAME = 'EMPTY_CARPOOL_NAME',
  INVALID_CARPOOL_NAME = 'INVALID_CARPOOL_NAME',
  MISSING_COMPANY_ID = 'MISSING_COMPANY_ID',
  INVALID_COMPANY_ID = 'INVALID_COMPANY_ID',
  INVALID_SITE_ID = 'INVALID_SITE_ID',
  SITE_NOT_SELECTED = 'SITE_NOT_SELECTED',
  
  // Authorization errors (403)
  MISSING_COMPANY_MEMBERSHIP = 'MISSING_COMPANY_MEMBERSHIP',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Not found errors (404)
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
  SITE_NOT_FOUND = 'SITE_NOT_FOUND',
}

/**
 * Error response format from backend
 */
export interface CompanyErrorResponse {
  error: string;
  message: string;
  code?: string;
  field?: string;
  company_id?: string;
}

/**
 * User-friendly error messages mapped to error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  [CompanyErrorCode.MISSING_CARPOOL_NAME]: 'Carpool name is required',
  [CompanyErrorCode.EMPTY_CARPOOL_NAME]: 'Carpool name cannot be empty',
  [CompanyErrorCode.INVALID_CARPOOL_NAME]: 'Carpool name must be 255 characters or less',
  [CompanyErrorCode.MISSING_COMPANY_ID]: 'Company ID is required when using company scope',
  [CompanyErrorCode.INVALID_COMPANY_ID]: 'Invalid company ID format',
  [CompanyErrorCode.INVALID_SITE_ID]: 'Invalid site ID or site does not belong to this company',
  [CompanyErrorCode.SITE_NOT_SELECTED]: 'Please select your site to enable company matching',
  [CompanyErrorCode.MISSING_COMPANY_MEMBERSHIP]: 'You are not a member of this company',
  [CompanyErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action',
  [CompanyErrorCode.COMPANY_NOT_FOUND]: 'Company not found',
  [CompanyErrorCode.SITE_NOT_FOUND]: 'Site not found',
}

/**
 * Get user-friendly error message for a company error code
 */
export function getCompanyErrorMessage(errorCode: string, defaultMessage?: string): string {
  return ERROR_MESSAGES[errorCode] || defaultMessage || 'An error occurred'
}

/**
 * Check if an error is a company-specific error
 */
export function isCompanyError(error: any): error is CompanyErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    'message' in error
  )
}

/**
 * Extract error code from error response
 */
export function getErrorCode(error: any): string | null {
  if (isCompanyError(error)) {
    return error.code || error.error || null
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String(error.code)
  }
  return null
}

/**
 * Get user-friendly error message from error response
 */
export function getErrorMessage(error: any): string {
  if (isCompanyError(error)) {
    const code = error.code || error.error
    if (code) {
      return getCompanyErrorMessage(code, error.message)
    }
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

/**
 * Check if error requires site selection
 */
export function requiresSiteSelection(error: any): boolean {
  const code = getErrorCode(error)
  return code === CompanyErrorCode.SITE_NOT_SELECTED
}

/**
 * Check if error is a membership error
 */
export function isMembershipError(error: any): boolean {
  const code = getErrorCode(error)
  return code === CompanyErrorCode.MISSING_COMPANY_MEMBERSHIP
}

/**
 * Check if error is a permissions error
 */
export function isPermissionsError(error: any): boolean {
  const code = getErrorCode(error)
  return code === CompanyErrorCode.INSUFFICIENT_PERMISSIONS
}

/**
 * Format error for display to user
 */
export function formatCompanyError(error: any): {
  message: string;
  code: string | null;
  requiresAction: boolean;
  actionType?: 'select_site' | 'join_company' | 'request_permission';
} {
  const code = getErrorCode(error)
  const message = getErrorMessage(error)
  
  let requiresAction = false
  let actionType: 'select_site' | 'join_company' | 'request_permission' | undefined

  if (code === CompanyErrorCode.SITE_NOT_SELECTED) {
    requiresAction = true
    actionType = 'select_site'
  } else if (code === CompanyErrorCode.MISSING_COMPANY_MEMBERSHIP) {
    requiresAction = true
    actionType = 'join_company'
  } else if (code === CompanyErrorCode.INSUFFICIENT_PERMISSIONS) {
    requiresAction = true
    actionType = 'request_permission'
  }

  return {
    message,
    code,
    requiresAction,
    actionType,
  }
}

