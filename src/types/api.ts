export interface Schedule {
  start_date: string;
  end_date?: string;
  schedule_type: 'one_time' | 'daily' | 'weekly';
  start_time: string;
  day_of_week?: number;
}

export interface Carpool {
  id?: string;
  carpool_name: string;
  recurring_option: string;
  available_seats: number;
  destination_address: string;
  destination_lat?: number;
  destination_lng?: number;
  seats: number;
  created_by?: string;
  created_at?: string;
  schedule?: Schedule;
  // New fields for dynamic seat management
  total_capacity?: number; // Total seats in carpool
  current_members?: number; // Current number of members
  is_full?: boolean; // Whether carpool is full
  members?: CarpoolMember[]; // List of carpool members
}

export interface CarpoolMember {
  user_id: string;
  name: string;
  role: 'driver' | 'passenger';
}

export interface CompletedRide {
  id: string;
  carpool_name: string;
  date: string;
  time: string;
  destination_address: string;
  destination_lat?: number;
  destination_lng?: number;
  passengers: number;
  user_id?: string; // To track which user participated in this ride
}

export interface Analytics {
  total_carpools: number;
  total_rides: number;
  miles_saved: number;
  co2_reduced: number;
  top_carpoolers: {
    name: string;
    rides: number;
    co2_saved: string;
  }[];
}

export interface ActiveRide {
  id: string;
  carpool_id: string;
  driver_id: string;
  status: string;
  location_lat: number;
  location_lng: number;
  miles_saved: number;
  created_at: string;
  updated_at: string;
  start_time: string;
  destination_address?: string;
  carpool_name?: string;
}

export interface LocationData {
  id: string
  user_id: string
  carpool_ride_id: string
  latitude: number
  longitude: number
  timestamp: string
  created_at: string
}

export interface LocationSettings {
  location_sharing_enabled: boolean
  home_latitude?: number
  home_longitude?: number
}

export interface LocationUpdateRequest {
  latitude: number
  longitude: number
  timestamp?: string
}

export interface LocationSettingsUpdateRequest {
  location_sharing_enabled: boolean
  home_latitude?: number
  home_longitude?: number
}

// Matching API Response Types
export interface MatchingPreferencesResponse {
  success: boolean;
  preferences: {
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
    // New optional schedule fields
    arrival_time?: string;
    commute_days?: string[];
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
  };
}

export interface PotentialMatchesResponse {
  pending_matches: Array<{
    id: string;
    // Clerk ID for efficient API calls
    user2_clerk_id?: string;
    user2: {
      id: string;
      name: string;
      display_name: string;
      clerk_id?: string; // Nested Clerk ID field
      home_location: {
        lat: number;
        lng: number;
        address: string;
      };
      work_location: {
        lat: number;
        lng: number;
        address: string;
      };
      preferences: any;
      schedule: {
        work_days: string[];
        work_start_time: string;
        work_end_time: string;
      };
    };
    compatibility_score: number;
    match_reasons: string[];
    route_overlap_percentage: number;
    estimated_detour_minutes: number;
    estimated_pickup_distance_miles: number;
    created_at: string;
    expires_at: string;
  }>;
  accepted_matches: any[];
  expired_matches: any[];
}

// MatchRequestsResponse moved to src/types/matching.ts

export interface FindMatchesResponse {
  matches_found: number;
  message: string;
}

// MatchRequestResponse and UpdateRequestResponse moved to src/types/matching.ts

export interface MatchingSessionResponse {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'expired';
  last_match_generated_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MatchingStatsResponse {
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

// Next Ride API Response Types
export interface NextRideParticipant {
  id: string;
  name: string;
  display_name: string;
  email: string;
  clerk_id: string;
}

export interface NextRideDriver {
  id: string;
  name: string;
  display_name: string;
  email: string;
  clerk_id: string;
  city: string | null;
  state: string | null;
  location_sharing_enabled: boolean;
  home_latitude: number;
  home_longitude: number;
  created_at: string;
  updated_at: string;
}

export interface NextRide {
  id: string;
  carpool_id: string;
  driver_id: string | null;
  start_time: string; // ISO 8601 format
  status: number; // 0 = Pending, 1 = Active, 2 = Completed
  participants: NextRideParticipant[];
  location_lat?: number;
  location_lng?: number;
  miles_saved?: number;
  created_at: string;
  updated_at: string;
}

export interface NextRideInfo {
  ride: NextRide;
  carpool_name: string;
  driver: NextRideDriver | null;
  is_user_driver: boolean;
}
