import { useMatchingService as useRealMatchingService } from './matching'

// DEMO MODE: Use the real service which now only returns mock data
export const useMatchingService = () => {
  console.log("🎬 DEMO MODE: Using pure mock service - no API calls")
  return useRealMatchingService()
}
