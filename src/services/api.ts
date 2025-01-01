import { Carpool, CompletedRide, Analytics } from '@/types/api'
import { useAuth } from '@clerk/nextjs'

const API_URL = process.env.NEXT_PUBLIC_API_URL

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      error?.message || `HTTP error! status: ${response.status}`
    )
  }
  return response.json()
}

// Create a hook to use the API with auth
export const useApi = () => {
  const { getToken } = useAuth();

  return {
    async createCarpool(carpool: Omit<Carpool, 'id'>): Promise<Carpool> {
      const token = await getToken();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      
      const response = await fetch(`${API_URL}/api/carpools`, {
        method: 'POST',
        headers,
        body: JSON.stringify(carpool),
      })
      return handleResponse<Carpool>(response)
    },

    async getCarpools(): Promise<Carpool[]> {
      const token = await getToken();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      
      const response = await fetch(`${API_URL}/api/carpools`, { headers })
      return handleResponse<Carpool[]>(response)
    },

    async getCarpool(id: string): Promise<Carpool> {
      const response = await fetch(`${API_URL}/api/carpools/${id}`, {
        headers: {
          'Accept': 'application/json',
        },
      })
      return handleResponse<Carpool>(response)
    },

    // History endpoints
    async getRideHistory(): Promise<CompletedRide[]> {
      const response = await fetch(`${API_URL}/api/history`, {
        headers: {
          'Accept': 'application/json',
        },
      })
      return handleResponse<CompletedRide[]>(response)
    },

    // Analytics endpoints
    async getAnalytics(): Promise<Analytics> {
      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: {
          'Accept': 'application/json',
        },
      })
      return handleResponse<Analytics>(response)
    },
  }
}
