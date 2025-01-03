import { Carpool, CompletedRide, Analytics } from '@/types/api'
import { useAuth } from '@clerk/nextjs'
import { mockService } from '@/mocks/mockService'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export const useApi = () => {
  const { getToken } = useAuth()

  const getHeaders = async () => {
    const token = await getToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  return {
    async getInvites(userId: string) {
      if (useMockApi) {
        return mockService.getInvites(userId)
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/invites/${userId}`, { headers })
      return response.json()
    },

    async getActiveRide(userId: string) {
      if (useMockApi) {
        return mockService.getActiveRide(userId)
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/active-ride/${userId}`, { headers })
      return response.json()
    },

    async getAnalytics() {
      if (useMockApi) {
        return mockService.getAnalytics()
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/analytics`, { headers })
      return response.json()
    },

    async getCarpools() {
      if (useMockApi) {
        return mockService.getCarpools()
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/carpools`, { headers })
      return response.json()
    },

    async getRideHistory() {
      if (useMockApi) {
        return mockService.getRideHistory()
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/ride-history`, { headers })
      return response.json()
    },

    async createCarpool(carpoolData: any) {
      if (useMockApi) {
        return mockService.createCarpool(carpoolData)
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/carpools`, {
        method: 'POST',
        headers,
        body: JSON.stringify(carpoolData)
      })
      return response.json()
    }
  }
}
