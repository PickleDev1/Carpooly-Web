import { UserProfile, MatchScore } from './matching'

// DEMO MODE: All matching algorithm code commented out - using pure mock data

/*
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
    dealbreakers.push("Too far for pickup")
  }

  // Route overlap scoring (60% of location score)
  if (routeOverlap >= 0.8) {
    score += 0.6
    reasons.push("Excellent route overlap")
  } else if (routeOverlap >= 0.6) {
    score += 0.45
    reasons.push("Good route overlap")
  } else if (routeOverlap >= 0.4) {
    score += 0.3
    reasons.push("Moderate route overlap")
  } else if (routeOverlap >= 0.2) {
    score += 0.15
    reasons.push("Some route overlap")
  } else {
    dealbreakers.push("Minimal route overlap")
  }

  return { score, reasons, dealbreakers }
}

// Schedule scoring (30% weight) - matches backend exactly
export const calculateScheduleScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  const time1 = new Date(`2000-01-01T${user1.schedule.departureTime}`)
  const time2 = new Date(`2000-01-01T${user2.schedule.departureTime}`)
  
  const timeDiff = Math.abs(time1.getTime() - time2.getTime()) / (1000 * 60) // minutes
  
  const flexibilityScore = Math.min(
    user1.schedule.flexibilityMinutes,
    user2.schedule.flexibilityMinutes
  ) / Math.max(user1.schedule.flexibilityMinutes, user2.schedule.flexibilityMinutes)
  
  const dayOverlap = calculateDayOverlap(user1.schedule.daysOfWeek, user2.schedule.daysOfWeek)
  
  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Time compatibility (50% of schedule score)
  if (timeDiff <= 5) {
    score += 0.5
    reasons.push("Perfect departure time match")
  } else if (timeDiff <= 15) {
    score += 0.4
    reasons.push("Very close departure times")
  } else if (timeDiff <= 30) {
    score += 0.3
    reasons.push("Close departure times")
  } else if (timeDiff <= 60) {
    score += 0.2
    reasons.push("Acceptable time difference")
  } else {
    dealbreakers.push("Too different departure times")
  }

  // Flexibility compatibility (30% of schedule score)
  if (flexibilityScore >= 0.8) {
    score += 0.3
    reasons.push("Both users are very flexible")
  } else if (flexibilityScore >= 0.6) {
    score += 0.225
    reasons.push("Good flexibility match")
  } else if (flexibilityScore >= 0.4) {
    score += 0.15
    reasons.push("Moderate flexibility")
  } else {
    dealbreakers.push("Incompatible flexibility")
  }

  // Day overlap (20% of schedule score)
  if (dayOverlap >= 0.8) {
    score += 0.2
    reasons.push("Excellent day overlap")
  } else if (dayOverlap >= 0.6) {
    score += 0.15
    reasons.push("Good day overlap")
  } else if (dayOverlap >= 0.4) {
    score += 0.1
    reasons.push("Moderate day overlap")
  } else {
    dealbreakers.push("Minimal day overlap")
  }

  return { score, reasons, dealbreakers }
}

// Demographic scoring (20% weight) - matches backend exactly
export const calculateDemographicScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Age compatibility (40% of demographic score)
  const ageMatch = user1.preferences.demographicPreferences.agePreferences.includes(
    user2.preferences.userDemographics.ageRange
  )
  
  if (ageMatch) {
    score += 0.4
    reasons.push("Age preferences match")
  } else {
    dealbreakers.push("Age preferences don't match")
  }

  // Gender compatibility (30% of demographic score)
  const genderMatch = user1.preferences.demographicPreferences.genderPreferences.includes(
    user2.preferences.userDemographics.gender
  ) || user1.preferences.demographicPreferences.genderPreferences.includes("any")
  
  if (genderMatch) {
    score += 0.3
    reasons.push("Gender preferences compatible")
  } else {
    dealbreakers.push("Gender preferences incompatible")
  }

  // Student status compatibility (15% of demographic score)
  const studentMatch = user1.preferences.demographicPreferences.studentPreference === "both" ||
    (user1.preferences.demographicPreferences.studentPreference === "students_only" && 
     user2.preferences.userDemographics.studentStatus === "student") ||
    (user1.preferences.demographicPreferences.studentPreference === "non_students_only" && 
     user2.preferences.userDemographics.studentStatus === "not_student")
  
  if (studentMatch) {
    score += 0.15
    reasons.push("Student status compatible")
  } else {
    dealbreakers.push("Student status incompatible")
  }

  // Occupation compatibility (15% of demographic score)
  const occupationMatch = user1.preferences.demographicPreferences.occupationPreferences.length === 0 ||
    user1.preferences.demographicPreferences.occupationPreferences.includes(
      user2.preferences.userDemographics.occupation
    )
  
  if (occupationMatch) {
    score += 0.15
    reasons.push("Occupation preferences compatible")
  } else {
    dealbreakers.push("Occupation preferences incompatible")
  }

  return { score, reasons, dealbreakers }
}

// Route scoring (25% weight) - matches backend exactly
export const calculateRouteScore = (
  user1: UserProfile,
  user2: UserProfile
): { score: number; reasons: string[]; dealbreakers: string[] } => {
  const distance = calculateDistance(
    user1.homeLocation.latitude, user1.homeLocation.longitude,
    user2.homeLocation.latitude, user2.homeLocation.longitude
  )

  const maxDetour = user1.preferences.maxDetourMinutes
  const maxPickupDistance = user1.preferences.maxPickupDistanceMiles
  
  let score = 0
  const reasons: string[] = []
  const dealbreakers: string[] = []

  // Pickup distance check
  if (distance > maxPickupDistance) {
    dealbreakers.push("Pickup distance exceeds preference")
    return { score: 0, reasons, dealbreakers }
  }

  // Detour calculation (simplified)
  const estimatedDetour = distance * 2 // Simplified: 2 minutes per mile
  if (estimatedDetour > maxDetour) {
    dealbreakers.push("Estimated detour exceeds preference")
    return { score: 0, reasons, dealbreakers }
  }

  // Route efficiency scoring
  const efficiency = Math.max(0, 1 - (estimatedDetour / maxDetour))
  score = efficiency

  if (efficiency >= 0.8) {
    reasons.push("Very efficient route")
  } else if (efficiency >= 0.6) {
    reasons.push("Efficient route")
  } else if (efficiency >= 0.4) {
    reasons.push("Acceptable route efficiency")
  } else {
    reasons.push("Route efficiency could be better")
  }

  return { score, reasons, dealbreakers }
}

// Group size compatibility check
export const checkGroupSizeCompatibility = (
  user1: UserProfile,
  user2: UserProfile
): { compatible: boolean; reason: string } => {
  const currentGroupSize = user1.currentGroupSize + user2.currentGroupSize
  const maxGroupSize = Math.min(
    user1.preferences.preferredGroupSize,
    user2.preferences.preferredGroupSize
  )

  if (currentGroupSize <= maxGroupSize) {
    return { compatible: true, reason: "Group size within preferences" }
  } else {
    return { compatible: false, reason: "Group size exceeds preferences" }
  }
}

// Driver preference compatibility
export const checkDriverPreference = (
  user1: UserProfile,
  user2: UserProfile
): { compatible: boolean; reason: string } => {
  const driver1 = user1.preferences.driverPreference
  const driver2 = user2.preferences.driverPreference

  if (driver1 === "flexible" || driver2 === "flexible") {
    return { compatible: true, reason: "At least one user is flexible about driving" }
  } else if (driver1 === "prefer_driving" && driver2 === "prefer_riding") {
    return { compatible: true, reason: "Driver preference match" }
  } else if (driver1 === "prefer_riding" && driver2 === "prefer_driving") {
    return { compatible: true, reason: "Driver preference match" }
  } else if (driver1 === "prefer_driving" && driver2 === "prefer_driving") {
    return { compatible: false, reason: "Both prefer driving" }
  } else if (driver1 === "prefer_riding" && driver2 === "prefer_riding") {
    return { compatible: false, reason: "Both prefer riding" }
  } else {
    return { compatible: true, reason: "Driver preferences compatible" }
  }
}

// Main matching algorithm - matches backend exactly
export const calculateMatchScore = (
  user1: UserProfile,
  user2: UserProfile
): MatchScore => {
  // Check group size compatibility first
  const groupSizeCheck = checkGroupSizeCompatibility(user1, user2)
  if (!groupSizeCheck.compatible) {
    return {
      user_id: user2.id,
      compatibility_score: 0,
      route_overlap: 0,
      estimated_detour_minutes: 0,
      match_reasons: [groupSizeCheck.reason],
      totalScore: 0
    }
  }

  // Check driver preference compatibility
  const driverCheck = checkDriverPreference(user1, user2)
  if (!driverCheck.compatible) {
    return {
      user_id: user2.id,
      compatibility_score: 0,
      route_overlap: 0,
      estimated_detour_minutes: 0,
      match_reasons: [driverCheck.reason],
      totalScore: 0
    }
  }

  // Calculate individual scores
  const locationScore = calculateLocationScore(user1, user2)
  const scheduleScore = calculateScheduleScore(user1, user2)
  const demographicScore = calculateDemographicScore(user1, user2)
  const routeScore = calculateRouteScore(user1, user2)

  // Check for dealbreakers
  const allDealbreakers = [
    ...locationScore.dealbreakers,
    ...scheduleScore.dealbreakers,
    ...demographicScore.dealbreakers,
    ...routeScore.dealbreakers
  ]

  if (allDealbreakers.length > 0) {
    return {
      user_id: user2.id,
      compatibility_score: 0,
      route_overlap: 0,
      estimated_detour_minutes: 0,
      match_reasons: allDealbreakers,
      totalScore: 0
    }
  }

  // Calculate weighted total score
  const totalScore = (
    locationScore.score * 0.25 +
    scheduleScore.score * 0.30 +
    demographicScore.score * 0.20 +
    routeScore.score * 0.25
  )

  // Combine all reasons
  const allReasons = [
    ...locationScore.reasons,
    ...scheduleScore.reasons,
    ...demographicScore.reasons,
    ...routeScore.reasons
  ]

  // Calculate route overlap and detour
  const distance = calculateDistance(
    user1.homeLocation.latitude, user1.homeLocation.longitude,
    user2.homeLocation.latitude, user2.homeLocation.longitude
  )
  const routeOverlap = Math.max(0, 1 - (distance / 20))
  const estimatedDetour = distance * 2

  return {
    user_id: user2.id,
    compatibility_score: Math.round(totalScore * 100) / 100,
    route_overlap: Math.round(routeOverlap * 100) / 100,
    estimated_detour_minutes: Math.round(estimatedDetour),
    match_reasons: allReasons,
    totalScore: Math.round(totalScore * 100) / 100
  }
}

// Helper function to calculate day overlap
const calculateDayOverlap = (days1: string[], days2: string[]): number => {
  const set1 = new Set(days1)
  const set2 = new Set(days2)
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  return intersection.size / Math.max(set1.size, set2.size)
}
*/

