import { Analytics } from '@/types/api'

export const mockAnalytics: Analytics = {
  total_carpools: 125,
  total_rides: 450,
  miles_saved: 2800,
  co2_reduced: 1200,
  top_carpoolers: [
    { name: "Sarah Johnson", rides: 45, co2_saved: "230kg" },
    { name: "Mike Chen", rides: 38, co2_saved: "195kg" },
    { name: "Emma Davis", rides: 32, co2_saved: "165kg" },
    { name: "Alex Kim", rides: 29, co2_saved: "150kg" },
    { name: "Lisa Garcia", rides: 25, co2_saved: "128kg" }
  ]
} 