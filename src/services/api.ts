import { Carpool, CompletedRide, Analytics, Schedule } from '@/types/api'
import { useAuth } from '@clerk/nextjs'
import { mockService } from '@/mocks/mockService'
import { useMemo } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const useMockApi = false // Use real backend endpoints

export const useApi = () => {
  const { getToken } = useAuth()
  
  return useMemo(() => {
    const getHeaders = async () => {
      const token = await getToken({template: "carpooly"})
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    }

    // Helper function to convert local time to UTC
    const convertToUTC = (date: string, time: string): string => {
      const localDateTime = new Date(`${date}T${time}:00`)
      return localDateTime.toISOString()
    }

    // Helper function to convert UTC to local time for display
    const convertFromUTC = (utcTime: string): string => {
      const date = new Date(utcTime)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return {
      getHeaders, // <-- add this line so api.getHeaders is available
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
        const response = await fetch(`${API_URL}/api/analytics:1`, {
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

      getUserById: async (userId: string) => {
        try {
          const token = await getToken({template: "carpooly"})
          const response = await fetch(`${API_URL}/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to get user data')
          }

          return response.json()
        } catch (error) {
          console.error('Get user by ID error:', error)
          throw error
        }
      },

      deleteUser: async (userId: string) => {
        try {
          const token = await getToken({template: "carpooly"})
          const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to delete user account')
          }

          return response.json()
        } catch (error) {
          console.error('Delete user error:', error)
          throw error
        }
      },

      // Calculate miles saved based on active rides that started at least 45 minutes ago (and remain counted)
      async calculateMilesSaved(userId: string) {
        try {
          // Get user's home location for distance calculations
          const locationSettings = await this.getLocationSettings()
          const homeLat = locationSettings.home_latitude
          const homeLng = locationSettings.home_longitude

          if (!homeLat || !homeLng) {
            console.log('No home location set, cannot calculate miles saved')
            return 0
          }

          // Get active rides where user is a participant
          const activeRides = await this.getActiveRides()
          const now = new Date()
          
          let totalMilesSaved = 0
          let totalRidesCounted = 0

          for (const ride of activeRides) {
            // Check if this ride's start_time is at least 45 minutes ago
            if (ride.start_time) {
              const startTime = new Date(ride.start_time)
              const timeDiff = (now.getTime() - startTime.getTime()) / (1000 * 60) // minutes
              
              // Only count rides that started at least 45 minutes ago
              if (timeDiff >= 45) {
                // Check if the current user is a participant in this ride
                const isUserParticipant = ride.participants && Array.isArray(ride.participants) && 
                  ride.participants.some((participant: any) => participant.id === userId)
                
                if (isUserParticipant) {
                  // Check if this ride has destination coordinates
                  if (ride.destination_lat && ride.destination_lng) {
                    // Calculate distance from home to destination
                    const distance = this.calculateDistance(
                      homeLat, 
                      homeLng, 
                      ride.destination_lat, 
                      ride.destination_lng
                    )
                    
                    // Miles saved calculation:
                    // - Each passenger in a carpool saves the equivalent of one car trip
                    // - If there are N passengers, that's N-1 cars saved (since one car is still used)
                    // - Each saved car trip = round trip distance (there and back)
                    const passengers = parseInt(ride.passengers) || 1
                    const carsSaved = Math.max(0, passengers - 1) // At least 1 car is still used
                    const roundTripDistance = distance * 2 // There and back
                    const milesSavedForThisRide = carsSaved * roundTripDistance
                    
                    totalMilesSaved += milesSavedForThisRide
                    totalRidesCounted++
                    
                    console.log(`Active Ride: ${ride.carpool_name}, Started ${timeDiff.toFixed(1)}min ago, Distance: ${distance.toFixed(1)}mi, Passengers: ${passengers}, Cars Saved: ${carsSaved}, Miles Saved: ${milesSavedForThisRide.toFixed(1)}`)
                  }
                } else {
                  console.log(`Ride ${ride.carpool_name} started ${timeDiff.toFixed(1)}min ago, but user is not a participant`)
                }
              } else {
                console.log(`Ride ${ride.carpool_name} started ${timeDiff.toFixed(1)}min ago, not yet eligible for miles saved (needs 45+ min)`)
              }
            }
          }

          console.log(`Total miles saved: ${totalMilesSaved.toFixed(1)} from ${totalRidesCounted} rides (45+ min after start, user is participant)`)
          return Math.round(totalMilesSaved)
        } catch (error) {
          console.error('Error calculating miles saved:', error)
          return 0
        }
      },

      // Haversine formula to calculate distance between two points
      calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const toRad = (x: number) => (x * Math.PI) / 180
        const R = 3958.8 // Radius of Earth in miles
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lon2 - lon1)
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
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
        const payload = { status }
        
        console.log('Sending updateInviteStatus request:', {
          url: `${API_URL}/api/invites/${inviteId}/updateStatus`,
          method: 'PUT',
          headers,
          payload
        })

        const response = await fetch(`${API_URL}/api/invites/${inviteId}/updateStatus`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Update invite status error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            requestPayload: payload
          })
          throw new Error(errorText || 'Failed to update invite status')
        }
      },

      async updateCarpoolAvailableSeats(carpoolId: string, availableSeats: number) {
        if (useMockApi) {
          return mockService.updateCarpoolAvailableSeats(carpoolId, availableSeats)
        }
        const headers = await getHeaders()
        const payload = { available_seats: availableSeats }
        
        console.log('Sending updateCarpoolAvailableSeats request:', {
          url: `${API_URL}/api/carpools/${carpoolId}`,
          method: 'PUT',
          headers,
          payload
        })

        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Update carpool available seats error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            requestPayload: payload
          })
          throw new Error(errorText || 'Failed to update carpool available seats')
        }

        // Check if response has content before trying to parse JSON
        const text = await response.text()
        if (!text) {
          console.log('Empty response received from updateCarpoolAvailableSeats')
          return { success: true, carpoolId, availableSeats }
        }

        try {
          return JSON.parse(text)
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Response:', text)
          // Return a success object if parsing fails but response was ok
          return { success: true, carpoolId, availableSeats }
        }
      },

      async incrementCarpoolAvailableSeats(carpoolId: string) {
        if (useMockApi) {
          return mockService.incrementCarpoolAvailableSeats(carpoolId)
        }
        
        // First get current carpool details to check current available seats
        const carpool = await this.getCarpool(carpoolId)
        if (!carpool) {
          throw new Error('Carpool not found')
        }

        const currentAvailableSeats = carpool.available_seats || 0
        const totalSeats = carpool.seats || 0
        
        // Don't increment beyond the original total seats
        if (currentAvailableSeats >= totalSeats) {
          console.log('Available seats already at maximum, no increment needed')
          return carpool
        }

        const newAvailableSeats = currentAvailableSeats + 1
        return this.updateCarpoolAvailableSeats(carpoolId, newAvailableSeats)
      },

      async decrementCarpoolAvailableSeats(carpoolId: string) {
        if (useMockApi) {
          return mockService.decrementCarpoolAvailableSeats(carpoolId)
        }
        
        // First get current carpool details to check current available seats
        const carpool = await this.getCarpool(carpoolId)
        if (!carpool) {
          throw new Error('Carpool not found')
        }

        const currentAvailableSeats = carpool.available_seats || 0
        
        // Don't decrement below 0
        if (currentAvailableSeats <= 0) {
          throw new Error('No available seats in this carpool')
        }

        const newAvailableSeats = currentAvailableSeats - 1
        return this.updateCarpoolAvailableSeats(carpoolId, newAvailableSeats)
      },

      async checkCarpoolAvailability(carpoolId: string) {
        if (useMockApi) {
          return mockService.checkCarpoolAvailability(carpoolId)
        }
        
        const carpool = await this.getCarpool(carpoolId)
        if (!carpool) {
          throw new Error('Carpool not found')
        }

        return {
          available_seats: carpool.available_seats || 0,
          total_seats: carpool.seats || 0,
          has_available_seats: (carpool.available_seats || 0) > 0
        }
      },

      async deleteCarpool(carpoolId: string) {
        if (useMockApi) {
          return mockService.deleteCarpool(carpoolId)
        }
        const headers = await getHeaders()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carpools/${carpoolId}`, {
          method: 'DELETE',
          headers
        })

        if (!response.ok) {
          const text = await response.text()
          console.error('Delete Carpool Error:', response.status, response.statusText)
          console.error('Response body:', text)
          throw new Error(text || `Failed to delete carpool: ${response.statusText}`)
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

        // Convert start date to YYYY-MM-DD format
        const startDateStr = schedule.startDate.toISOString().split('T')[0]
        
        // Create a local date object, then convert to UTC
        const startTimeLocal = new Date(`${startDateStr}T${schedule.startTime}:00`)

        const requestBody = {
          carpool_id: schedule.carpoolId,
          schedule_type: schedule.scheduleType.toLowerCase(),
          start_date: schedule.startDate.toISOString(),
          end_date: schedule.endDate?.toISOString(),
          start_time: startTimeLocal.toISOString(),
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

        // Convert start date to YYYY-MM-DD format
        const startDateStr = schedule.startDate.toISOString().split('T')[0]
        
        // Create a local date object, then convert to UTC
        const startTimeLocal = new Date(`${startDateStr}T${schedule.startTime}:00`)

        const requestBody = {
          carpool_id: schedule.carpoolId,
          schedule_type: schedule.scheduleType.toLowerCase(),
          start_date: schedule.startDate.toISOString(),
          end_date: schedule.endDate?.toISOString(),
          start_time: startTimeLocal.toISOString(),
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
        const response = await fetch(`${API_URL}/api/invites`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            carpool_id: carpoolId,
            email: email
          })
        });

        if (!response.ok) {
          const text = await response.text()
          console.error('Invite to carpool error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          
          // Handle specific error cases
          if (text.includes('not registered') || text.includes('user not found')) {
            throw new Error('This email is not registered. Please ask them to create an account first.')
          } else if (text.includes('already invited')) {
            throw new Error('This user has already been invited to this carpool.')
          } else if (text.includes('already a member')) {
            throw new Error('This user is already a member of this carpool.')
          }
          
          throw new Error(text || 'Failed to send invite')
        }
      },

      async getUserActiveRides(userId: string) {
        if (useMockApi) {
          return mockService.getActiveRide(userId)
        }
        const headers = await getHeaders()
        console.log('Making request with headers:', headers)
        console.log('Fetching active rides for userId:', userId)
        
        const response = await fetch(`${API_URL}/api/active-ride/user_${userId}`, { 
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

      async getActiveRides() {
        if (useMockApi) {
          return mockService.getActiveRide('mock-user-id')
        }
        const headers = await getHeaders()
        console.log('Making request to /api/rides/active with headers:', headers)
        
        const response = await fetch(`${API_URL}/api/rides/active`, { 
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
        
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          throw new Error('Failed to fetch carpool')
        }

        const data = await response.json()
        
        // Helper function to safely extract string values from nested objects
        const safeString = (value: any): string => {
          if (typeof value === 'string') return value;
          if (value && typeof value === 'object' && 'String' in value && 'Valid' in value) {
            return value.Valid ? value.String : '';
          }
          return String(value || '');
        };
        
        // Process the carpool data to handle nested objects
        return {
          ...data,
          carpool_name: safeString(data.carpool_name),
          recurring_option: safeString(data.recurring_option),
          destination_address: safeString(data.destination_address)
        };
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
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/rides/${date}`, {
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
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/days/${date}/driver`, {
          method: 'DELETE',
          headers
        })
        if (!response.ok) throw new Error('Failed to remove driver')
        return response.json()
      },

      async removeCarpoolParticipant(carpoolId: string, date: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/days/${date}/participants`, {
          method: 'DELETE',
          headers
        })
        if (!response.ok) throw new Error('Failed to remove participant')
        return response.json()
      },

      async removeCarpoolParticipantById(rideId: string, userId: string) {
        const headers = await getHeaders();
        console.log('Calling removeCarpoolParticipantById with rideId:', rideId, 'userId:', userId);
        const response = await fetch(`${API_URL}/api/carpools/rides/${rideId}/participants/${userId}`, {
          method: 'DELETE',
          headers
        });
        if (!response.ok) throw new Error('Failed to remove participant by ID');
        return response.json();
      },

      async addCarpoolParticipantById(rideId: string, userId: string) {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/api/carpools/rides/${rideId}/participants/${userId}`, {
          method: 'POST',
          headers
        });
        if (!response.ok) throw new Error('Failed to add participant by ID');
        return response.json();
      },

      async addCarpoolComment(carpoolId: string, date: string, comment: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/days/${date}/comments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: comment })
        })
        if (!response.ok) throw new Error('Failed to add comment')
        return response.json()
      },

      async getCarpoolMembers(carpoolId: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/members`, {
          headers
        })
        if (!response.ok) throw new Error('Failed to fetch carpool members')
        
        const data = await response.json()
        
        // Helper function to safely extract string values from nested objects
        const safeString = (value: any): string => {
          if (typeof value === 'string') return value;
          if (value && typeof value === 'object' && 'String' in value && 'Valid' in value) {
            return value.Valid ? value.String : '';
          }
          return String(value || '');
        };
        
        // Process member data to handle nested objects
        if (Array.isArray(data)) {
          return data.map((member: any) => ({
            ...member,
            name: safeString(member.name),
            display_name: safeString(member.display_name),
            email: safeString(member.email)
          }));
        }
        
        return data;
      },

      async getCarpoolParticipantsByDate(carpoolId: string, date: string) {
        const headers = await getHeaders()
        console.log('Fetching participants for carpool:', carpoolId, 'date:', date)
        
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/days/${date}/participants`, {
          method: 'GET',
          headers
        })
        
        if (!response.ok) {
          console.error('Participants API Error:', response.status, response.statusText)
          // If the endpoint doesn't exist, fall back to carpool members
          console.log('Falling back to carpool members')
          return this.getCarpoolMembers(carpoolId)
        }
        
        const text = await response.text()
        console.log('Raw participants response:', text)
        
        if (!text) {
          console.log('Empty participants response, falling back to carpool members')
          return this.getCarpoolMembers(carpoolId)
        }
        
        try {
          const data = JSON.parse(text)
          console.log('Parsed participants data:', data)
          return data
        } catch (error) {
          console.error('JSON Parse Error for participants:', error, 'Response:', text)
          return this.getCarpoolMembers(carpoolId)
        }
      },

      async createCarpoolRide(carpoolId: string, date: string, startTime: string) {
        const headers = await getHeaders()
        
        // Create start_time by combining date and time in the user's local timezone
        const startDateTime = new Date(`${date}T${startTime}:00`)
        
        // Create end_time (1 hour after start)
        const endDateTime = new Date(startDateTime)
        endDateTime.setHours(endDateTime.getHours() + 1)

        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/rides`, {
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
        console.log('Fetching ride by date for carpool:', carpoolId, 'date:', date)
        
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/rides/${date}`, {
          headers
        })
        
        if (!response.ok) {
          console.error('Ride by date API Error:', response.status, response.statusText)
          throw new Error('Failed to fetch ride details')
        }
        
        const text = await response.text()
        console.log('Raw ride by date response:', text)
        
        if (!text) {
          console.log('Empty response received')
          return []
        }
        
        try {
          const data = JSON.parse(text)
          console.log('Parsed ride by date data:', data)
          return data
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Response:', text)
          return []
        }
      },

      async getUserTotalRides(userId: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/users/${userId}/rides/total`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          console.error('Total Rides API Error:', response.status, response.statusText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data.total_rides || 0
      },

      async deleteInvite(inviteId: string): Promise<void> {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/invites/${inviteId}`, {
          method: 'DELETE',
          headers
        });

        if (!response.ok) {
          const text = await response.text()
          console.error('Delete invite error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          throw new Error(text || 'Failed to delete invite')
        }
      },

      async getRideDetails(rideId: string) {
        if (useMockApi) {
          return mockService.getActiveRide('mock-user-id')
        }
        const headers = await getHeaders()
        console.log('Making request to get ride details for:', rideId)
        
        const response = await fetch(`${API_URL}/api/rides/${rideId}`, { 
          method: 'GET',
          headers 
        })

        if (!response.ok) {
          console.error('Ride Details API Error:', response.status, response.statusText)
          const responseText = await response.text()
          console.error('Response body:', responseText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const text = await response.text()
        console.log('Raw ride details response:', text)
        
        if (!text) {
          console.log('Empty response received')
          return null
        }

        try {
          const data = JSON.parse(text)
          console.log('Parsed ride details:', data)
          return data
        } catch (error) {
          console.error('JSON Parse Error:', error, 'Response:', text)
          return null
        }
      },

      // Location tracking methods
      async updateUserLocation(rideId: string, latitude: number, longitude: number, timestamp?: string) {
        const headers = await getHeaders()
        const body = {
          latitude,
          longitude,
          ...(timestamp && { timestamp })
        }

        const response = await fetch(`${API_URL}/api/location/update/${rideId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          const text = await response.text()
          console.error('Update location error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          throw new Error(text || 'Failed to update location')
        }
      },

      async getLatestLocations(rideId: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/location/latest/${rideId}`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          const text = await response.text()
          console.error('Get latest locations error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          throw new Error(text || 'Failed to get latest locations')
        }

        const data = await response.json()
        console.log('Latest locations response:', data)
        
        // Handle different response formats
        if (Array.isArray(data)) {
          return data
        } else if (data && Array.isArray(data.locations)) {
          return data.locations
        } else if (data && data.count === 0) {
          // Backend returned empty result
          return []
        } else {
          console.warn('Unexpected response format for latest locations:', data)
          return []
        }
      },

      async getUserLatestLocation(userId: string, rideId: string) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/location/latest/${userId}/${rideId}`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          const text = await response.text()
          console.error('Get user latest location error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          throw new Error(text || 'Failed to get user latest location')
        }

        return response.json()
      },

      async getLocationHistory(userId: string, rideId: string, limit: number = 100) {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/location/history/${userId}/${rideId}?limit=${limit}`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          const text = await response.text()
          console.error('Get location history error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          throw new Error(text || 'Failed to get location history')
        }

        return response.json()
      },

      async updateLocationSettings(locationSharingEnabled: boolean, homeLatitude?: number, homeLongitude?: number) {
        const headers = await getHeaders()
        const body = {
          location_sharing_enabled: locationSharingEnabled,
          ...(homeLatitude !== undefined && { home_latitude: homeLatitude }),
          ...(homeLongitude !== undefined && { home_longitude: homeLongitude })
        }

        const response = await fetch(`${API_URL}/api/location/settings`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          const text = await response.text()
          console.error('Update location settings error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          throw new Error(text || 'Failed to update location settings')
        }
      },

      async getLocationSettings() {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/api/location/settings`, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          const text = await response.text()
          console.error('Get location settings error:', {
            status: response.status,
            statusText: response.statusText,
            body: text
          })
          throw new Error(text || 'Failed to get location settings')
        }

        return response.json()
      },

      async getRecentActivity(limit = 20) {
        const headers = await getHeaders();
        const url = `${API_URL}/api/activity?limit=${limit}`;
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch recent activity');
        }
        return response.json();
      },

      async createOrFetchInviteLink(carpoolId: string, expiresInDays: number = 30, maxUses: number = -1) {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/api/carpools/${carpoolId}/invite-link`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ expires_in_days: expiresInDays, max_uses: maxUses })
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to create invite link');
        }
        return response.json();
      },
    }
  }, [getToken])
}