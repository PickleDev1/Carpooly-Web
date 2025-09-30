# Backend Matching Algorithm - Technical Specification

## Overview
The current matching system is returning **mock/random data** instead of real calculated values. This document provides detailed specifications for implementing **real calculations** for all matching metrics.

## Current Problem
- **Route Overlap**: Random values (90% → 75% on refresh)
- **Compatibility Score**: Random values (59% → 62% on refresh)  
- **Estimated Savings**: Random values ($89 → $67 on refresh)
- **Total Distance**: Random values (15.7 miles, but other values change)

## Required Real Calculations

### 1. Route Overlap Percentage
**Current**: Random values between 0-100%
**Required**: Actual route overlap calculation

#### Implementation:
```go
func calculateRouteOverlap(user1Route, user2Route Route) float64 {
    // 1. Get actual routes using Google Maps Directions API
    route1 := getDirectionsAPI(user1.HomeLocation, user1.DestinationLocation)
    route2 := getDirectionsAPI(user2.HomeLocation, user2.DestinationLocation)
    
    // 2. Extract road segments from both routes
    segments1 := extractRoadSegments(route1)
    segments2 := extractRoadSegments(route2)
    
    // 3. Calculate overlap percentage
    sharedSegments := findCommonSegments(segments1, segments2)
    totalSegments := len(segments1) + len(segments2) - len(sharedSegments)
    
    return float64(len(sharedSegments)) / float64(totalSegments) * 100
}
```

#### Google Maps API Integration:
- **Directions API**: Get actual driving routes
- **Road segments**: Extract individual road segments
- **Overlap calculation**: Compare segments for shared roads
- **Result**: Real percentage (e.g., 78.5% if 78.5% of routes overlap)

### 2. Compatibility Score (0.0 - 1.0)
**Current**: Random values
**Required**: Weighted algorithm based on 6 factors

#### Algorithm:
```go
func calculateCompatibilityScore(user1, user2 User) float64 {
    weights := map[string]float64{
        "location":     0.30,  // 30% - Distance between home locations
        "schedule":     0.25,  // 25% - Work time alignment
        "route":        0.20,  // 20% - Route overlap percentage
        "demographics": 0.15,  // 15% - Age, gender, student status
        "preferences":  0.10,  // 10% - Carpool preferences
    }
    
    locationScore := calculateLocationCompatibility(user1, user2)
    scheduleScore := calculateScheduleCompatibility(user1, user2)
    routeScore := calculateRouteOverlap(user1, user2) / 100
    demoScore := calculateDemographicCompatibility(user1, user2)
    prefScore := calculatePreferenceCompatibility(user1, user2)
    
    return (locationScore * weights["location"] +
            scheduleScore * weights["schedule"] +
            routeScore * weights["route"] +
            demoScore * weights["demographics"] +
            prefScore * weights["preferences"])
}
```

#### Individual Calculations:

**Location Compatibility (30%):**
```go
func calculateLocationCompatibility(user1, user2 User) float64 {
    distance := calculateDistance(user1.HomeLocation, user2.HomeLocation)
    
    // Score based on distance (closer = higher score)
    if distance <= 2.0 { return 1.0 }      // Same neighborhood
    if distance <= 5.0 { return 0.8 }       // Nearby
    if distance <= 10.0 { return 0.6 }      // Reasonable distance
    if distance <= 20.0 { return 0.4 }     // Far but possible
    return 0.2                              // Very far
}
```

**Schedule Compatibility (25%):**
```go
func calculateScheduleCompatibility(user1, user2 User) float64 {
    timeDiff := calculateTimeDifference(user1.WorkStartTime, user2.WorkStartTime)
    dayOverlap := calculateDayOverlap(user1.WorkDays, user2.WorkDays)
    
    timeScore := 1.0 - (timeDiff / 120.0) // 120 minutes max difference
    dayScore := float64(dayOverlap) / 5.0  // 5 work days max
    
    return (timeScore * 0.7) + (dayScore * 0.3)
}
```

