/**
 * Company Spaces Feature - Type Definitions
 * 
 * These types define the data structures for the Company Spaces feature,
 * which allows users to carpool within their company in addition to personal use.
 * 
 * All types are designed to be backward compatible with existing code.
 */

/**
 * Represents a company/organization that can have company spaces
 */
export interface Company {
  id: string;
  name: string;
  slug: string; // URL-safe identifier (lowercase, alphanumeric + hyphens)
  primary_domain: string; // e.g., 'amazon.com'
  additional_domains?: string[]; // e.g., ['amazon.co.uk', 'amzn.com']
  logo_url?: string; // Optional branding
  settings: CompanySettings;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Company-specific settings stored as JSONB in the database
 */
export interface CompanySettings {
  require_invite_code: boolean; // Default: false
  allow_cross_site_matching: boolean; // Default: true
  default_timezone: string; // Default: "UTC"
  estimated_avg_commute_distance_km: number; // Default: 10
  emission_factor_kg_co2_per_km: number; // Default: 0.2
}

/**
 * Represents a physical company location (office, warehouse, campus)
 */
export interface Site {
  id: string;
  company_id: string;
  name: string; // e.g., 'SJC14 Warehouse'
  code?: string; // Short identifier, e.g., 'SJC14'
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string; // e.g., 'America/Los_Angeles'
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a user's membership in a company
 */
export interface CompanyMembership {
  id: string;
  company_id: string;
  company_name: string;
  company_slug: string;
  role: 'employee' | 'site_admin' | 'company_admin';
  status: 'active' | 'pending' | 'invited' | 'inactive';
  site?: {
    id: string;
    name: string;
    code?: string;
    timezone?: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Response from GET /api/me/company endpoint
 */
export interface CompanyMembershipsResponse {
  memberships: CompanyMembership[];
}

/**
 * Company-wide analytics (admin only)
 */
export interface CompanyStats {
  company_id: string;
  name: string;
  total_users: number;
  active_users_last_30d: number;
  total_carpools: number;
  active_carpools: number;
  rides_last_30d: number;
  miles_saved_last_30d: number;
  co2_saved_last_30d_kg: number;
}

/**
 * Site-specific analytics (admin only)
 */
export interface SiteStats extends CompanyStats {
  site_id: string;
  site_name: string;
  site_code?: string;
}

/**
 * Adoption breakdown by site (admin only)
 */
export interface CompanyAdoption {
  sites: {
    site_id: string;
    site_name: string;
    site_code?: string;
    users_onboarded: number;
    active_users_last_30d: number;
    carpools: number;
    rides_last_30d: number;
  }[];
}

/**
 * Scope type - determines whether request is personal or company-scoped
 * 
 * This is the core type that determines data isolation:
 * - Personal scope: company_id IS NULL (default behavior)
 * - Company scope: company_id = <uuid> (requires active membership)
 */
export type Scope = 
  | { type: 'personal' }
  | { type: 'company'; companyId: string; siteId?: string };

/**
 * Response from PUT /api/me/company-site endpoint
 */
export interface UpdateCompanySiteResponse {
  company_id: string;
  site_id: string | null;
  updated_at: string;
}

