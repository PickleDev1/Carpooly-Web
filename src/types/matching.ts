// Core matching domain types
export interface MatchingPreferences {
  id?: string; // NEW - surrogate primary key (added in backend Phase 2)
  user_id: string;
  max_detour_minutes: number;
  preferred_group_size: number;
  driver_preference: 'driver' | 'passenger' | 'flexible';
  schedule_flexibility_minutes: number;
  max_pickup_distance_miles: number;
  min_compatibility_score: number;
  // New required fields for destination-based matching
  destination_latitude: number;
  destination_longitude: number;
  destination_address?: string; // Human-readable address
  // New optional schedule fields
  arrival_time?: string; // HH:MM:SS format
  commute_days?: string[]; // ["mon","tue","wed","thu","fri"] etc.
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  user_demographics: {
    age_range: string;
    gender: string;
    occupation: string;
    student_status: string;
    company: string;
  };
  demographic_preferences: {
    age_preferences: string[];
    gender_preferences: string[];
    student_preference: string;
    occupation_preferences: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PotentialMatch {
  id: string;
  compatibility_score: number; // 0.0 to 1.0 (for calculations)
  compatibility_percentage: number; // 0 to 100 (for display)
  estimated_savings_per_month: number;
  match_reasons: string[];
  route_overlap_percentage: number; // 0 to 100
  schedule?: {
    departure_time: string;
    flexibility_minutes: number;
    frequency: string;
    compatibility_score?: number; // 0.0 to 1.0
    compatibility_percentage?: number; // 0 to 100 (for display)
  };
  total_distance_miles: number;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
  // Clerk ID for efficient API calls (preferred over UUID)
  user2_clerk_id?: string;
  user2: {
    id: string;
    clerk_id?: string;
    name: string;
    display_name: string | {
      String: string;
      Valid: boolean;
    };
    home_latitude: number;
    home_longitude: number;
    email?: string;
    // Legacy support (may still be present)
    home_location?: {
      lat: number;
      lng: number;
    };
    destination_location?: {
      lat: number;
      lng: number;
    };
    work_location?: {
      lat: number;
      lng: number;
      address: string;
    };
  };
}

export interface MatchRequest {
  id: string;
  from_user: {
    id: string;
    name: string;
    display_name: string | { String: string; Valid: boolean };
  };
  to_user: {
    id: string;
    name: string;
    display_name: string | { String: string; Valid: boolean };
  };
  message: string;
  carpool_name: string; // NEW: Carpool name chosen by the sender
  preferred_carpool_size?: number; // NEW: User's preferred carpool size
  status: 'pending' | 'accepted' | 'declined' | 'rejected';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MatchRequestsResponse {
  incoming: MatchRequest[];
  outgoing: MatchRequest[];
}

export interface MatchRequestResponse {
  id: string;
  from_user_id: string;
  to_user_id: string;
  potential_match_id: string;
  message: string;
  carpool_name: string; // NEW: Carpool name chosen by the sender
  status: 'pending' | 'accepted' | 'declined' | 'rejected';
  expires_at: string;
  created_at: string;
}

export interface UpdateRequestResponse {
  id: string;
  status: string;
  updated_at: string;
  message: string;
  carpool_id?: string; // Optional carpool ID when request is accepted
  carpool?: CarpoolDetails; // Full carpool details when created
}

// New interface for carpool seat management
export interface CarpoolDetails {
  id: string;
  name: string;
  destination_address: string;
  total_capacity: number; // Total seats in carpool
  current_members: number; // Current number of members
  available_seats: number; // Available seats (total - current)
  is_full: boolean; // Whether carpool is full
  members: CarpoolMember[];
  created_at: string;
}

export interface CarpoolMember {
  user_id: string;
  name: string;
  role: 'driver' | 'passenger';
}

// MatchRequest interface is already defined above

export interface SendMatchRequestPayload {
  potential_match_id: string;
  to_user_id: string;
  message: string;
  carpool_name: string; // NEW: Carpool name chosen by the sender
  preferred_carpool_size?: number; // NEW: User's preferred carpool size
}

export interface MatchingSession {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'expired';
  last_match_generated_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MatchingStats {
  total_matches_generated: number;
  match_acceptance_rate: number;
  average_compatibility_score: number;
  total_carpools_formed: number;
  total_savings: number;
  average_route_overlap: number;
  most_common_match_reasons: string[];
  geographic_distribution: {
    nearby: number;
    medium_distance: number;
    far: number;
  };
  time_to_acceptance: number;
  monthly_trends: Array<{
    month: string;
    matches: number;
    acceptances: number;
  }>;
}

export interface MatchFilters {
  min_score?: number;
  max_distance?: number;
  age_ranges?: string[];
  gender_preferences?: string[];
  student_preference?: string;
  occupation_preferences?: string[];
  genders?: string[];
  occupations?: string[];
  student_status?: string[];
  limit?: number;
  offset?: number;
}
