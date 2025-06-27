# Real-Time Location Tracking

This document explains the real-time location tracking feature implemented in CarPooly.

## Overview

The real-time location tracking feature allows carpool members to share their location during rides, enabling better coordination and safety. The feature includes:

- **Real-time location sharing** during active rides
- **Location privacy controls** for users
- **Location history tracking** for route analysis
- **Home location settings** for better carpool matching

## How It Works

### 1. Location Sharing Flow

1. **User enables location sharing** in Location Settings
2. **User joins a carpool ride** and navigates to the live map
3. **App requests location permission** from the browser
4. **Location updates are sent** to the backend every few seconds
5. **Other members can see** the user's location on the live map

### 2. Privacy & Security

- Location data is **only shared during active rides**
- Users can **disable location sharing** at any time
- Location data is **not stored permanently** (configurable)
- **HTTPS required** for location sharing

## API Endpoints

### Update User Location
```
POST /api/location/update/{rideID}
```
Updates the current user's location for a specific ride.

**Request Body:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "timestamp": "2025-06-22T22:00:00Z" // optional
}
```

### Get Latest Locations
```
GET /api/location/latest/{rideID}
```
Fetches the most recent location for every user in the ride.

**Response:**
```json
[
  {
    "id": "location-uuid",
    "user_id": "user-uuid",
    "carpool_ride_id": "ride-uuid",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "timestamp": "2025-06-22T22:00:00Z",
    "created_at": "2025-06-22T22:00:00Z"
  }
]
```

### Location Settings
```
GET /api/location/settings
PUT /api/location/settings
```
Manages user's location sharing preferences and home location.

## Frontend Components

### LiveMap Component
- **Location**: `src/components/LiveMap.tsx`
- **Purpose**: Displays real-time location tracking for a specific ride
- **Features**:
  - Real-time location updates (3-second polling)
  - Location sharing toggle
  - Visual status indicators
  - Member location list

### LocationSettings Component
- **Location**: `src/components/LocationSettings.tsx`
- **Purpose**: Manages user's location sharing preferences
- **Features**:
  - Location sharing toggle
  - Home location setting
  - Privacy information
  - Current location detection

### useLocationTracking Hook
- **Location**: `src/hooks/useLocationTracking.ts`
- **Purpose**: Manages location tracking state and API calls
- **Features**:
  - Automatic polling for location updates
  - Geolocation watching
  - Error handling
  - Cleanup on unmount

## Usage Instructions

### For Users

1. **Enable Location Sharing**:
   - Go to Location Settings (accessible from navigation)
   - Toggle "Enable location sharing"
   - Optionally set your home location

2. **Share Location During Rides**:
   - Navigate to a carpool ride's live map
   - Allow location access when prompted
   - Your location will be shared with other members

3. **View Other Members' Locations**:
   - Open the live map for any active ride
   - See real-time location of all members
   - View location timestamps and coordinates

### For Developers

1. **Adding Location Tracking to a Component**:
```tsx
import { useLocationTracking } from '@/hooks/useLocationTracking'

function MyComponent({ rideId }: { rideId: string }) {
  const {
    locations,
    isSharingEnabled,
    toggleLocationSharing,
    isLoading,
    error
  } = useLocationTracking({
    rideId,
    pollingInterval: 3000,
    autoStartSharing: false
  })

  // Use the location data and functions
}
```

2. **Customizing Polling Interval**:
```tsx
const { locations } = useLocationTracking({
  rideId,
  pollingInterval: 5000, // 5 seconds
  autoStartSharing: true
})
```

## Configuration

### Polling Intervals
- **Default**: 3 seconds
- **Configurable**: Per component via hook options
- **Recommended**: 3-5 seconds for real-time updates

### Geolocation Options
- **High accuracy**: Enabled for better precision
- **Timeout**: 10 seconds
- **Maximum age**: 5 seconds (cached location)

### Privacy Settings
- **Location sharing**: User-controlled toggle
- **Home location**: Optional for better matching
- **Data retention**: Configurable on backend

## Error Handling

The system handles various error scenarios:

1. **Geolocation not supported**: Shows error message
2. **Permission denied**: Prompts user to enable location
3. **Network errors**: Retries with exponential backoff
4. **API errors**: Shows user-friendly error messages

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Full support

## Security Considerations

1. **HTTPS Required**: Location sharing only works over HTTPS
2. **User Consent**: Explicit permission required
3. **Data Minimization**: Only necessary location data is shared
4. **Temporary Storage**: Location data can be configured for temporary storage
5. **User Control**: Users can disable sharing at any time

## Future Enhancements

1. **Route Visualization**: Show user's travel path
2. **ETA Calculation**: Estimate arrival times
3. **Geofencing**: Notify when users enter/exit areas
4. **Offline Support**: Cache location data when offline
5. **Battery Optimization**: Reduce polling frequency on mobile devices 