// DEMO MODE: Pure mock data for demo video
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  console.log("🎬 DEMO MODE: Mock distance calculation")
  return Math.random() * 10 + 2 // Random distance between 2-12 miles
}

export const calculateLocationScore = (user1: UserProfile, user2: UserProfile) => {
  console.log("🎬 DEMO MODE: Mock location score")
  return {
    score: Math.random() * 0.4 + 0.6, // 0.6-1.0
    reasons: ["Close pickup location", "Good route overlap"],
    dealbreakers: []
  }
}

export const calculateScheduleScore = (user1: UserProfile, user2: UserProfile) => {
  console.log("🎬 DEMO MODE: Mock schedule score")
  return {
    score: Math.random() * 0.4 + 0.6, // 0.6-1.0
    reasons: ["Similar departure times", "Good day overlap"],
    dealbreakers: []
  }
}

export const calculateDemographicScore = (user1: UserProfile, user2: UserProfile) => {
  console.log("🎬 DEMO MODE: Mock demographic score")
  return {
    score: Math.random() * 0.4 + 0.6, // 0.6-1.0
    reasons: ["Age preferences match", "Compatible demographics"],
    dealbreakers: []
  }
}

export const calculateRouteScore = (user1: UserProfile, user2: UserProfile) => {
  console.log("🎬 DEMO MODE: Mock route score")
  return {
    score: Math.random() * 0.4 + 0.6, // 0.6-1.0
    reasons: ["Efficient route", "Minimal detour"],
    dealbreakers: []
  }
}

export const checkGroupSizeCompatibility = (user1: UserProfile, user2: UserProfile) => {
  console.log("🎬 DEMO MODE: Mock group size check")
  return { compatible: true, reason: "Group size within preferences" }
}

export const checkDriverPreference = (user1: UserProfile, user2: UserProfile) => {
  console.log("🎬 DEMO MODE: Mock driver preference check")
  return { compatible: true, reason: "Driver preferences compatible" }
}

export const calculateMatchScore = (user1: UserProfile, user2: UserProfile): MatchScore => {
  console.log("🎬 DEMO MODE: Mock match score calculation")
  const totalScore = Math.random() * 0.4 + 0.6 // 0.6-1.0
  return {
    user_id: user2.id,
    compatibility_score: Math.round(totalScore * 100) / 100,
    route_overlap: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100,
    estimated_detour_minutes: Math.floor(Math.random() * 10) + 5,
    match_reasons: ["Similar route", "Close pickup location", "Compatible schedule"],
    totalScore: Math.round(totalScore * 100) / 100
  }
}