**Demographic Compatibility (15%):**
```go
func calculateDemographicCompatibility(user1, user2 User) float64 {
    ageDiff := math.Abs(user1.Age - user2.Age)
    genderMatch := user1.GenderPreference == user2.Gender || user1.GenderPreference == "any"
    studentMatch := user1.StudentStatus == user2.StudentStatus
    
    ageScore := 1.0 - (ageDiff / 50.0) // 50 years max difference
    genderScore := 1.0 if genderMatch else 0.0
    studentScore := 1.0 if studentMatch else 0.5
    
    return (ageScore * 0.4) + (genderScore * 0.3) + (studentScore * 0.3)
}
```

### 3. Estimated Savings (Real Dollar Amount)
**Current**: Random values ($89, $67)
**Required**: Actual cost calculations

#### Implementation:
```go
func calculateEstimatedSavings(user1, user2 User, route Route) float64 {
    // Individual commute costs
    individualCost1 := calculateCommuteCost(user1, route)
    individualCost2 := calculateCommuteCost(user2, route)
    
    // Shared carpool costs
    carpoolCost := calculateCarpoolCost(user1, user2, route)
    
    // Total savings per month
    monthlySavings := (individualCost1 + individualCost2 - carpoolCost) * 22 // 22 work days
    
    return monthlySavings
}

func calculateCommuteCost(user User, route Route) float64 {
    distance := route.TotalDistance
    gasPrice := 4.50 // Current gas price per gallon
    mpg := 25.0      // Average MPG
    
    gasCost := (distance / mpg) * gasPrice
    parkingCost := 15.0 // Daily parking
    tollCost := route.TollCost
    
    return gasCost + parkingCost + tollCost
}
```

### 4. Total Distance (Real Miles)
**Current**: Random values
**Required**: Actual Google Maps distance

#### Implementation:
```go
func calculateTotalDistance(user1, user2 User) float64 {
    // Get actual route using Google Maps Directions API
    waypoints := []Location{
        user1.HomeLocation,
        user2.HomeLocation,
        user1.DestinationLocation,
    }
    
    route := getDirectionsAPI(waypoints)
    return route.TotalDistance // Real miles from Google Maps
}
```

### 5. Schedule Compatibility Details
**Current**: Random times
**Required**: Calculated optimal schedule

#### Implementation:
```go
func calculateScheduleCompatibility(user1, user2 User) ScheduleCompatibility {
    // Find optimal departure time
    optimalTime := findOptimalDepartureTime(user1, user2)
    
    // Calculate flexibility needed
    flexibility := calculateFlexibility(user1, user2)
    
    // Determine frequency
    frequency := determineFrequency(user1, user2)
    
    return ScheduleCompatibility{
        DepartureTime: optimalTime,
        FlexibilityMinutes: flexibility,
        Frequency: frequency,
    }
}
```

## API Response Format

### Current Response (Mock Data):
```json
{
  "compatibility_score": 0.71,           // RANDOM
  "estimated_savings_per_month": 89,     // RANDOM  
  "route_overlap_percentage": 85,        // RANDOM
  "total_distance_miles": 15.7          // RANDOM
}
```

### Required Response (Real Data):
```json
{
  "compatibility_score": 0.78,           // REAL calculated
  "estimated_savings_per_month": 127.50,  // REAL calculated
  "route_overlap_percentage": 85.2,       // REAL calculated  
  "total_distance_miles": 12.3,          // REAL calculated
  "schedule_compatibility": {
    "departure_time": "8:00 AM",         // REAL calculated
    "flexibility_minutes": 15,          // REAL calculated
    "frequency": "Daily"                // REAL calculated
  }
}
```

## Required Dependencies

### Google Maps APIs:
1. **Directions API**: Get actual driving routes
2. **Distance Matrix API**: Calculate travel times
3. **Geocoding API**: Convert addresses to coordinates
4. **Roads API**: Get detailed road segments

### Environment Variables:
```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_MAPS_BASE_URL=https://maps.googleapis.com/maps/api
```

### Go Dependencies:
```go
import (
    "googlemaps.github.io/maps"
    "github.com/google/uuid"
    "time"
    "math"
)
```

