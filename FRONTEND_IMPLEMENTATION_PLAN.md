# Frontend Implementation Plan - Simplified Preferences System

## 📋 Overview

This document outlines the **frontend implementation plan** for the simplified preferences system. It details what the frontend will build, how it will interact with the backend APIs, and what the backend team can expect.

---

## 🎯 Frontend Goals

1. **Create a two-tier preferences form** (Basic required + Advanced optional)
2. **Display driving time/distance** in potential match cards
3. **Maintain backward compatibility** with existing user preferences
4. **Provide clear validation** for required vs optional fields
5. **Handle data format conversions** (time, days, addresses)

---

## 📐 UI/UX Specifications

### 1. Preferences Form Structure

#### **Layout Design:**

```
┌─────────────────────────────────────────────────┐
│  Carpool Matching Preferences                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  📍 Basic Preferences (Required)                │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Destination Address *                          │
│  [Search for address...]                        │
│  [📍 Selected: 123 Main St, San Francisco, CA]  │
│                                                 │
│  Arrival Time *                                  │
│  [08:30 AM ▼]                                   │
│                                                 │
│  Commute Days *                                  │
│  ☑ Monday  ☑ Tuesday  ☑ Wednesday              │
│  ☑ Thursday  ☑ Friday                           │
│  ☐ Saturday  ☐ Sunday                           │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  [⚙️ Show Advanced Preferences ▼]                │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  [Save Preferences]  [Cancel]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### **Advanced Preferences (When Expanded):**

```
┌─────────────────────────────────────────────────┐
│  ⚙️ Advanced Preferences ▲                     │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Max Detour Time (Optional)                     │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]    │
│  15 minutes                                     │
│                                                 │
│  Preferred Group Size (Optional)                │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]    │
│  4 people (2-5 range)                           │
│                                                 │
│  Driver Preference (Optional)                   │
│  ○ I'll drive                                   │
│  ○ I'll be a passenger                          │
│  ● Flexible                                     │
│                                                 │
│  Schedule Flexibility (Optional)                │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]    │
│  30 minutes                                     │
│                                                 │
│  Max Pickup Distance (Optional)                 │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]    │
│  5.0 miles                                      │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  About You (Optional)                           │
│  Age Range: [26-35 ▼]                           │
│  Gender: [Prefer not to say ▼]                 │
│  Occupation: [Software Engineer]                │
│  Student Status: [Not a student ▼]              │
│  Company: [Tech Corp]                           │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Demographic Preferences (Optional)              │
│  Preferred Ages:                                │
│  ☑ 18-25  ☑ 26-35  ☑ 36-45  ☐ 46-55           │
│                                                 │
│  Preferred Genders:                              │
│  ☑ Any  ☐ Male  ☐ Female  ☐ Non-binary        │
│                                                 │
│  Student Preference:                            │
│  ○ Students only                                │
│  ○ Professionals only                           │
│  ● Both                                         │
│                                                 │
│  Occupation Preferences:                         │
│  [Software Engineer] [Product Manager]          │
│  [+ Add occupation]                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔌 API Integration Details

### 1. **GET /api/matching/preferences**

**Frontend Behavior:**

- **On Component Mount**: Fetch existing preferences
- **If Preferences Exist**: Populate form with all fields (basic + advanced)
- **If No Preferences**: Show empty form with basic section only
- **Advanced Section State**: 
  - If user has advanced preferences set → Show expanded
  - If user has no advanced preferences → Show collapsed

**Response Handling:**

