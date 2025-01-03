import { Carpool } from '@/types/api'

export const mockCarpool: Carpool = {
  id: '1',
  carpool_name: 'Mock Carpool',
  recurring_option: 'daily',
  available_seats: 3,
  destination_address: '123 Test St',
  seats: 4
}

export const mockCarpools: Carpool[] = [mockCarpool] 