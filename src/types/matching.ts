// Core matching domain types
export interface MatchingPreferences {
  user_id: string;
  max_detour_minutes: number;
  preferred_group_size: number;
  driver_preference: 'driver' | 'passenger' | 'flexible';
  schedule_flexibility_minutes: number;
  max_pickup_distance_miles: number;
  min_compatibility_score: number;
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
  user2: {
    id: string;
    name: string;
    display_name: string | {
      String: string;
      Valid: boolean;
    };
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
    preferences: MatchingPreferences;
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
}

export interface MatchRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  potential_match_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  expires_at: string;
  created_at: string;
  from_user: {
    id: string;
    name: string;
    display_name: string;
  };
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
