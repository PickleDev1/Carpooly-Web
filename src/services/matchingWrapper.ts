import { useMatchingService as useRealMatchingService } from './matching'
import { useMatchingServiceDemo } from './matchingDemo'

// DEMO MODE: Set to true to force mock data usage for demo purposes
const useMockMatching = true

// Wrapper that returns the appropriate service based on the demo mode flag
export const useMatchingService = () => {
  const realService = useRealMatchingService()
  const demoService = useMatchingServiceDemo()
  
  if (useMockMatching) {
    console.log("🎬 DEMO MODE: Using fast demo service")
    return demoService
  } else {
    console.log("🔐 PRODUCTION MODE: Using real matching service")
    return realService
  }
}
