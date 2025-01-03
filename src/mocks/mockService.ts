import { Carpool } from '@/types/api'
import { mockCarpool, mockCarpools } from './data/carpools'
import { mockAnalytics } from './data/analytics'
import { mockCompletedRides, mockActiveRide } from './data/rides'
import { mockInvites } from './data/invites'

export const mockService = {
  async createCarpool(carpool: Omit<Carpool, 'id'>): Promise<Carpool> {
    return { id: '1', ...carpool }
  },

  async getCarpools() {
    return mockCarpools
  },

  async getCarpool(id: string) {
    return { ...mockCarpool, id }
  },

  async getRideHistory() {
    return mockCompletedRides
  },

  async getAnalytics() {
    return mockAnalytics
  },

  async getInvites(userId: string) {
    return mockInvites
  },

  async getActiveRide(userId: string) {
    console.log('Mock getActiveRide called with userId:', userId)
    console.log('Mock data:', mockActiveRide)
    return mockActiveRide
  }
}
