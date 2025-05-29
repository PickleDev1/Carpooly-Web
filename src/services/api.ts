import { Carpool, CompletedRide, Analytics, Schedule } from '@/types/api'
import { useAuth } from '@clerk/nextjs'
import { mockService } from '@/mocks/mockService'
import { useMemo } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export const useApi = () => {
  const { getToken } = useAuth()
  
  return useMemo(() => {
    const getHeaders = async () => {
      const token = await getToken({template: "carpooly"})
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
          const token = await getToken({template: "carpooly"})
          
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
          const token = await getToken({template: "carpooly"})
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

      async createCarpoolSchedule(schedule: {
        carpoolId: string,
        scheduleType: string,
        startDate: Date,
        endDate?: Date,
        startTime: string,
        dayOfWeek?: string
      }) {
        const headers = await getHeaders()
        
        const dayOfWeekMap: { [key: string]: number } = {
          'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
          'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
        }

        const requestBody = {
          carpool_id: schedule.carpoolId,
          schedule_type: schedule.scheduleType.toLowerCase(),
          start_date: schedule.startDate.toISOString(),
          end_date: schedule.endDate?.toISOString(),
          start_time: new Date(`2025-03-25T${schedule.startTime}:00.000Z`).toISOString(),
          day_of_week: schedule.dayOfWeek ? dayOfWeekMap[schedule.dayOfWeek] : undefined
        }

        console.log('Making API request to create schedule:', requestBody)
        
        const response = await fetch(`${API_URL}/carpools/${schedule.carpoolId}/schedules`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          throw new Error('Failed to create schedule')
        }

        return response.json()
      },

      async updateSchedule(schedule: {
        carpoolId: string,
        scheduleType: string,
        startDate: Date,
        endDate?: Date,
        startTime: string,
        dayOfWeek?: string
      }) {
        const headers = await getHeaders()
        
        const dayOfWeekMap: { [key: string]: number } = {
          'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
          'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
        }

        const requestBody = {
          carpool_id: schedule.carpoolId,
          schedule_type: schedule.scheduleType.toLowerCase(),
          start_date: schedule.startDate.toISOString(),
          end_date: schedule.endDate?.toISOString(),
          start_time: new Date(`2025-03-25T${schedule.startTime}:00.000Z`).toISOString(),
          day_of_week: schedule.dayOfWeek ? dayOfWeekMap[schedule.dayOfWeek] : undefined
        }

        console.log('Making API request to update schedule:', requestBody)
        
        const response = await fetch(`${API_URL}/carpools/${schedule.carpoolId}/schedules`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(requestBody)
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

      async getUserActiveRides(userId: string) {
        if (useMockApi) {
          return mockService.getActiveRide(userId)
        }
        const headers = await getHeaders()
        console.log('Making request with headers:', headers)
        console.log('Fetching active rides for userId:', userId)
        
        const response = await fetch(`${API_URL}/users/${userId}/active-rides`, { 
          method: 'GET',
          headers 
        })

        if (!response.ok) {
          console.error('Active Rides API Error:', response.status, response.statusText)
          const responseText = await response.text()
          console.error('Response body:', responseText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const text = await response.text()
        console.log('Raw active rides response:', text)
        
        if (!text) {
          console.log('Empty response received')
          return []
        }

        try {
          const data = JSON.parse(text)
          console.log('Parsed active rides:', data)
          return data || []
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Response:', text)
          return []
        }
      },

      async getCarpool(carpoolId: string) {
        const headers = await getHeaders()
        
        const response = await fetch(`${API_URL}/carpools/${carpoolId}`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          throw new Error('Failed to fetch carpool')
        }

        return response.json()
      },

      async getCarpoolSchedules(carpoolId: string): Promise<Schedule[]> {
        const headers = await getHeaders()
        
        const response = await fetch(`${API_URL}/carpools/${carpoolId}/schedules`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          throw new Error('Failed to fetch carpool schedules')
        }

        return response.json()
      },

      async getCarpoolDayDetails(carpoolId: string, date: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/carpools/${carpoolId}/rides/${date}`, {
          headers
        })
        if (!response.ok) throw new Error('Failed to fetch day details')
        return response.json()
      },

      async setCarpoolDriver(rideId: string, driverId: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/carpools/rides/${rideId}/driver`, {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            driver_id: driverId
          })
        })
        if (!response.ok) throw new Error('Failed to set driver')
        // If response is empty, return success status
        const text = await response.text()
        return text ? JSON.parse(text) : { success: true }
      },

      async removeCarpoolDriver(carpoolId: string, date: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/carpools/${carpoolId}/days/${date}/driver`, {
          method: 'DELETE',
          headers
        })
        if (!response.ok) throw new Error('Failed to remove driver')
        return response.json()
      },

      async removeCarpoolParticipant(carpoolId: string, date: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/carpools/${carpoolId}/days/${date}/participants`, {
          method: 'DELETE',
          headers
        })
        if (!response.ok) throw new Error('Failed to remove participant')
        return response.json()
      },

      async addCarpoolComment(carpoolId: string, date: string, comment: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/carpools/${carpoolId}/days/${date}/comments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: comment })
        })
        if (!response.ok) throw new Error('Failed to add comment')
        return response.json()
      },

      async getCarpoolMembers(carpoolId: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/carpools/${carpoolId}/members`, {
          headers
        })
        if (!response.ok) throw new Error('Failed to fetch carpool members')
        return response.json()
      },

      async createCarpoolRide(carpoolId: string, date: string, startTime: string) {
        const headers = await getHeaders()
        
        // Create start_time by combining date and time
        const startDateTime = new Date(`${date}T${startTime}:00Z`)
        
        // Create end_time (1 hour after start)
        const endDateTime = new Date(startDateTime)
        endDateTime.setHours(endDateTime.getHours() + 1)

        const response = await fetch(`${API_URL}/carpools/${carpoolId}/rides`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString()
          })
        })
        if (!response.ok) throw new Error('Failed to create carpool ride')
        return response.json()
      },

      async getCarpoolRideByDate(carpoolId: string, date: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/carpools/${carpoolId}/rides/${date}`, {
          headers
        })
        if (!response.ok) throw new Error('Failed to fetch ride details')
        return response.json()
      },
    }
  }, [getToken])
}
