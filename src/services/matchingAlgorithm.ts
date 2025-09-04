import { UserProfile, MatchScore } from './matching'

// Utility function to calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Location scoring (25% weight) - matches backend exactly
export const calculateLocationScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  const distance = calculateDistance(
    user1.homeLocation.latitude, user1.homeLocation.longitude,
    user2.homeLocation.latitude, user2.homeLocation.longitude
  )

  // Simplified route overlap calculation
  const routeOverlap = Math.max(0, 1 - (distance / 20)) // 20 miles = 100% overlap
  
  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Distance scoring (40% of location score)
  if (distance <= 2) {
    score += 0.4
    reasons.push("Very close pickup location")
  } else if (distance <= 5) {
    score += 0.3
    reasons.push("Close pickup location")
  } else if (distance <= 10) {
    score += 0.2
    reasons.push("Reasonable pickup distance")
  } else if (distance <= 15) {
    score += 0.1
    reasons.push("Acceptable pickup distance")
  } else {
    dealbreakers.push("Pickup location too far")
  }

  // Route overlap scoring (60% of location score)
  if (routeOverlap >= 0.8) {
    score += 0.6
    reasons.push("Excellent route overlap")
  } else if (routeOverlap >= 0.6) {
    score += 0.4
    reasons.push("Good route overlap")
  } else if (routeOverlap >= 0.4) {
    score += 0.2
    reasons.push("Moderate route overlap")
  } else {
    dealbreakers.push("Poor route overlap")
  }

  return { score: Math.min(score, 1.0), reasons, dealbreakers }
}

// Schedule scoring (25% weight) - matches backend exactly
export const calculateScheduleScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  const time1 = new Date(`2000-01-01T${user1.schedule.departureTime}`)
  const time2 = new Date(`2000-01-01T${user2.schedule.departureTime}`)
  const timeDiff = Math.abs(time1.getTime() - time2.getTime()) / (1000 * 60) // minutes

  const flexibilityOverlap = Math.min(
    user1.schedule.flexibilityMinutes,
    user2.schedule.flexibilityMinutes
  ) / Math.max(user1.schedule.flexibilityMinutes, user2.schedule.flexibilityMinutes)

  const dayOverlap = calculateDayOverlap(user1.schedule.daysOfWeek, user2.schedule.daysOfWeek)

  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Time difference scoring (40% of schedule score)
  if (timeDiff <= 15) {
    score += 0.4
    reasons.push("Perfect departure time match")
  } else if (timeDiff <= 30) {
    score += 0.3
    reasons.push("Good departure time match")
  } else if (timeDiff <= 60) {
    score += 0.2
    reasons.push("Acceptable departure time difference")
  } else if (timeDiff <= 120) {
    score += 0.1
    reasons.push("Moderate departure time difference")
  } else {
    dealbreakers.push("Departure times too different")
  }

  // Flexibility overlap scoring (30% of schedule score)
  score += flexibilityOverlap * 0.3
  if (flexibilityOverlap > 0.7) {
    reasons.push("Flexible schedules")
  }

  // Day overlap scoring (30% of schedule score)
  score += dayOverlap * 0.3
  if (dayOverlap > 0.8) {
    reasons.push("Same travel days")
  } else if (dayOverlap < 0.3) {
    dealbreakers.push("Different travel days")
  }

  return { score: Math.min(score, 1.0), reasons, dealbreakers }
}

// Helper function to calculate day overlap
const calculateDayOverlap = (days1: string[], days2: string[]): number => {
  if (days1.length === 0 || days2.length === 0) return 0
  const intersection = days1.filter(day => days2.includes(day))
  return intersection.length / Math.max(days1.length, days2.length)
}