## Implementation Priority

### Phase 1 (High Priority - Core Matching):
1. **Route Overlap Calculation** - Essential for matching
2. **Total Distance Calculation** - Required for feasibility
3. **Basic Compatibility Score** - Core matching logic

### Phase 2 (Medium Priority - Accuracy):
1. **Detailed Compatibility Algorithm** - All 6 factors
2. **Schedule Compatibility** - Time optimization
3. **Demographic Matching** - User preferences

### Phase 3 (Low Priority - Optimization):
1. **Savings Calculations** - Cost optimization
2. **Traffic Integration** - Real-time data
3. **Advanced Scheduling** - Flexibility calculations

## Testing Requirements

### Unit Tests:
```go
func TestCalculateRouteOverlap(t *testing.T) {
    // Test with known routes
    route1 := Route{Start: Location{37.7749, -122.4194}, End: Location{37.7849, -122.4094}}
    route2 := Route{Start: Location{37.7759, -122.4184}, End: Location{37.7859, -122.4084}}
    
    overlap := calculateRouteOverlap(route1, route2)
    assert.True(t, overlap > 0.0 && overlap <= 100.0)
}

func TestCompatibilityScore(t *testing.T) {
    user1 := User{HomeLocation: Location{37.7749, -122.4194}, WorkStartTime: "08:00"}
    user2 := User{HomeLocation: Location{37.7759, -122.4184}, WorkStartTime: "08:15"}
    
    score := calculateCompatibilityScore(user1, user2)
    assert.True(t, score >= 0.0 && score <= 1.0)
}
```

### Integration Tests:
```go
func TestMatchingAPI(t *testing.T) {
    // Test that API returns real calculated values
    response := callMatchingAPI()
    
    // Verify values are consistent (not random)
    assert.NotEqual(t, response.CompatibilityScore, 0.0)
    assert.True(t, response.RouteOverlapPercentage > 0.0)
    assert.True(t, response.EstimatedSavings > 0.0)
}
```

## Performance Considerations

### Caching Strategy:
- **Route calculations**: Cache for 24 hours (routes don't change often)
- **Compatibility scores**: Cache for 1 hour (user data changes infrequently)
- **Google Maps API**: Implement rate limiting and caching

### Database Optimization:
- **Indexes**: On home_location, destination_location, work_start_time
- **Precomputed scores**: Store calculated compatibility scores
- **Batch processing**: Calculate matches in background jobs

## Monitoring & Debugging

### Logging Requirements:
```go
log.Info("Route overlap calculation", 
    "user1_id", user1.ID,
    "user2_id", user2.ID, 
    "overlap_percentage", overlap,
    "calculation_time_ms", duration)
```

### Metrics to Track:
- **API response times** for route calculations
- **Google Maps API usage** and costs
- **Cache hit rates** for route data
- **Accuracy of predictions** vs actual outcomes

## Migration Strategy

### Step 1: Implement Real Calculations
- Add Google Maps API integration
- Implement route overlap calculation
- Update compatibility score algorithm

### Step 2: A/B Testing
- Run both mock and real data in parallel
- Compare results and performance
- Gradually migrate users to real data

### Step 3: Full Migration
- Remove all mock data
- Enable real calculations for all users
- Monitor performance and accuracy

## Success Criteria

### Functional Requirements:
- ✅ **Consistent values**: Same users always get same scores
- ✅ **Realistic ranges**: Scores within expected ranges
- ✅ **Performance**: API responses under 2 seconds
- ✅ **Accuracy**: High user satisfaction with matches

### Technical Requirements:
- ✅ **No random data**: All values calculated from real inputs
- ✅ **Reproducible**: Same inputs always produce same outputs
- ✅ **Scalable**: Handle 1000+ concurrent users
- ✅ **Reliable**: 99.9% uptime for matching service

## Contact Information

For questions about this specification:
- **Frontend Team**: [Your contact info]
- **Backend Team**: [Backend team contact]
- **Project Manager**: [PM contact]

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready for Implementation
