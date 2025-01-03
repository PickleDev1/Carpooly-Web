import { CompletedRide } from '@/types/api'

// Active ride mock
export const mockActiveRide = {
  id: '1',
  carpool_name: 'Morning School Run',
  driver_name: 'Suja',
  current_location: {
    lat: 37.529290,
    lng: -121.938373
  },
  destination: {
    address: '600 Driscoll Rd, Fremont, CA 94539',
    lat: 37.547236,
    lng: -121.942220
  },
  estimated_arrival: '8:30 AM',
  passengers: ['Shreya', 'Eshani', 'Reyna'],
  status: 'in_progress'
}

// Completed rides mock
export const mockCompletedRides: CompletedRide[] = [
  {
    id: '1',
    carpool_name: 'Morning School Run',
    date: '2024-03-15',
    time: '8:00 AM',
    destination_address: '123 School St',
    passengers: 3
  },
  {
    id: '2',
    carpool_name: 'Afternoon Soccer Practice',
    date: '2024-03-14',
    time: '3:00 PM',
    destination_address: '456 Soccer Field',
    passengers: 4
  }
]