// Demographic scoring (20% weight) - matches backend exactly
export const calculateDemographicScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Age preference matching (30% of demographic score)
  const ageMatch = user1.preferences.demographicPreferences.agePreferences.includes(
    user2.preferences.userDemographics.ageRange
  )
  if (ageMatch) {
    score += 0.3
    reasons.push("Age preference match")
  } else {
    dealbreakers.push("Age preference mismatch")
  }

  // Gender preference matching (30% of demographic score)
  const genderMatch = user1.preferences.demographicPreferences.genderPreferences.includes(
    user2.preferences.userDemographics.gender
  ) || user1.preferences.demographicPreferences.genderPreferences.includes("any")
  
  if (genderMatch) {
    score += 0.3
    reasons.push("Gender preference match")
  } else {
    dealbreakers.push("Gender preference mismatch")
  }

  // Student status matching (20% of demographic score)
  const studentMatch = checkStudentCompatibility(
    user1.preferences.demographicPreferences.studentPreference,
    user2.preferences.userDemographics.studentStatus
  )
  
  if (studentMatch) {
    score += 0.2
    reasons.push("Student status match")
  } else {
    dealbreakers.push("Student status mismatch")
  }

  // Occupation preference matching (20% of demographic score)
  const occupationMatch = user1.preferences.demographicPreferences.occupationPreferences.length === 0 ||
    user1.preferences.demographicPreferences.occupationPreferences.includes(
      user2.preferences.userDemographics.occupation
    )
  
  if (occupationMatch && user1.preferences.demographicPreferences.occupationPreferences.length > 0) {
    score += 0.2
    reasons.push("Occupation preference match")
  }

  return { score: Math.min(score, 1.0), reasons, dealbreakers }
}

// Helper function to check student compatibility
const checkStudentCompatibility = (preference: string, status: string): boolean => {
  if (preference === 'both') return true
  if (preference === 'students_only' && status !== 'not_student') return true
  if (preference === 'professionals_only' && status === 'not_student') return true
  return false
}

// Route scoring (15% weight) - matches backend exactly
export const calculateRouteScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  const homeDistance = calculateDistance(
    user1.homeLocation.latitude, user1.homeLocation.longitude,
    user2.homeLocation.latitude, user2.homeLocation.longitude
  )
  
  // Estimate detour time (rough calculation)
  const estimatedDetourMinutes = homeDistance * 3 // Rough estimate: 3 minutes per mile

  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Detour time scoring (60% of route score)
  const maxDetour = user1.preferences.maxDetourMinutes
  if (estimatedDetourMinutes <= maxDetour) {
    const detourScore = Math.max(0, 60 - (estimatedDetourMinutes / maxDetour) * 60)
    score += detourScore / 100 // Convert to 0-1 scale
    reasons.push(`Detour: ${estimatedDetourMinutes.toFixed(0)} minutes (within your ${maxDetour} min limit)`)
  } else {
    dealbreakers.push(`Detour: ${estimatedDetourMinutes.toFixed(0)} minutes (exceeds your ${maxDetour} min limit)`)
  }

  // Pickup distance scoring (40% of route score)
  const maxPickupDistance = user1.preferences.maxPickupDistanceMiles
  if (homeDistance <= maxPickupDistance) {
    const pickupScore = Math.max(0, 40 - (homeDistance / maxPickupDistance) * 40)
    score += pickupScore / 100 // Convert to 0-1 scale
    reasons.push(`Pickup distance: ${homeDistance.toFixed(1)} miles`)
  } else {
    dealbreakers.push(`Pickup distance: ${homeDistance.toFixed(1)} miles (exceeds your ${maxPickupDistance} mile limit)`)
  }

  return { score: Math.min(score, 1.0), reasons, dealbreakers }
}