```typescript
interface PreferencesResponse {
  // Basic (Required)
  destination_latitude: number;
  destination_longitude: number;
  arrival_time: string;  // "08:30:00"
  commute_days: string[]; // ["mon", "tue", "wed", "thu", "fri"]
  
  // Advanced (Optional - may be null/undefined)
  max_detour_minutes?: number;
  preferred_group_size?: number;
  driver_preference?: "driver" | "passenger" | "flexible";
  schedule_flexibility_minutes?: number;
  max_pickup_distance_miles?: number;
  user_demographics?: UserDemographics | null;
  demographic_preferences?: DemographicPreferences | null;
  // ... other optional fields
}

// Frontend will:
// 1. Check if advanced fields are set (non-default values)
// 2. Show advanced section expanded if ANY advanced field has a non-default value
// 3. Show advanced section collapsed if ALL advanced fields are null/undefined/default
// 4. If user explicitly cleared advanced fields (sent {}), keep expanded so they can see what was cleared

// Advanced Section Expansion Logic:
const shouldExpandAdvanced = (prefs: PreferencesResponse): boolean => {
  // Check if any advanced field has a non-default value
  if (prefs.max_detour_minutes && prefs.max_detour_minutes !== 15) return true;
  if (prefs.preferred_group_size && prefs.preferred_group_size !== 4) return true;
  if (prefs.driver_preference && prefs.driver_preference !== "flexible") return true;
  if (prefs.schedule_flexibility_minutes && prefs.schedule_flexibility_minutes !== 30) return true;
  if (prefs.max_pickup_distance_miles && prefs.max_pickup_distance_miles !== 5.0) return true;
  if (prefs.user_demographics && Object.keys(prefs.user_demographics).length > 0) return true;
  if (prefs.demographic_preferences && Object.keys(prefs.demographic_preferences).length > 0) return true;
  return false;
};
```

---

### 2. **PUT /api/matching/preferences**

**Frontend Request Format:**

#### **Scenario A: Basic Preferences Only**

```json
{
  "destination_latitude": 37.7749,
  "destination_longitude": -122.4194,
  "arrival_time": "08:30:00",
  "commute_days": ["mon", "tue", "wed", "thu", "fri"]
}
```

**Frontend Actions:**
- User fills only basic fields
- User does NOT expand advanced section
- Frontend submits ONLY basic fields
- Backend applies defaults for advanced fields

#### **Scenario B: Basic + Advanced Preferences**

```json
{
  "destination_latitude": 37.7749,
  "destination_longitude": -122.4194,
  "arrival_time": "08:30:00",
  "commute_days": ["mon", "tue", "wed", "thu", "fri"],
  "max_detour_minutes": 20,
  "preferred_group_size": 5,
  "driver_preference": "driver",
  "schedule_flexibility_minutes": 45,
  "max_pickup_distance_miles": 10.0,
  "user_demographics": {
    "age_range": "26-35",
    "gender": "male",
    "occupation": "Software Engineer",
    "student_status": "not_student",
    "company": "Tech Corp"
  },
  "demographic_preferences": {
    "age_preferences": ["26-35", "36-45"],
    "gender_preferences": ["male", "female"],
    "student_preference": "professionals_only",
    "occupation_preferences": ["Software Engineer", "Product Manager"]
  }
}
```

**Frontend Actions:**
- User fills basic fields
- User expands advanced section and fills some/all advanced fields
- Frontend includes only fields that user explicitly set
- Frontend does NOT include fields user left empty (undefined/null)

#### **Scenario C: Clear Advanced Preferences**

```json
{
  "destination_latitude": 37.7749,
  "destination_longitude": -122.4194,
  "arrival_time": "08:30:00",
  "commute_days": ["mon", "tue", "wed", "thu", "fri"],
  "user_demographics": {},
  "demographic_preferences": {}
}
```

**Frontend Actions:**
- User had advanced preferences set
- User clears all advanced fields
- Frontend sends empty objects `{}` for demographics
- Backend should reset to defaults

**Validation Logic (Frontend):**

