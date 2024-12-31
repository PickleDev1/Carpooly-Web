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
}
