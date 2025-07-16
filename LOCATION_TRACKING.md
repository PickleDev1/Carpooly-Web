# Location Tracking Implementation

This document describes the location tracking implementation in the Carpooly web application.

## Overview

The location tracking system uses the standard Web Geolocation API to provide real-time location sharing for carpool participants. The implementation follows standard web practices and works across all modern browsers including iOS Safari.

## Architecture

### Core Components

1. **Location Tracking Hook** (`useLocationTracking`)
   - Manages location sharing state
   - Handles permission requests
   - Coordinates location updates
   - Provides manual location request functionality

2. **Location Utils** (`iOSLocationUtils`)
   - Standard geolocation request handling
   - Permission checking
   - Error handling and user feedback

3. **API Integration**
   - Updates user location via API
   - Fetches latest locations from all participants
   - Manages location sharing settings

## Implementation Details

### Permission Handling

The system uses the standard Permissions API when available, with fallback to geolocation requests for permission checking:

```typescript
async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
  if (navigator.permissions) {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
    return result.state
  }
  return 'prompt' // Fallback: assume we can prompt
}
```

### Location Requests

Location requests use standard geolocation options with reasonable timeouts:

```typescript
const options = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000
}
```

### Error Handling

The system provides clear error messages for different failure scenarios:

- **Permission Denied**: "Location access denied. Please allow location access in your browser settings."
- **Position Unavailable**: "Location information unavailable."
- **Timeout**: "Location request timed out. Please try again."

## User Experience

### Initial Setup

1. User enables location sharing during onboarding
2. System requests location permission when first needed
3. If permission granted, location tracking begins automatically
4. If permission denied, user can retry via toggle

### Real-time Updates

- Location updates every 5 seconds when sharing is enabled
- Automatic retry on temporary failures
- Clear error messages for permanent failures
- Manual location request option for troubleshooting

### Permission Management

- Respects user's onboarding preference
- Allows toggling location sharing on/off
- Provides clear feedback on permission status
- Handles permission changes gracefully

## Browser Compatibility

### Supported Browsers

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari (macOS)**: Full support
- **Safari (iOS)**: Full support
- **Mobile browsers**: Full support

### Requirements

- HTTPS connection (required for geolocation)
- User permission granted
- Location services enabled on device

## Testing

A test page is available at `/test-location` to verify geolocation functionality:

- Device compatibility check
- Permission status verification
- Basic location request testing
- Native geolocation testing

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check browser settings
   - Ensure HTTPS connection
   - Try refreshing the page

2. **Location Unavailable**
   - Check device location services
   - Ensure GPS/WiFi is enabled
   - Try moving to better signal area

3. **Timeout Errors**
   - Check internet connection
   - Try again in a few seconds
   - Ensure location services are enabled

### Debug Information

The system provides comprehensive logging for debugging:

- Permission check results
- Location request attempts
- Error details and stack traces
- Device compatibility information

## Security Considerations

- Location data is only shared with carpool participants
- HTTPS required for all location requests
- User consent required before location sharing
- Location data not stored permanently
- Clear privacy controls for users

## Performance

- Efficient polling (5-second intervals)
- Automatic cleanup of intervals
- Minimal battery impact
- Graceful degradation on errors

## Future Enhancements

- Background location updates (PWA)
- Geofencing for automatic updates
- Offline location caching
- Enhanced privacy controls 