```typescript
// Frontend will validate BEFORE submission:

const validateBasicPreferences = (prefs) => {
  const errors = [];
  
  // Check destination
  if (!prefs.destination_latitude || prefs.destination_latitude === 0) {
    errors.push("Please select a destination address");
  }
  
  if (!prefs.destination_longitude || prefs.destination_longitude === 0) {
    errors.push("Please select a destination address");
  }
  
  // Check arrival time
  if (!prefs.arrival_time || prefs.arrival_time.trim() === "") {
    errors.push("Please select an arrival time");
  }
  
  // Check commute days
  if (!prefs.commute_days || prefs.commute_days.length === 0) {
    errors.push("Please select at least one commute day");
  }
  
  return errors;
};

// Frontend will show errors inline and prevent submission if basic validation fails
```

**Error Handling:**

- **400 Bad Request**: Frontend will display validation errors from backend
- **Missing Required Fields**: Frontend prevents submission, shows inline errors
- **Invalid Format**: Frontend validates format before submission (time format, day format)

---

### 3. **GET /api/matching/potential-matches**

**Frontend Display Requirements:**

#### **Match Card Design:**

```
┌─────────────────────────────────────────┐
│  👤 John Doe                            │
│                                         │
│  🏠 8.5 miles away                      │
│  ⏱️ ~18 minutes drive                    │
│                                         │
│  📍 Similar destination                 │
│  📅 Mon, Tue, Wed, Thu, Fri             │
│  ⏰ Arrives ~8:30 AM                    │
│                                         │
│  ⭐ 85% Match                           │
│                                         │
│  💰 $150.50/month savings               │
│                                         │
│  [View Profile]  [Send Request]         │
└─────────────────────────────────────────┘
```

**Response Handling:**

```typescript
interface PotentialMatch {
  id: string;
  user2_id: string;
  compatibility_score: number;
  route_overlap_percentage: number;
  total_distance_miles: number;
  estimated_savings_per_month: number;
  match_reasons: string[];
  status: string;
  
  // NEW FIELDS (from backend)
  driving_time_minutes?: number | null;    // ⭐ NEW
  driving_distance_miles?: number | null;  // ⭐ NEW
  
  user2: {
    id: string;
    name: string;
    display_name: string;
    email: string;
    home_latitude: number;
    home_longitude: number;
  };
}

// Frontend Display Logic:
const formatDrivingTime = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined) {
    return null; // Don't display
  }
  return `~${Math.round(minutes)} minutes`;
};

const formatDistance = (miles: number | null | undefined) => {
  if (miles === null || miles === undefined) {
    return null; // Don't display
  }
  return `${miles.toFixed(1)} miles`;
};

// In match card component:
{driving_distance_miles && (
  <div>🏠 {formatDistance(driving_distance_miles)} away</div>
)}
{driving_time_minutes && (
  <div>⏱️ {formatDrivingTime(driving_time_minutes)} drive</div>
)}
{!driving_time_minutes && !driving_distance_miles && (
  <div className="text-gray-400">Distance unavailable</div>
)}
```

**Frontend Expectations:**

- ✅ Backend will provide `driving_time_minutes` and `driving_distance_miles` for each match
- ✅ Fields may be `null` if calculation fails (frontend will handle gracefully)
- ✅ Frontend will round time to nearest minute
- ✅ Frontend will round distance to 1 decimal place
- ✅ Frontend will show "Distance unavailable" if both fields are null

---

## 🔄 Data Format Conversions

### 1. **Time Format Conversion**

**User Input (Frontend):**
- Display: "08:30 AM" (12-hour format with AM/PM)
- Input: Time picker or text input

**API Submission (Backend):**
- Format: "08:30:00" or "08:30" (24-hour format)
- Required: Must be valid time string

**Frontend Conversion Logic:**

```typescript
// Convert 12-hour to 24-hour for API
const convertTimeToAPI = (time12h: string): string => {
  // Input: "08:30 AM" or "8:30 AM"
  // Output: "08:30:00"
  
  const [time, period] = time12h.split(' ');
  const [hours, minutes] = time.split(':');
  
  let hour24 = parseInt(hours);
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
};

// Convert 24-hour to 12-hour for display
const convertTimeFromAPI = (time24h: string): string => {
  // Input: "08:30:00" or "08:30"
  // Output: "08:30 AM"
  
  const [hours, minutes] = time24h.split(':');
  const hour24 = parseInt(hours);
  
  let hour12 = hour24;
  let period = 'AM';
  
  if (hour24 === 0) {
    hour12 = 12;
  } else if (hour24 === 12) {
    period = 'PM';
  } else if (hour24 > 12) {
    hour12 = hour24 - 12;
    period = 'PM';
  }
  
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
};
```

