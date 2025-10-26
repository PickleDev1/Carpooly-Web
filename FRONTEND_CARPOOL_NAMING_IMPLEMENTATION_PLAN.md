# Frontend Carpool Naming Implementation Plan

## 🎯 **Feature Overview**

Add carpool naming functionality to the frontend so that when users send match requests, they can specify a name for the carpool that will be created if the request is accepted.

## 📋 **Current State Analysis**

### **What's Already Working:**
- ✅ Users can see potential matches
- ✅ Users can send match requests with messages
- ✅ Users can specify carpool size preferences
- ✅ Users can accept/reject incoming requests
- ✅ Carpools are created automatically when requests are accepted

### **What's Missing:**
- ❌ No carpool name input field when sending requests
- ❌ No carpool name display in request lists
- ❌ No carpool name validation
- ❌ No carpool name in API requests

## 🚀 **Detailed Implementation Plan**

### **Phase 1: Type Definitions & API Integration**

#### **1.1 Update Type Definitions** (`src/types/matching.ts`)

**Add carpool_name to existing interfaces:**

```typescript
// Update existing MatchRequest interface
export interface MatchRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  potential_match_id: string;
  message: string;
  carpool_name: string; // NEW FIELD
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
  from_user?: {
    id: string;
    name: string;
    display_name: string;
  };
}

// Update MatchRequestPayload interface
export interface MatchRequestPayload {
  potential_match_id: string;
  to_user_id: string;
  message?: string;
  carpool_name: string; // NEW REQUIRED FIELD
  preferred_carpool_size?: number;
}
```

#### **1.2 Update Matching Service** (`src/services/matching.ts`)

**Update sendRequest method to include carpool_name:**

```typescript
async sendRequest(
  toUserId: string, 
  potentialMatchId?: string, 
  message?: string,
  carpoolName?: string, // NEW PARAMETER
  preferredCarpoolSize?: number
): Promise<MatchRequestResponse> {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/matching/request`
  const body = {
    to_user_id: toUserId,
    ...(potentialMatchId && { potential_match_id: potentialMatchId }),
    ...(message && { message }),
    ...(carpoolName && { carpool_name: carpoolName }), // NEW FIELD
    ...(preferredCarpoolSize && { preferred_carpool_size: preferredCarpoolSize })
  }
  // ... rest of the method remains the same
}
```

### **Phase 2: UI Updates**

#### **2.1 Update PotentialMatches Component** (`src/components/matching/PotentialMatches.tsx`)

**Add carpool name input field to the compose message section:**

```typescript
// Add new state for carpool names
const [carpoolNameByMatchId, setCarpoolNameByMatchId] = useState<Record<string, string>>({})

// Add handler for carpool name changes
const handleChangeCarpoolName = (matchId: string, name: string) => {
  setCarpoolNameByMatchId(prev => ({
    ...prev,
    [matchId]: name
  }))
}

