# Frontend Implementation - Backend Communication

**Date:** 2025-01-XX  
**To:** Backend Team  
**From:** Frontend Team  
**Subject:** Company Spaces Feature - Frontend Implementation Requirements

---

## Executive Summary

The frontend team has reviewed the backend blueprint and implementation plan. We've designed a **100% backward compatible** implementation strategy that won't break any existing functionality. This document outlines what we need from the backend to ensure smooth integration.

---

## ✅ What We're Implementing (Frontend)

### 1. Company Context Management
- New React context for managing active company/site
- Company selector UI
- Site selection UI
- Scope resolution (personal vs company)

### 2. API Integration
- All existing endpoints will work unchanged (personal scope by default)
- New optional `scope` parameter for company features
- Support for company-specific responses

### 3. UI Components
- Company hub pages
- Company-specific matching views
- Site selection prompts
- Admin analytics (if user has admin role)

---

## 🔍 Questions & Clarifications Needed

### Question 1: API Endpoint Names

**Current Frontend Code Uses:**
- `GET /api/matching/potential-matches` (for getting potential matches)

**Backend Review Mentions:**
- `POST /api/matching/find-matches` (for finding matches)

**Question:** 
- Which endpoint should we use for getting potential matches?
- Are both endpoints supported, or should we migrate to one?
- What's the difference between them?

**Current Frontend Implementation:**
```typescript
// Method: getPotentialMatches
GET /api/matching/potential-matches?min_score=0.7&max_distance=10&...

// Method: findMatches  
POST /api/matching/find-matches
Body: { max_results: 10, filters: {...} }
```

**Request:** Please confirm which endpoint(s) we should use and their exact behavior.

---

### Question 2: sendRequest Parameter Requirements

**Current Frontend Implementation:**
```typescript
async sendRequest(
  toUserId: string,
  potentialMatchId?: string,      // Currently optional
  message?: string,                // Currently optional
  carpoolName?: string,            // Currently optional
  preferredCarpoolSize?: number   // Currently optional
)
```

**Backend Blueprint Says:**
- `carpool_name` is **required**
- `preferred_carpool_size` is **required**
- `potential_match_id` is **required**

**Frontend Strategy (Backward Compatible):**
We will:
1. Keep the method signature unchanged (all optional)
2. Add runtime validation to ensure required fields are provided
3. Throw clear error messages if missing

**Question:**
- Is this acceptable? (We validate at runtime, not compile-time)
- Or do you prefer we make them required in TypeScript? (Would require updating call sites)

**Current Call Site:**
```typescript
// Already provides all required values
await matchingService.sendRequest(
  toUserClerkId,
  matchId,          // potentialMatchId ✅
  message,          // message
  carpoolName,      // carpoolName ✅
  preferredSize     // preferredCarpoolSize ✅
)
```

**Request:** Confirm if runtime validation is acceptable, or if you prefer compile-time (TypeScript required parameters).

---

### Question 3: Scope Parameter Format

**Frontend Plan:**
- Pass scope via query parameters: `?scope=company&company_id=...`
- Or in request body for POST requests

**Backend Blueprint Shows:**
- Query parameters: `?scope=company&company_id=...`
- URL pattern: `/api/company/{slug}/...`
- Request body: `{ scope: "company", company_id: "..." }`

**Question:**
- Which format do you prefer?
- Should we support all three, or just one?
- For consistency, we recommend query parameters for GET, body for POST/PUT

**Request:** Confirm preferred scope indication method(s).

---

### Question 4: "Not Configured" Response Format

**Backend Blueprint Shows:**
```json
{
  "configured": false,
  "message": "Company preferences not set up. Please configure in company hub.",
  "company_id": "uuid-company-1"
}
```

**Question:**
- Is this the exact response format?
- What HTTP status code? (200 OK with `configured: false`, or 404?)
- Should we handle this for personal preferences too, or only company?

**Request:** Confirm exact response format and status codes.

---

### Question 5: Error Response Format

