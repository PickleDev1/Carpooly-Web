import { Carpool, CompletedRide, Analytics } from '@/types/api'
import { useAuth } from '@clerk/nextjs'
import { mockService } from '@/mocks/mockService'
import { useMemo } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export const useApi = () => {
  const { getToken } = useAuth()
  
  return useMemo(() => {
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
        console.log('Making request with headers:', headers)
        console.log('Fetching invites for userId:', userId)
        const response = await fetch(`${API_URL}/api/userinvites/${userId}`, { 
          method: 'GET',
          headers 
        })

        if (!response.ok) {
          console.error('Invites API Error:', response.status, response.statusText)
          const responseText = await response.text()
          console.error('Response body:', responseText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const text = await response.text()
        console.log('Raw invites response:', text)
        
        if (!text) {
          console.log('Empty response received')
          return []
        }

        try {
          const data = JSON.parse(text)
          console.log('Parsed invites:', data)
          // If data is null or undefined, return empty array
          return data || []
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Response:', text)
          return []
        }
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

        console.log('API: getCarpools response status:', response.status)

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
          const data = JSON.parse(text)
          console.log('API: getCarpools data received:', data)
          return data
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
          
          // Log the full data for debugging (remove in production)
          console.log('Full invite data:', {
            carpool_id: data.carpool_id,
            from_user: data.from_user,
            email: data.email,
            message: data.message
          })
          
          // Ensure the from_user is a valid UUID
          if (!data.from_user.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            throw new Error('Invalid user ID format')
          }

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

      async getCurrentUser() {
        if (useMockApi) {
          return mockService.getCurrentUser()
        }
        const headers = await getHeaders()
        const url = `${API_URL}/api/users/me`
        console.log('Attempting to fetch user from:', url)
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          console.error('Get Current User Error:', response.status, response.statusText)
          console.error('Attempted URL:', url)
          const responseText = await response.text()
          console.error('Response body:', responseText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const text = await response.text()
        if (!text) {
          return null
        }

        try {
          return JSON.parse(text)
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Response:', text)
          return null
        }
      },

      async updateInviteStatus(inviteId: string, status: number) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/invites/${inviteId}/updateStatus`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status })
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to update invite status: ${errorText}`)
        }

        const text = await response.text()
        if (!text) return null
        
        try {
          return JSON.parse(text)
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Response:', text)
          return null
        }
      },

      async deleteCarpool(carpoolId: string) {
        if (useMockApi) {
          return mockService.deleteCarpool(carpoolId)
        }
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}`, {
          method: 'DELETE',
          headers
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to delete carpool: ${errorText}`)
        }

        return true
      },

      async updateCarpoolSchedule(schedule: any) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/carpools/${schedule.carpoolId}/schedule`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(schedule)
        })

        if (!response.ok) {
          throw new Error('Failed to update schedule')
        }

        return response.json()
      },

      async inviteToCarpool(carpoolId: string, email: string): Promise<void> {
        const headers = await getHeaders()
        await fetch(`${API_URL}/api/carpools/${carpoolId}/invite`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ email })
        });
      },
    }
  }, [getToken])
}
