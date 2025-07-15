import { Carpool } from '@/types/api'
import { mockCarpool, mockCarpools } from './data/carpools'
import { mockAnalytics } from './data/analytics'
import { mockCompletedRides, mockActiveRide } from './data/rides'
import { mockInvites } from './data/invites'

export const mockService = {
  async createCarpool(carpoolData: any): Promise<Carpool> {
    return {
      id: 'mock-carpool-' + Date.now(),
      ...carpoolData,
      created_at: new Date().toISOString(),
      status: 'active'
    }
  },

  async getCarpools() {
    return [] // Return empty array or mock data
  },

  async getCarpool(id: string) {
    return { ...mockCarpool, id }
  },

  async getRideHistory() {
    return [
      {
        carpool_name: "Morning School Run",
        date: "2024-03-15",
        time: "8:00 AM",
        destination_address: "123 School St",
        passengers: "John, Emma, Michael"
      },
      {
        carpool_name: "Afternoon Return",
        date: "2024-03-15",
        time: "3:00 PM",
        destination_address: "456 Home Ave",
        passengers: "John, Emma, Michael"
      }
    ]
  },

  async getAnalytics() {
    return mockAnalytics
  },

  async getInvites(userId: string) {
    return mockInvites
  },

  async getActiveRide(userId: string) {
    return mockActiveRide
  },

  async getCurrentUser() {
    return {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "user@example.com",
      name: "John Doe"
    }
  },

  deleteCarpool: async (carpoolId: string) => {
    console.log('Mock: Deleting carpool', carpoolId)
    return true
  },

  updateCarpoolAvailableSeats: async (carpoolId: string, availableSeats: number) => {
    console.log('Mock: Updating carpool available seats', { carpoolId, availableSeats })
    return {
      id: carpoolId,
      available_seats: availableSeats
    }
  },

  incrementCarpoolAvailableSeats: async (carpoolId: string) => {
    console.log('Mock: Incrementing carpool available seats', { carpoolId })
    return {
      id: carpoolId,
      available_seats: 4 // Mock increment
    }
  },

  decrementCarpoolAvailableSeats: async (carpoolId: string) => {
    console.log('Mock: Decrementing carpool available seats', { carpoolId })
    return {
      id: carpoolId,
      available_seats: 2 // Mock decrement
    }
  },

  checkCarpoolAvailability: async (carpoolId: string) => {
    console.log('Mock: Checking carpool availability', { carpoolId })
    return {
      available_seats: 3,
      total_seats: 4,
      has_available_seats: true
    }
  },

  async getRecentActivity(limit = 20) {
    return [
      {
        id: '1',
        type: 'ride_completed',
        message: 'Completed ride to work',
        timestamp: new Date().toISOString(),
        carpool_name: 'Morning Commute'
      },
      {
        id: '2',
        type: 'carpool_joined',
        message: 'Joined new carpool',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        carpool_name: 'Weekend Trip'
      }
    ].slice(0, limit)
  },
}