**Backend Blueprint Shows:**
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "field": "field_name",
  "company_id": "uuid-company-1"
}
```

**Questions:**
- Is this the standard format for all errors?
- What are the common error codes we should handle?
- For 403 Forbidden (membership/role errors), is the format the same?

**Request:** Provide complete error response documentation.

---

### Question 6: Carpool Response Fields

**Backend Blueprint Shows:**
- Carpools have `company_id` and `site_id` fields

**Question:**
- Are these fields always present in responses? (even if `null` for personal carpools)
- Or are they omitted when `null`?

**Frontend Plan:**
- We'll handle both cases (present as `null` or omitted)
- TypeScript interfaces use `company_id?: string | null`

**Request:** Confirm response format (always present vs omitted when null).

---

### Question 7: Site Selection Requirement

**Backend Blueprint Says:**
- Option A (Chosen): Site selection required before matching
- If `site_id IS NULL`, matching is blocked

**Question:**
- What error response do we get if trying to match without site selected?
- Status code? Error message format?

**Request:** Confirm error response for missing site selection.

---

### Question 8: Backward Compatibility Guarantees

**Frontend Needs:**
- All existing endpoints work unchanged when no scope provided
- All existing response shapes remain the same (just filtered)
- No breaking changes to existing functionality

**Question:**
- Can you confirm these guarantees?
- Will existing personal users see any changes in behavior?

**Request:** Confirm backward compatibility guarantees.

---

## 📋 What We're Providing (Frontend)

### 1. Request Format

**Personal Scope (Default):**
```typescript
// No scope parameter = personal scope
GET /api/matching/preferences
GET /api/matching/requests
POST /api/matching/requests
  Body: {
    to_user_id: "...",
    potential_match_id: "...",
    carpool_name: "...",
    preferred_carpool_size: 4,
    message: "..."
    // No company_id or site_id
  }
```

**Company Scope:**
```typescript
// With scope parameter
GET /api/matching/preferences?scope=company&company_id=...
GET /api/matching/requests?scope=company&company_id=...
POST /api/matching/requests
  Body: {
    to_user_id: "...",
    potential_match_id: "...",
    carpool_name: "...",
    preferred_carpool_size: 4,
    message: "...",
    company_id: "...",
    site_id: "..."  // Optional
  }
```

### 2. Error Handling

**Frontend Will Handle:**
- 403 Forbidden (membership/role errors)
- 404 Not Found (company/site not found)
- 400 Bad Request (invalid scope parameters)
- "Not configured" responses
- Network errors

**User-Friendly Messages:**
- "You need to join this company to access this feature"
- "Please select your site to enable company matching"
- "Company preferences not set up. Please configure in company hub."

---

## 🔄 Implementation Timeline

### Phase 0: Foundation (No Backend Changes Needed)
- Type definitions
- Company context
- UI components (stubs)

### Phase 2: Backward Compatibility Verification
- **Requires:** Backend Phase 3 complete
- Test all existing endpoints work unchanged
- Verify personal scope is default

### Phase 3-7: Company Features
- **Requires:** Backend Phases 4-8 complete
- Integrate company features
- Test end-to-end flows

---

## ✅ Backend Requirements Summary

### Must Have (For Company Features)

1. **Scope Resolution:**
   - Support query parameters: `?scope=company&company_id=...`
   - Support request body: `{ scope: "company", company_id: "..." }`
   - Default to personal scope when no scope provided

2. **Error Responses:**
   - Standardized error format
   - Clear error codes
   - User-friendly messages

3. **Backward Compatibility:**
   - All existing endpoints work unchanged
   - Personal scope is default
   - No breaking changes to response shapes

### Nice to Have (Optional)

1. **URL Pattern Support:**
   - `/api/company/{slug}/...` (more RESTful, but optional)

2. **Response Format:**
   - Always include `company_id` and `site_id` (even if `null`)
   - Consistent null handling

---

## 🎯 Next Steps

1. **Backend Team:**
   - Answer questions above
   - Confirm endpoint names
   - Provide error response documentation
   - Confirm backward compatibility guarantees

2. **Frontend Team:**
   - Wait for clarifications
   - Update implementation plan based on answers
   - Begin Phase 0 (foundation - no backend needed)

3. **Coordination:**
   - Align on Phase 2 timing (backward compatibility verification)
   - Coordinate Phase 3+ (company features)

---

## 📝 Contact

**Frontend Team Questions:**
- Please respond to this document with answers
- Or schedule a meeting to discuss

**Priority:**
- Questions 1-3: **High** (affect implementation approach)
- Questions 4-8: **Medium** (affect error handling and UX)

---

**Thank you for your time!**  
**Looking forward to your responses.**

---

**Document Status:** Awaiting Backend Response  
**Last Updated:** 2025-01-XX

