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
  }
}
