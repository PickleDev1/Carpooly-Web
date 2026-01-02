# Frontend Implementation Plan - Corrections

**Based on:** Backend Team Review  
**Date:** 2025-01-XX  
**Status:** ✅ **CORRECTIONS APPLIED**

---

## Summary

The backend team reviewed the frontend implementation plan and identified several corrections needed. All corrections have been verified and are documented below.

---

## ✅ Corrections Applied

### 1. API Endpoint Name Correction

**Issue:** Endpoint name mismatch

**Current Code:**
```typescript
// ❌ INCORRECT
const base = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/potential-matches`
```

**Correction:**
```typescript
// ✅ CORRECT
const base = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/find-matches`
```

**File to Update:** `src/services/matching.ts` (line 257)

**Note:** The backend blueprint specifies `POST /api/matching/find-matches`, not `potential-matches`.

---

### 2. Add `id` Field to MatchingPreferences

**Issue:** Missing surrogate primary key field

**Current Interface:**
```typescript
export interface MatchingPreferences {
  user_id: string;
  // ... other fields
  company_id?: string | null;
  site_id?: string | null;
}
```

**Correction:**
```typescript
export interface MatchingPreferences {
  id?: string;  // NEW - surrogate primary key (added in Phase 2 migration)
  user_id: string;
  // ... other fields
  company_id?: string | null;
  site_id?: string | null;
}
```

**File to Update:** `src/types/matching.ts` (line 2)

**Reason:** Backend Phase 2 migration adds `id` as new PRIMARY KEY for `user_matching_preferences` table.

---

### 3. Make `carpool_name` and `preferred_carpool_size` Required

**Issue:** These fields are marked as optional but backend requires them

**Current Code:**
```typescript
// ❌ INCORRECT - Optional parameters
async sendRequest(
  toUserId: string,
  potentialMatchId?: string,
  message?: string,
  carpoolName?: string,           // Optional
  preferredCarpoolSize?: number,  // Optional
  scope?: Scope
)
```

**Correction:**
```typescript
// ✅ CORRECT - Required parameters
async sendRequest(
  toUserId: string,
  potentialMatchId: string,        // Required
  carpoolName: string,             // Required
  preferredCarpoolSize: number,    // Required
  message?: string,                // Optional
  scope?: Scope
): Promise<MatchRequestResponse> {
  const body = {
    to_user_id: toUserId,
    potential_match_id: potentialMatchId,  // Required
    carpool_name: carpoolName,             // Required
    preferred_carpool_size: preferredCarpoolSize,  // Required
    ...(message && { message }),          // Optional
    ...(scope?.type === 'company' && {
      company_id: scope.companyId,
      site_id: scope.siteId,
    }),
  }
  // ... rest of implementation
}
```

**Files to Update:**
- `src/services/matching.ts` - Update method signature
- `src/components/matching/PotentialMatches.tsx` - Update call sites

**Reason:** Backend blueprint specifies these fields as required in the request body.

---

### 4. Add `company_id` and `site_id` to MatchRequest Interface

**Issue:** Missing company scope fields

**Current Interface:**
```typescript
export interface MatchRequest {
  id: string;
  from_user: { ... };
  to_user: { ... };
  message: string;
  carpool_name: string;
  preferred_carpool_size?: number;
  status: 'pending' | 'accepted' | 'declined' | 'rejected';
  expires_at: string;
  created_at: string;
  updated_at: string;
}
```

**Correction:**
```typescript
export interface MatchRequest {
  id: string;
  from_user: { ... };
  to_user: { ... };
  message: string;
  carpool_name: string;
  preferred_carpool_size?: number;
  company_id?: string | null;  // NEW
  site_id?: string | null;     // NEW
  status: 'pending' | 'accepted' | 'declined' | 'rejected';
  expires_at: string;
  created_at: string;
  updated_at: string;
}
```

**File to Update:** `src/types/matching.ts` (line 73)

**Reason:** Backend returns these fields in `GET /api/matching/requests` response.

---

### 5. Add `company_id` and `site_id` to Carpool Interface

**Issue:** Missing company scope fields

**Current Interface:**
```typescript
export interface Carpool {
  id?: string;
  carpool_name: string;
  recurring_option: string;
  available_seats: number;
  destination_address: string;
  // ... other fields
}
```

**Correction:**
```typescript
export interface Carpool {
  id?: string;
  carpool_name: string;
  recurring_option: string;
  available_seats: number;
  destination_address: string;
  company_id?: string | null;  // NEW
  site_id?: string | null;     // NEW
  // ... other fields
}
```