---

### 2. **Day Format Conversion**

**User Display (Frontend):**
- Display: "Monday", "Tuesday", "Wednesday", etc. (full day names)
- Input: Checkboxes or toggle buttons with full day names

**API Submission (Backend):**
- Format: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] (3-letter lowercase)
- Required: At least one day must be selected

**Frontend Conversion Logic:**

```typescript
// Day name mapping
const DAY_MAPPING = {
  'Monday': 'mon',
  'Tuesday': 'tue',
  'Wednesday': 'wed',
  'Thursday': 'thu',
  'Friday': 'fri',
  'Saturday': 'sat',
  'Sunday': 'sun'
};

const REVERSE_DAY_MAPPING = {
  'mon': 'Monday',
  'tue': 'Tuesday',
  'wed': 'Wednesday',
  'thu': 'Thursday',
  'fri': 'Friday',
  'sat': 'Saturday',
  'sun': 'Sunday'
};

// Convert to API format
const convertDaysToAPI = (days: string[]): string[] => {
  return days.map(day => DAY_MAPPING[day] || day.toLowerCase().substring(0, 3));
};

// Convert from API format
const convertDaysFromAPI = (days: string[]): string[] => {
  return days.map(day => REVERSE_DAY_MAPPING[day] || day);
};
```

---

### 3. **Address Geocoding**

**User Input (Frontend):**
- Input: Address autocomplete (Google Places API)
- Display: Selected address string (e.g., "123 Main St, San Francisco, CA")

**API Submission (Backend):**
- Format: `destination_latitude` and `destination_longitude` (numbers)
- Required: Both must be non-zero

**Frontend Geocoding Logic:**

```typescript
// Using Google Places API
const geocodeAddress = async (address: string): Promise<{lat: number, lng: number}> => {
  // Call Google Places API or Geocoding API
  // Return { lat: 37.7749, lng: -122.4194 }
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.results && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng
    };
  }
  
  throw new Error('Address not found');
};

// Frontend will:
// 1. User selects address from autocomplete
// 2. Frontend geocodes address to get lat/lng
// 3. Frontend stores both address string (for display) and coordinates (for API)
// 4. Frontend submits coordinates to backend
```

---

## 🎨 Component Structure

### **File Organization:**

```
src/
├── components/
│   └── matching/
│       ├── MatchingPreferences.tsx          # Main preferences form
│       ├── BasicPreferencesSection.tsx     # Basic preferences UI
│       ├── AdvancedPreferencesSection.tsx  # Advanced preferences UI (collapsible)
│       └── PotentialMatches.tsx            # Match cards (updated to show driving time)
├── types/
│   └── matching.ts                         # TypeScript interfaces
└── services/
    └── matching.ts                         # API service functions
```

### **Component Hierarchy:**

```
MatchingPreferences (Main Component)
├── BasicPreferencesSection
│   ├── AddressAutocomplete
│   ├── TimePicker
│   └── DaySelector (checkboxes)
├── AdvancedPreferencesSection (Collapsible)
│   ├── SliderInput (detour, group size, etc.)
│   ├── RadioGroup (driver preference)
│   ├── UserDemographicsForm
│   └── DemographicPreferencesForm
└── SaveButton
```

---

## ✅ Frontend Validation Rules

### **Basic Preferences (Required):**

| Field | Validation | Error Message |
|-------|-----------|---------------|
| Destination Address | Must select valid address | "Please select a destination address" |
| Arrival Time | Must be valid time format | "Please select an arrival time" |
| Commute Days | At least one day selected | "Please select at least one commute day" |

