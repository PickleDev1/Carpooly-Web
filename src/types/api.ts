export interface Carpool {
  id?: string;
  carpool_name: string;
  recurring_option: string;
  available_seats: number;
  destination_address: string;
  seats: number;
  created_by?: string;
  created_at?: string;
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
}