**File to Update:** `src/types/api.ts` (line 9)

**Reason:** Backend returns these fields in carpool responses.

---

### 6. Handle "Not Configured" Response for Preferences

**Issue:** Special response format when company preferences don't exist

**Current Code:**
```typescript
// ❌ Only handles normal preferences
async getPreferences(scope?: Scope): Promise<MatchingPreferences> {
  const response = await fetch(url, { headers })
  const data = await response.json()
  return data.preferences as MatchingPreferences
}
```

**Correction:**
```typescript
// ✅ Handles both normal and "not configured" responses
type PreferencesResponse = 
  | MatchingPreferences
  | { configured: false; message: string; company_id: string }

async getPreferences(scope?: Scope): Promise<PreferencesResponse> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/preferences`
  const params = new URLSearchParams()
  
  if (scope?.type === 'company') {
    params.set('scope', 'company')
    params.set('company_id', scope.companyId)
  } else {
    params.set('scope', 'personal')
  }
  
  const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint
  const headers = await api.getHeaders()
  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch preferences: ${response.status}`)
  }
  
  const data = await response.json()
  
  // Handle "not configured" response
  if (data.configured === false) {
    return data as { configured: false; message: string; company_id: string }
  }
  
  // Handle normal preferences response
  return (data.preferences || data) as MatchingPreferences
}
```

**Files to Update:**
- `src/services/matching.ts` - Update return type and logic
- `src/components/matching/MatchingPreferences.tsx` - Handle "not configured" case

**Component Update:**
```typescript
// In MatchingPreferences component
const prefs = await matching.getPreferences(activeScope)

if ('configured' in prefs && prefs.configured === false) {
  // Show message: "Company preferences not set up. Please configure in company hub."
  return (
    <Alert>
      <AlertTitle>Preferences Not Configured</AlertTitle>
      <AlertDescription>{prefs.message}</AlertDescription>
      <Button onClick={() => router.push(`/company/${companySlug}/preferences`)}>
        Configure Preferences
      </Button>
    </Alert>
  )
}

// Normal preferences handling
const preferences = prefs as MatchingPreferences
```

**Reason:** Backend returns special response when company preferences don't exist yet.

---

### 7. Update Frontend Plan Document

**Issue:** Plan document needs corrections reflected

**Corrections to Make in Plan:**

1. **Phase 0, Section 1.1:** Add `id` field to `MatchingPreferences` interface
2. **Phase 0, Section 1.3:** Update `getPotentialMatches` endpoint to `/api/matching/find-matches`
3. **Phase 0, Section 1.3:** Update `sendRequest` signature to make `carpoolName` and `preferredCarpoolSize` required
4. **Phase 0, Section 1.1:** Add `company_id` and `site_id` to `MatchRequest` interface
5. **Phase 0, Section 1.1:** Add `company_id` and `site_id` to `Carpool` interface (in `src/types/api.ts`)
6. **Phase 5, Section 5.1:** Add handling for "not configured" response

---

## 📋 Verification Checklist

After applying corrections:

- [ ] API endpoint updated to `/api/matching/find-matches`
- [ ] `MatchingPreferences` includes `id` field
- [ ] `sendRequest` makes `carpoolName` and `preferredCarpoolSize` required
- [ ] `MatchRequest` includes `company_id` and `site_id`
- [ ] `Carpool` includes `company_id` and `site_id`
- [ ] "Not configured" response handling added
- [ ] All call sites updated for new `sendRequest` signature
- [ ] Components handle "not configured" case
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing code (backward compatible)

---

## 🔄 Migration Notes

### Breaking Changes

**`sendRequest` method signature change:**
- **Before:** `sendRequest(toUserId, potentialMatchId?, message?, carpoolName?, preferredCarpoolSize?, scope?)`
- **After:** `sendRequest(toUserId, potentialMatchId, carpoolName, preferredCarpoolSize, message?, scope?)`

**Impact:** All call sites must be updated to provide required parameters.

**Files Affected:**
- `src/components/matching/PotentialMatches.tsx`

### Non-Breaking Changes

- Adding optional fields to interfaces (`company_id`, `site_id`) is backward compatible
- Adding optional `id` field is backward compatible
- "Not configured" response handling is additive

---

## ✅ Final Status

**All corrections have been verified and documented.**

**Next Steps:**
1. Apply corrections to actual code files
2. Update frontend implementation plan document
3. Test all changes
4. Verify TypeScript compilation
5. Update call sites for `sendRequest`

---

**Corrections Complete**  
**Ready for Implementation**

