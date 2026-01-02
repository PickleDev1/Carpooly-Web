# Breaking Changes Analysis - Frontend Corrections

**Date:** 2025-01-XX  
**Status:** ⚠️ **CRITICAL - BREAKING CHANGES IDENTIFIED**

---

## Executive Summary

**YES, some changes WILL break existing code.** However, the current code is already providing the required parameters, so the fix is straightforward.

---

## 🔴 Breaking Changes

### 1. `sendRequest` Method Signature Change

**Current Code (WORKING):**
```typescript
// src/services/matching.ts (line 377)
async sendRequest(
  toUserId: string,
  potentialMatchId?: string,      // Optional
  message?: string,                // Optional
  carpoolName?: string,            // Optional
  preferredCarpoolSize?: number   // Optional
): Promise<MatchRequestResponse>
```

**Current Call Site (WORKING):**
```typescript
// src/components/matching/PotentialMatches.tsx (line 327-332)
const response = await matchingService.sendRequest(
  toUserClerkId,    // toUserId (required)
  matchId,          // potentialMatchId (provided)
  message,          // message (provided)
  carpoolName,      // carpoolName (provided)
  preferredSize     // preferredCarpoolSize (provided)
)
```

**Proposed Change (BACKEND REQUIREMENT):**
```typescript
// Backend requires carpoolName and preferredCarpoolSize to be required
async sendRequest(
  toUserId: string,
  potentialMatchId: string,        // Required
  carpoolName: string,              // Required (was optional)
  preferredCarpoolSize: number,    // Required (was optional)
  message?: string                  // Optional (moved to end)
): Promise<MatchRequestResponse>
```

**⚠️ PROBLEM:** Parameter order is different!

- **Current order:** `(toUserId, potentialMatchId, message, carpoolName, preferredCarpoolSize)`
- **Proposed order:** `(toUserId, potentialMatchId, carpoolName, preferredCarpoolSize, message)`

**Impact:** 
- ✅ The call site already provides all values
- ❌ BUT the parameter order is wrong - `message` and `carpoolName` are swapped!

**Fix Required:**
```typescript
// Option 1: Keep current order, just make parameters required
async sendRequest(
  toUserId: string,
  potentialMatchId: string,        // Make required
  message: string,                  // Keep in same position
  carpoolName: string,              // Make required, keep in same position
  preferredCarpoolSize: number,    // Make required, keep in same position
  scope?: Scope                     // Add scope at end
): Promise<MatchRequestResponse>

// Option 2: Change order to match backend expectation (BREAKS EXISTING CODE)
// Would require updating call site
```

**Recommendation:** Use **Option 1** - Keep current parameter order, just make them required. This is backward compatible with the call site.

---

### 2. API Endpoint Name

**Current Code:**
```typescript
// src/services/matching.ts (line 257)
const base = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/potential-matches`
```

**Note:** There's also a `findMatches` method (line 318) that uses:
```typescript
const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/find-matches`
```

**Question:** Which endpoint does the backend actually use?

- `GET /api/matching/potential-matches` (current `getPotentialMatches`)
- `POST /api/matching/find-matches` (current `findMatches`)

**Impact:**
- If backend uses `find-matches` for GET requests → **BREAKING CHANGE**
- If backend uses `potential-matches` → **NO CHANGE NEEDED**

**Action Required:** Verify with backend which endpoint name is correct.

---

## ✅ Non-Breaking Changes (Safe)

### 1. Adding `id` Field to MatchingPreferences

**Impact:** ✅ **SAFE** - Optional field, existing code ignores it

```typescript
export interface MatchingPreferences {
  id?: string;  // NEW - optional, won't break existing code
  user_id: string;
  // ... rest
}
```

### 2. Adding `company_id` and `site_id` to Interfaces

**Impact:** ✅ **SAFE** - Optional fields, existing code ignores them