// Update the compose message section (around line 544)
{isComposingForMatchId === current.id && (
  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    {/* Carpool Name Input - ADD THIS NEW SECTION */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        What would you like to call this carpool? <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={carpoolNameByMatchId[current.id] ?? ''}
        onChange={(e) => handleChangeCarpoolName(current.id, e.target.value)}
        maxLength={255}
        className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        placeholder="e.g., Morning Commute to Downtown, Evening Ride Home"
        required
      />
      <p className="text-xs text-gray-600 mt-1">
        Choose a name that describes this carpool (e.g., "Morning Commute to Downtown")
      </p>
    </div>

    {/* Existing message input */}
    <label className="block text-sm font-medium text-gray-900 mb-2">Add a short message (optional)</label>
    <textarea
      value={messageDraftByMatchId[current.id] ?? ''}
      onChange={(e) => handleChangeDraft(current.id, e.target.value)}
      maxLength={280}
      rows={4}
      className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
      placeholder="Hey, my name is ... I work at ... I'd love to carpool Mon–Fri around 8:00 AM since we both go to the same workplace!"
    />
    
    {/* Existing seat preference section */}
    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      {/* ... existing seat preference code ... */}
    </div>

    {/* Update the send button validation */}
    <div className="mt-3 flex items-center justify-between">
      <span className="text-xs text-gray-600">
        {(messageDraftByMatchId[current.id] ?? '').length}/280 characters
      </span>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCancelCompose}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleSendRequest(current.id)} 
          disabled={sendingRequest === current.id || !carpoolNameByMatchId[current.id]?.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {sendingRequest === current.id ? 'Sending…' : 'Send Request'}
        </Button>
      </div>
    </div>
  </div>
)}
```

#### **2.2 Update handleSendRequest Method**

**Update the request payload to include carpool name:**

```typescript
const handleSendRequest = async (matchId: string) => {
  setSendingRequest(matchId)
  try {
    const currentMatch = matches.find(m => m.id === matchId)
    if (!currentMatch) {
      throw new Error('Match not found')
    }

    // Validate carpool name
    const carpoolName = carpoolNameByMatchId[matchId]?.trim()
    if (!carpoolName) {
      throw new Error('Please enter a name for this carpool')
    }

    const raw = (messageDraftByMatchId[matchId] ?? '').trim()
    const message = raw.length > 0
      ? raw.slice(0, 280)
      : 'Hi! We have compatible routes and schedules. Would you like to carpool?'

    // ... existing Clerk ID logic ...

    const preferredSize = seatPreferenceByMatchId[matchId] || 4
    if (preferredSize < 2 || preferredSize > 8) {
      throw new Error('Carpool size must be between 2 and 8 people')
    }

    const request = {
      potential_match_id: matchId,
      to_user_id: toUserClerkId,
      message,
      carpool_name: carpoolName, // NEW FIELD
      preferred_carpool_size: preferredSize
    }

    const response = await matchingService.sendMatchRequest(request)
    console.log('✅ Carpool request sent successfully:', response)

    // ... rest of the method remains the same ...
  } catch (error: any) {
    console.error('❌ Failed to send carpool request:', error)
    alert(error?.message || 'Failed to send carpool request. Please try again.')
  } finally {
    setSendingRequest(null)
  }
}
```

### **Phase 3: Request Display Updates**

#### **3.1 Update MatchRequests Component** (`src/components/matching/MatchRequests.tsx`)

**Add carpool name display to request cards:**

```typescript
// Update the incoming request display (around line 150-200)
{requests.incoming.map((request) => (
  <Card key={request.id} className="mb-4">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.from_user?.name || 'User'}`} />
            <AvatarFallback>
              {request.from_user?.display_name || request.from_user?.name || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{request.from_user?.name || 'Unknown User'}</CardTitle>
            <CardDescription>
              Wants to carpool with you
            </CardDescription>
          </div>
        </div>
        <Badge variant="secondary">{request.status}</Badge>
      </div>
    </CardHeader>
    
    <CardContent>
      {/* ADD CARPOOL NAME DISPLAY */}
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-blue-900">Proposed Carpool Name:</span>
        </div>
        <p className="text-lg font-semibold text-blue-800">{request.carpool_name}</p>
      </div>

      {/* Existing message display */}
      {request.message && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">{request.message}</p>
        </div>
      )}

      {/* Existing action buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={() => handleAcceptClick(request.id)}
          disabled={processing === request.id}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {processing === request.id ? 'Processing...' : 'Accept'}
        </Button>
        <Button 
          variant="outline"
          onClick={() => handleRejectClick(request.id)}
          disabled={processing === request.id}
        >
          Reject
        </Button>
      </div>
    </CardContent>
  </Card>
))}
```

#### **3.2 Update Outgoing Request Display**

**Add carpool name to outgoing requests:**

```typescript
// Update outgoing request display
{requests.outgoing.map((request) => (
  <Card key={request.id} className="mb-4">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg">Request to {request.to_user?.name || 'Unknown User'}</CardTitle>
          <CardDescription>
            Carpool: <span className="font-medium">{request.carpool_name}</span>
          </CardDescription>
        </div>
        <Badge variant={request.status === 'accepted' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
          {request.status}
        </Badge>
      </div>
    </CardHeader>
    
    <CardContent>
      {request.message && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">{request.message}</p>
        </div>
      )}
    </CardContent>
  </Card>
))}
```

### **Phase 4: Validation & Error Handling**

#### **4.1 Add Frontend Validation**

**Create validation utility:**

```typescript
// Add to src/utils/validation.ts
export const validateCarpoolName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Carpool name is required' }
  }
  
  if (name.length > 255) {
    return { isValid: false, error: 'Carpool name must be 255 characters or less' }
  }
  
  if (name.trim().length === 0) {
    return { isValid: false, error: 'Carpool name cannot be empty or only whitespace' }
  }
  
  return { isValid: true }
}
```

#### **4.2 Update Form Validation**

**Add validation to the compose form:**

```typescript
// Add validation state
const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

// Update carpool name input with validation
<input
  type="text"
  value={carpoolNameByMatchId[current.id] ?? ''}
  onChange={(e) => {
    const name = e.target.value
    handleChangeCarpoolName(current.id, name)
    
    // Clear validation error when user starts typing
    if (validationErrors[current.id]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[current.id]
        return newErrors
      })
    }
  }}
  maxLength={255}
  className={`w-full rounded-lg border-2 bg-white p-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
    validationErrors[current.id] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
  }`}
  placeholder="e.g., Morning Commute to Downtown, Evening Ride Home"
  required
/>
{validationErrors[current.id] && (
  <p className="text-xs text-red-600 mt-1">{validationErrors[current.id]}</p>
)}
```

#### **4.3 Update Send Button Validation**

**Add comprehensive validation before sending:**

```typescript
const handleSendRequest = async (matchId: string) => {
  setSendingRequest(matchId)
  try {
    const currentMatch = matches.find(m => m.id === matchId)
    if (!currentMatch) {
      throw new Error('Match not found')
    }

    // Validate carpool name
    const carpoolName = carpoolNameByMatchId[matchId]?.trim()
    const nameValidation = validateCarpoolName(carpoolName)
    
    if (!nameValidation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [matchId]: nameValidation.error!
      }))
      return
    }

    // ... rest of the method ...
  } catch (error: any) {
    console.error('❌ Failed to send carpool request:', error)
    alert(error?.message || 'Failed to send carpool request. Please try again.')
  } finally {
    setSendingRequest(null)
  }
}
```

### **Phase 5: Testing & Polish**

#### **5.1 Add Success Messages**

**Update success message to include carpool name:**

```typescript
// Update success message in handleSendRequest
const response = await matchingService.sendMatchRequest(request)
console.log('✅ Carpool request sent successfully:', response)

// Show success message with carpool name
alert(`🎉 Carpool request sent successfully! Your carpool "${carpoolName}" will be created if ${currentMatch.user2.name} accepts your request.`)
```

#### **5.2 Add Loading States**

**Update loading states to show carpool name:**

```typescript
// Update button text to show carpool name
<Button 
  size="sm" 
  onClick={() => handleSendRequest(current.id)} 
  disabled={sendingRequest === current.id || !carpoolNameByMatchId[current.id]?.trim()}
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
  {sendingRequest === current.id 
    ? `Creating "${carpoolNameByMatchId[current.id]}"...` 
    : 'Send Request'
  }
</Button>
```

## 📊 **Implementation Timeline**

### **Day 1: Core Functionality**
- ✅ Update type definitions
- ✅ Update matching service
- ✅ Add carpool name input field
- ✅ Update request payload

### **Day 2: UI & Display**
- ✅ Update request display components
- ✅ Add carpool name to request cards
- ✅ Update success messages

### **Day 3: Validation & Polish**
- ✅ Add frontend validation
- ✅ Add error handling
- ✅ Add loading states
- ✅ Test end-to-end functionality

## 🎯 **Expected Results**

### **Before Implementation:**
- Users send requests without carpool names
- Generic carpool names when created
- No personalization

### **After Implementation:**
- Users specify meaningful carpool names when sending requests
- Carpool names displayed in request lists
- Carpools created with sender's chosen names
- Better user experience and organization

## 🔧 **Files to Modify**

1. **`src/types/matching.ts`** - Add carpool_name to interfaces
2. **`src/services/matching.ts`** - Update API calls
3. **`src/components/matching/PotentialMatches.tsx`** - Add carpool name input
4. **`src/components/matching/MatchRequests.tsx`** - Display carpool names
5. **`src/utils/validation.ts`** - Add validation utilities

## 🚀 **Ready to Implement**

This plan provides everything needed to implement the carpool naming feature on the frontend. The changes are focused, well-defined, and build upon the existing codebase without breaking current functionality.

**Total Estimated Time**: 2-3 days for complete implementation and testing.