### **Advanced Preferences (Optional):**

| Field | Validation | Error Message |
|-------|-----------|---------------|
| Max Detour | 5-60 minutes (if provided) | "Detour time must be between 5 and 60 minutes" |
| Group Size | 2-5 people (if provided) | "Group size must be between 2 and 5" |
| Driver Preference | Valid option (if provided) | "Please select a valid driver preference" |
| Schedule Flexibility | Positive number (if provided) | "Schedule flexibility must be a positive number" |
| Max Pickup Distance | Positive number (if provided) | "Max pickup distance must be a positive number" |

**Frontend Behavior:**
- ✅ Basic validation errors prevent form submission
- ✅ Advanced validation errors show warnings but allow submission (fields are optional)
- ✅ All validation happens client-side before API call
- ✅ Backend validation errors are displayed if client-side validation passes but backend rejects

**Demographic Validation Notes:**
- ✅ If user never touches advanced section → Don't send demographics at all
- ✅ If user clears demographics → Send empty object `{}` for `user_demographics` and `demographic_preferences`
- ✅ Backend will skip validation for empty objects (after backend implementation)
- ✅ Frontend should NOT send demographics if user never expanded advanced section

---

## 🔄 State Management

### **Form State Structure:**

```typescript
interface PreferencesFormState {
  // Basic Preferences (Required)
  destination: {
    address: string;           // Display string
    latitude: number | null;   // For API
    longitude: number | null;  // For API
  };
  arrivalTime: string;        // "08:30 AM" (display format)
  commuteDays: string[];       // ["Monday", "Tuesday", ...] (display format)
  
  // Advanced Preferences (Optional)
  maxDetourMinutes: number | null;
  preferredGroupSize: number | null;
  driverPreference: "driver" | "passenger" | "flexible" | null;
  scheduleFlexibilityMinutes: number | null;
  maxPickupDistanceMiles: number | null;
  userDemographics: UserDemographics | null;
  demographicPreferences: DemographicPreferences | null;
  
  // UI State
  isAdvancedExpanded: boolean;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
}
```

---

## 🧪 Testing Scenarios

### **Frontend Test Cases:**

1. **New User - Basic Only:**
   - User opens preferences form
   - Fills only basic fields
   - Does NOT expand advanced section
   - Submits form
   - ✅ Should submit only basic fields
   - ✅ Should receive success response

2. **New User - Basic + Advanced:**
   - User opens preferences form
   - Fills basic fields
   - Expands advanced section
   - Fills some advanced fields
   - Submits form
   - ✅ Should submit basic + filled advanced fields
   - ✅ Should NOT submit empty advanced fields

3. **Existing User - Update Preferences:**
   - User has existing preferences (basic + advanced)
   - Opens preferences form
   - Form pre-populates with existing values
   - Advanced section is expanded (has values)
   - User modifies some fields
   - Submits form
   - ✅ Should submit all modified fields
   - ✅ Should preserve unchanged fields

4. **Existing User - Clear Advanced:**
   - User has existing advanced preferences
   - Opens preferences form
   - Clears all advanced fields
   - Submits form
   - ✅ Should submit empty objects `{}` for demographics
   - ✅ Backend should reset to defaults

5. **Validation - Missing Required:**
   - User tries to submit without destination
   - ✅ Should show error: "Please select a destination address"
   - ✅ Should prevent submission

6. **Validation - Invalid Time:**
   - User enters invalid time format
   - ✅ Should show error: "Please enter a valid time"
   - ✅ Should prevent submission

7. **Match Display - With Driving Time:**
   - User views potential matches
   - Match has `driving_time_minutes: 18` and `driving_distance_miles: 8.5`
   - ✅ Should display: "🏠 8.5 miles away" and "⏱️ ~18 minutes drive"

