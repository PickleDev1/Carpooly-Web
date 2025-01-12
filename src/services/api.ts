import { Carpool, CompletedRide, Analytics } from '@/types/api'
import { useAuth } from '@clerk/nextjs'
import { mockService } from '@/mocks/mockService'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export const useApi = () => {
  const { getToken } = useAuth()
  
  // Debug logs
  //console.log('Inside useApi - NEXT_PUBLIC_USE_MOCK_API:', process.env.NEXT_PUBLIC_USE_MOCK_API)
  //console.log('Inside useApi - useMockApi:', useMockApi)

  const getHeaders = async () => {
    const token = await getToken()
    console.log('Token:', token)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    console.log('Headers:', headers)
    return headers
  }

  return {
    async getInvites(userId: string) {
      if (useMockApi) {
        return mockService.getInvites(userId)
      }
      const headers = await getHeaders()
      console.log('Making request with headers:', headers)
      const response = await fetch(`${API_URL}/api/invites/${userId}`, { headers })
      if (!response.ok) {
        console.log('Response not ok:', response.status, await response.text())
        throw new Error(`HTTP error! status: ${response.status}`)
      }
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
      console.log('Getting analytics, useMockApi:', useMockApi)

      if (useMockApi) {
        console.log('Using mock analytics data')
        return mockService.getAnalytics()
      }

      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/api/analytics`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        console.error('Analytics API Error:', response.status, response.statusText)
        const responseText = await response.text()
        console.error('Response body:', responseText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      if (!text) {
        console.log('Empty response received')
        return {
          total_carpools: 0,
          total_rides: 0,
          miles_saved: 0,
          co2_reduced: 0,
          top_carpoolers: []
        }
      }

      try {
        return JSON.parse(text)
      } catch (error) {
        console.error('JSON Parse Error:', error, 'Response:', text)
        return {
          total_carpools: 0,
          total_rides: 0,
          miles_saved: 0,
          co2_reduced: 0,
          top_carpoolers: []
        }
      }
    },

    async getCarpools(userId: string) {
      if (useMockApi) {
        return mockService.getCarpools()
      }
      const headers = await getHeaders()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carpools/users/${userId}`, { 
        method: 'GET',
        headers 
      })

      if (!response.ok) {
        console.error('Carpools API Error:', response.status, response.statusText)
        const responseText = await response.text()
        console.error('Response body:', responseText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      if (!text) {
        console.log('No text!')
        return { data: [] }
      }

      try {
        return JSON.parse(text)
      } catch (error) {
        console.error('JSON Parse Error:', error, 'Response:', text)
        return { data: [] }
      }
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carpools`, {
        method: 'POST',
        headers,
        body: JSON.stringify(carpoolData)
      })

      if (!response.ok) {
        console.error('Create Carpool Error:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()
      if (!text) {
        console.log('Empty response received from create')
        return null
      }

      try {
        return JSON.parse(text)
      } catch (error) {
        console.error('JSON Parse Error:', error, 'Response:', text)
        return null
      }
    },

    createInvite: async (data: { 
      carpool_id: string; 
      from_user: string; 
      email: string; 
      message: string 
    }) => {
      try {
        const token = await getToken()
        console.log('Sending invite with data:', {
          ...data,
          from_user: data.from_user.substring(0, 8) + '...' // Log partial user ID for privacy
        })
        
        const response = await fetch(`${API_URL}/api/invites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })

        const responseText = await response.text()
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
          headers: Object.fromEntries(response.headers.entries())
        })

        if (!response.ok) {
          throw new Error(responseText || 'Failed to send invite')
        }

        return true
      } catch (error) {
        console.error('Create invite error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    },

    getUserMe: async () => {
      try {
        const token = await getToken()
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to get user data')
        }

        return response.json()
      } catch (error) {
        console.error('Get user data error:', error)
        throw error
      }
    },
  }
}
