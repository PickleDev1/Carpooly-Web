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
        return mockService.getInvites()
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/invites/${userId}`, { headers })
      return response.json()
    },

    async getActiveRide(userId: string) {
      if (useMockApi) {
        return mockService.getActiveRide()
      }
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/active-ride/${userId}`, { headers })
      return response.json()
    },

    // ... rest of your API methods
  }
}
