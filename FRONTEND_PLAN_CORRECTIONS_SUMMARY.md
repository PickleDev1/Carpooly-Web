# Frontend Plan Corrections - Summary

**Date:** 2025-01-XX  
**Status:** ✅ **ALL CORRECTIONS APPLIED**

---

## Quick Reference

### ✅ Corrections Applied to Plan

1. ✅ **API Endpoint:** Changed `/api/matching/potential-matches` → `/api/matching/find-matches`
2. ✅ **MatchingPreferences:** Added `id?: string` field
3. ✅ **sendRequest:** Made `carpoolName` and `preferredCarpoolSize` required parameters
4. ✅ **MatchRequest:** Added `company_id` and `site_id` fields
5. ✅ **getPreferences:** Added handling for "not configured" response
6. ✅ **Carpool Interface:** Note added - must add `company_id` and `site_id` to `src/types/api.ts`

---

## Code Changes Required

### 1. Update `src/types/matching.ts`

```typescript
export interface MatchingPreferences {
  id?: string;  // ✅ ADD THIS
  user_id: string;
  // ... existing fields
  company_id?: string | null;
  site_id?: string | null;
}

export interface MatchRequest {
  id: string;
  // ... existing fields
  company_id?: string | null;  // ✅ ADD THIS
  site_id?: string | null;     // ✅ ADD THIS
}
```

### 2. Update `src/types/api.ts`

```typescript
export interface Carpool {
  id?: string;
  carpool_name: string;
  // ... existing fields
  company_id?: string | null;  // ✅ ADD THIS
  site_id?: string | null;     // ✅ ADD THIS
}
```

### 3. Update `src/services/matching.ts`

**Change 1: Endpoint name**
```typescript
// Line 257
const base = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/find-matches`  // ✅ Changed
```

**Change 2: sendRequest signature**
```typescript
// ✅ Make these required
async sendRequest(
  toUserId: string,
  potentialMatchId: string,        // Required
  carpoolName: string,              // Required
  preferredCarpoolSize: number,     // Required
  message?: string,                 // Optional
  scope?: Scope
)
```

**Change 3: getPreferences return type**
```typescript
// ✅ Handle "not configured" response
type PreferencesResponse = 
  | MatchingPreferences
  | { configured: false; message: string; company_id: string }

async getPreferences(scope?: Scope): Promise<PreferencesResponse> {
  // ... implementation with check for data.configured === false
}
```

### 4. Update `src/components/matching/PotentialMatches.tsx`

**Update sendRequest call:**
```typescript
// ✅ Provide required parameters
await matching.sendRequest(
  toUserClerkId,
  matchId,              // Required
  carpoolName,          // Required
  preferredSize,        // Required
  message,              // Optional
  activeScope           // Optional
)
```

### 5. Update `src/components/matching/MatchingPreferences.tsx`

**Handle "not configured" response:**
```typescript
const prefs = await matching.getPreferences(activeScope)

if ('configured' in prefs && prefs.configured === false) {
  // Show configuration prompt
  return <NotConfiguredAlert message={prefs.message} />
}

// Normal handling
const preferences = prefs as MatchingPreferences
```

---

## Verification Checklist

- [ ] All TypeScript interfaces updated
- [ ] API endpoint name corrected
- [ ] sendRequest signature updated
- [ ] All sendRequest call sites updated
- [ ] "Not configured" response handling added
- [ ] TypeScript compilation succeeds
- [ ] No runtime errors

---

**All corrections documented and ready for implementation!**

