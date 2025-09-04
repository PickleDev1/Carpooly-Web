import { useMatchingService as useRealMatchingService } from './matching'

// DEMO MODE: Use the real service which now only returns mock data
export const useMatchingService = () => {
  console.log("🎬 DEMO MODE: Using real service with mock data only")
  return useRealMatchingService()
}