```typescript
export interface MatchRequest {
  // ... existing fields
  company_id?: string | null;  // NEW - optional
  site_id?: string | null;     // NEW - optional
}

export interface Carpool {
  // ... existing fields
  company_id?: string | null;  // NEW - optional
  site_id?: string | null;     // NEW - optional
}
```

### 3. Handling "Not Configured" Response

**Impact:** ✅ **SAFE** - Additive change, existing code still works

```typescript
// Current: Always returns MatchingPreferences
// New: Can return MatchingPreferences OR { configured: false, ... }
// Existing code that expects MatchingPreferences still works
// New code can check for 'configured' property
```

---

## 🔧 Recommended Fix Strategy

### Phase 1: Safe Changes (No Breaking)

1. ✅ Add `id` field to `MatchingPreferences` interface
2. ✅ Add `company_id` and `site_id` to `MatchRequest` interface
3. ✅ Add `company_id` and `site_id` to `Carpool` interface
4. ✅ Add "not configured" response handling (with type guard)

### Phase 2: Verify Endpoint Name

1. ⚠️ **VERIFY** with backend: Which endpoint name is correct?
   - `GET /api/matching/potential-matches`?
   - `GET /api/matching/find-matches`?
   - Or both exist for different purposes?

### Phase 3: Fix sendRequest (Minimal Breaking)

**Option A: Keep Current Order (Recommended)**
```typescript
// Make parameters required but keep same order
async sendRequest(
  toUserId: string,
  potentialMatchId: string,        // Required
  message: string,                  // Required (or keep optional?)
  carpoolName: string,              // Required
  preferredCarpoolSize: number,    // Required
  scope?: Scope                     // New, optional
): Promise<MatchRequestResponse>
```

**Update call site:**
```typescript
// Current call already provides all values in correct order
const response = await matchingService.sendRequest(
  toUserClerkId,    // toUserId
  matchId,          // potentialMatchId
  message,          // message
  carpoolName,      // carpoolName
  preferredSize,    // preferredCarpoolSize
  activeScope       // scope (new, optional)
)
```

**Option B: Change Order (More Breaking)**
```typescript
// Match backend expectation exactly
async sendRequest(
  toUserId: string,
  potentialMatchId: string,
  carpoolName: string,
  preferredCarpoolSize: number,
  message?: string,
  scope?: Scope
): Promise<MatchRequestResponse>
```

**Update call site:**
```typescript
// Must reorder parameters
const response = await matchingService.sendRequest(
  toUserClerkId,    // toUserId
  matchId,          // potentialMatchId
  carpoolName,      // carpoolName (moved up)
  preferredSize,    // preferredCarpoolSize (moved up)
  message,          // message (moved down)
  activeScope       // scope
)
```

**Recommendation:** Use **Option A** - Keep current order. The backend should accept parameters in any order (it's JSON), so this is safer.

---

## 📋 Action Items

### Immediate (Before Company Features)

1. ⚠️ **VERIFY** endpoint name with backend team
2. ✅ Add optional fields to interfaces (safe)
3. ✅ Add "not configured" response handling (safe)

### When Implementing Company Features

1. ⚠️ Update `sendRequest` signature (make required params required)
2. ⚠️ Verify call site still works (should be fine if we keep order)
3. ⚠️ Add scope parameter to `sendRequest` calls

---

## ✅ Summary

**Breaking Changes:**
- ❌ `sendRequest` parameter requirements (but call site already provides them)
- ❌ Possible endpoint name change (needs verification)

**Safe Changes:**
- ✅ Adding optional fields to interfaces
- ✅ Adding "not configured" response handling

**Recommendation:**
1. **Verify endpoint name** with backend first
2. **Keep current parameter order** for `sendRequest` (just make them required)
3. **Apply safe changes** immediately
4. **Update `sendRequest`** when implementing company features

---

**Status:** ⚠️ **MINIMAL BREAKING CHANGES** - Mostly safe, but needs verification

