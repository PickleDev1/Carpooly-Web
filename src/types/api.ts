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
}

export interface CompletedRide {
  id: string;
  carpool_name: string;
  date: string;
  time: string;
  destination_address: string;
  passengers: number;
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