8. **Match Display - Without Driving Time:**
   - User views potential matches
   - Match has `driving_time_minutes: null` and `driving_distance_miles: null`
   - ✅ Should display: "Distance unavailable" or hide the fields

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  User Opens     │
│  Preferences    │
│  Form           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GET /api/      │
│  matching/      │
│  preferences    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Populate Form  │
│  - Basic fields │
│  - Advanced     │
│    (if set)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Fills     │
│  Form           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate       │
│  - Basic:       │
│    Required     │
│  - Advanced:    │
│    Optional     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Convert        │
│  - Time: 12h→24h│
│  - Days: Full→  │
│    3-letter     │
│  - Address:     │
│    → lat/lng    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PUT /api/      │
│  matching/      │
│  preferences    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Success/Error  │
│  Display        │
└─────────────────┘
```

---

## 🚀 Implementation Phases

### **Phase 1: Basic Preferences Form (Week 1)**
- ✅ Create BasicPreferencesSection component
- ✅ Implement address autocomplete with geocoding
- ✅ Implement time picker with format conversion
- ✅ Implement day selector with format conversion
- ✅ Add validation for required fields
- ✅ Test form submission with basic fields only

### **Phase 2: Advanced Preferences Form (Week 1-2)**
- ✅ Create AdvancedPreferencesSection component (collapsible)
- ✅ Implement all advanced preference inputs
- ✅ Add optional validation
- ✅ Test form submission with basic + advanced fields
- ✅ Test clearing advanced preferences

### **Phase 3: Match Display Updates (Week 2)**
- ✅ Update PotentialMatches component
- ✅ Add driving time/distance display to match cards
- ✅ Handle null values gracefully
- ✅ Update match card design/layout
- ✅ Test with matches that have/ don't have driving time

### **Phase 4: Integration & Testing (Week 2-3)**
- ✅ Test with existing users (preferences load correctly)
- ✅ Test with new users (empty form)
- ✅ Test all validation scenarios
- ✅ Test error handling
- ✅ Test backward compatibility
- ✅ Refine UI/UX based on feedback

---

## 🔗 Dependencies

### **External Libraries:**

1. **Google Places API** (for address autocomplete)
   - Package: `@react-google-maps/api` or similar
   - Purpose: Address search and geocoding

2. **Date/Time Handling** (already in use)
   - Package: `date-fns`
   - Purpose: Time format conversion

3. **UI Components** (already in use)
   - Package: `lucide-react` (icons)
   - Package: `@radix-ui/react-*` (UI primitives)

---

## 📝 Notes for Backend Team

### **What Frontend Expects:**

1. **API Response Consistency:**
   - ✅ Backend should return all fields (even if null) in GET response
   - ✅ Backend should accept partial updates (only send changed fields)
   - ✅ Backend should use defaults for optional fields if not provided

2. **Error Messages:**
   - ✅ Backend should return clear error messages for validation failures
   - ✅ Error format may be structured: `{ "message": "Error description", "field": "field_name" }`
   - ✅ Error format may be simple: `{ "error": "Error description" }` or string
   - ✅ Frontend will handle both formats and display errors inline next to relevant fields
   
   **Frontend Error Handling:**
   ```typescript
   // Handle both structured and simple errors
   const parseError = (error: any) => {
     if (error.field && error.message) {
       return { field: error.field, message: error.message };
     }
     if (error.message) {
       return { field: null, message: error.message };
     }
     if (error.error) {
       return { field: null, message: error.error };
     }
     if (typeof error === 'string') {
       return { field: null, message: error };
     }
     return { field: null, message: 'An error occurred' };
   };
   ```

3. **Driving Time Fields:**
   - ✅ Backend should calculate and return `driving_time_minutes` and `driving_distance_miles`
   - ✅ Fields can be `null` if calculation fails (frontend handles this)
   - ✅ Fields should be integers/floats (not strings)

4. **Backward Compatibility:**
   - ✅ Existing users' preferences should load correctly
   - ✅ Old preferences format should still work
   - ✅ No breaking changes to API structure

### **What Frontend Will Send:**

1. **Basic Preferences (Always):**
   - `destination_latitude`: number (non-zero)
   - `destination_longitude`: number (non-zero)
   - `arrival_time`: string ("HH:MM:00" or "HH:MM")
   - `commute_days`: string[] (["mon", "tue", ...])

2. **Advanced Preferences (Only if user sets them):**
   - Only fields that user explicitly fills will be sent
   - Empty fields will be `undefined` (not sent in request)
   - Empty demographics will be `{}` (empty object)

3. **Request Body Examples:**

   **Minimal (Basic Only):**
   ```json
   {
     "destination_latitude": 37.7749,
     "destination_longitude": -122.4194,
     "arrival_time": "08:30:00",
     "commute_days": ["mon", "tue", "wed", "thu", "fri"]
   }
   ```

   **Full (Basic + Advanced):**
   ```json
   {
     "destination_latitude": 37.7749,
     "destination_longitude": -122.4194,
     "arrival_time": "08:30:00",
     "commute_days": ["mon", "tue", "wed", "thu", "fri"],
     "max_detour_minutes": 20,
     "preferred_group_size": 5,
     "driver_preference": "driver",
     "user_demographics": {
       "age_range": "26-35",
       "gender": "male"
     },
     "demographic_preferences": {
       "age_preferences": ["26-35", "36-45"]
     }
   }
   ```

---

## ✅ Success Criteria

### **Frontend Implementation is Complete When:**

1. ✅ Users can set basic preferences (destination, time, days)
2. ✅ Users can optionally set advanced preferences
3. ✅ Form validates required fields before submission
4. ✅ Form handles existing preferences correctly
5. ✅ Match cards display driving time/distance
6. ✅ All format conversions work correctly
7. ✅ Error handling is user-friendly
8. ✅ UI is responsive and accessible
9. ✅ Backward compatibility is maintained
10. ✅ All test scenarios pass

---

## 📞 Questions & Clarifications

**Q: What if user clears all advanced preferences?**

A: Frontend will send empty objects `{}` for `user_demographics` and `demographic_preferences`. Backend should reset to defaults.

**Q: Can user submit with only some advanced fields filled?**

A: Yes! Frontend will only send fields that user explicitly set. Backend should use defaults for missing optional fields.

**Q: What if driving time calculation fails?**

A: Backend should return `null` for `driving_time_minutes` and `driving_distance_miles`. Frontend will handle gracefully by showing "Distance unavailable" or hiding the fields.

**Q: How should frontend handle timezone?**

A: Frontend will use user's local timezone for display. Backend should store time in UTC or user's timezone (as currently implemented).

**Q: What if user has old preferences format?**

A: Frontend will load existing preferences and display them. If basic fields are missing, frontend will require user to set them before saving.

---

**Document Version:** 1.1  
**Last Updated:** 2026-01-06  
**Status:** Ready for Frontend Implementation  
**Target Completion:** Week 2-3

---

## 📝 Revision History

### Version 1.1 (2026-01-06) - Backend Review Alignment

**Changes Made Based on Backend Review:**

1. ✅ **Fixed Group Size Validation Range**
   - Changed from "2-8 people" to "2-5 people" to match backend validation
   - Updated error message to "Group size must be between 2 and 5"

2. ✅ **Added Advanced Section Expansion Logic**
   - Added detailed logic for determining when to expand/collapse advanced section
   - Specified that section expands if ANY advanced field has a non-default value
   - Clarified behavior when user clears advanced preferences

3. ✅ **Updated Error Handling**
   - Added support for both structured and simple error formats
   - Added error parsing function to handle multiple error formats
   - Clarified that backend may return different error formats

4. ✅ **Clarified Demographic Validation Behavior**
   - Added notes on when to send demographics vs empty objects
   - Clarified that demographics should NOT be sent if user never touched advanced section
   - Documented that empty objects `{}` should be sent if user explicitly clears demographics

**Alignment Status:** ✅ 100% aligned with backend implementation plan