// Group size scoring (10% weight) - matches backend exactly
export const calculateGroupSizeScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  const currentGroupSize = user1.currentGroupSize + user2.currentGroupSize
  const preferredGroupSize = Math.min(
    user1.preferences.preferredGroupSize,
    user2.preferences.preferredGroupSize
  )

  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Group size compatibility (60% of group size score)
  if (currentGroupSize <= preferredGroupSize) {
    score += 0.6
    reasons.push("Group size preference match")
  } else if (currentGroupSize <= preferredGroupSize + 1) {
    score += 0.4
    reasons.push("Slightly larger group")
  } else if (currentGroupSize <= preferredGroupSize + 2) {
    score += 0.2
    reasons.push("Moderately larger group")
  } else {
    dealbreakers.push("Group size too large")
  }

  // Group size efficiency (40% of group size score)
  if (currentGroupSize >= 3) {
    score += 0.4
    reasons.push("Efficient group size")
  } else if (currentGroupSize >= 2) {
    score += 0.2
    reasons.push("Good group size")
  }

  return { score: Math.min(score, 1.0), reasons, dealbreakers }
}

// Role compatibility scoring (5% weight) - matches backend exactly
export const calculateRoleCompatibilityScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  const driver1 = user1.preferences.driverPreference
  const driver2 = user2.preferences.driverPreference

  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Role compatibility logic
  if (driver1 === "flexible" && driver2 === "flexible") {
    score += 0.8
    reasons.push("Both flexible with driving")
  } else if (driver1 === "driver" && driver2 === "passenger") {
    score += 1.0
    reasons.push("Perfect driver-passenger match")
  } else if (driver1 === "passenger" && driver2 === "driver") {
    score += 1.0
    reasons.push("Perfect driver-passenger match")
  } else if (driver1 === "driver" && driver2 === "driver") {
    score += 0.6
    reasons.push("Both prefer driving")
  } else if (driver1 === "passenger" && driver2 === "passenger") {
    score += 0.3
    reasons.push("Both prefer being passengers")
  } else if (driver1 === "flexible" || driver2 === "flexible") {
    score += 0.7
    reasons.push("One person is flexible")
  } else {
    dealbreakers.push("Role preference conflict")
  }

  return { score: Math.min(score, 1.0), reasons, dealbreakers }
}

// Calculate total match score - matches backend exactly
export const calculateTotalMatchScore = (
  user1: UserProfile,
  user2: UserProfile
): MatchScore => {
  const locationResult = calculateLocationScore(user1, user2)
  const scheduleResult = calculateScheduleScore(user1, user2)
  const demographicResult = calculateDemographicScore(user1, user2)
  const routeResult = calculateRouteScore(user1, user2)
  const groupSizeResult = calculateGroupSizeScore(user1, user2)
  const roleResult = calculateRoleCompatibilityScore(user1, user2)

  // Weighted total score
  const totalScore = 
    locationResult.score * 0.25 +
    scheduleResult.score * 0.25 +
    demographicResult.score * 0.20 +
    routeResult.score * 0.15 +
    groupSizeResult.score * 0.10 +
    roleResult.score * 0.05

  // Combine all reasons
  const allReasons = [
    ...locationResult.reasons,
    ...scheduleResult.reasons,
    ...demographicResult.reasons,
    ...routeResult.reasons,
    ...groupSizeResult.reasons,
    ...roleResult.reasons
  ]

  // Identify dealbreakers
  const allDealbreakers = [
    ...locationResult.dealbreakers,
    ...scheduleResult.dealbreakers,
    ...demographicResult.dealbreakers,
    ...routeResult.dealbreakers,
    ...groupSizeResult.dealbreakers,
    ...roleResult.dealbreakers
  ]

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    locationScore: Math.round(locationResult.score * 100) / 100,
    scheduleScore: Math.round(scheduleResult.score * 100) / 100,
    demographicScore: Math.round(demographicResult.score * 100) / 100,
    routeScore: Math.round(routeResult.score * 100) / 100,
    groupSizeScore: Math.round(groupSizeResult.score * 100) / 100,
    roleCompatibilityScore: Math.round(roleResult.score * 100) / 100,
    reasons: allReasons,
    dealbreakers: allDealbreakers
  }
} 