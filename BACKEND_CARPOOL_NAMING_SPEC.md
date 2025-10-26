# Backend Implementation Plan: Carpool Naming Feature

## 🎯 **Feature Overview**

When a user uses the matching algorithm to send a request and it gets accepted by another user, the carpool is created with a name chosen by the **sender** (the person who initiated the request).

## 📋 **Current System Analysis**

### **Existing Flow:**
1. User A finds potential matches through matching algorithm
2. User A sends a match request to User B
3. User B receives the request and can accept/reject it
4. When User B accepts, a carpool is automatically created
5. **ISSUE**: The carpool currently has no name or uses a default name

### **Current Implementation Status:**
- ✅ Frontend matching system works
- ✅ Users can send match requests
- ✅ Users can accept/reject requests  
- ✅ Carpools are created automatically when requests are accepted
- ❌ **MISSING**: No carpool naming functionality
- ❌ **MISSING**: Sender cannot specify carpool name during request

## 🚨 **The Problem**

Currently, when a match request is accepted and a carpool is created, there's no way for the sender to specify what the carpool should be named. This results in:
- Generic or default carpool names
- Poor user experience
- No personalization of the carpool

## 🎯 **Proposed Solution**

Allow the **sender** (the person who initiates the match request) to specify a carpool name when sending the request. When the request is accepted, the carpool is created with the sender's chosen name.

## 📊 **Required Changes**

### **1. Database Schema Updates**

#### **Update `match_requests` table:**
```sql
ALTER TABLE match_requests ADD COLUMN carpool_name VARCHAR(255);
```

**Purpose**: Store the carpool name that the sender wants to use when the carpool is created.

### **2. API Endpoint Updates**

#### **2.1 Update Send Match Request Endpoint**
**Endpoint**: `POST /api/matching/requests`

**Updated Request Body**:
```json
{
  "potential_match_id": "73b25d62-938d-47f1-a8f3-4a6a77c519b4",
  "to_user_id": "d1d945d8-c8c5-4761-8c60-f3eefc57bb19",
  "message": "Hi! I'd love to carpool with you. We have a great match!",
  "carpool_name": "Morning Commute to Downtown"
}
```

**Updated Response**:
```json
{
  "id": "req_12345",
  "from_user_id": "current_user_id",
  "to_user_id": "d1d945d8-c8c5-4761-8c60-f3eefc57bb19",
  "potential_match_id": "73b25d62-938d-47f1-a8f3-4a6a77c519b4",
  "message": "Hi! I'd love to carpool with you. We have a great match!",
  "carpool_name": "Morning Commute to Downtown",
  "status": "pending",
  "expires_at": "2024-01-08T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### **2.2 Update Get Match Requests Endpoint**
**Endpoint**: `GET /api/matching/requests`

**Updated Response**:
```json
{
  "incoming": [
    {
      "id": "req_12345",
      "from_user_id": "sender_id",
      "to_user_id": "current_user_id",
      "potential_match_id": "match_id",
      "message": "Hi! I'd love to carpool with you!",
      "carpool_name": "Morning Commute to Downtown",
      "status": "pending",
      "expires_at": "2024-01-08T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "from_user": {
        "id": "sender_id",
        "name": "John Doe",
        "display_name": "John"
      }
    }
  ],
  "outgoing": [
    {
      "id": "req_67890",
      "from_user_id": "current_user_id",
      "to_user_id": "recipient_id",
      "potential_match_id": "match_id",
      "message": "Let's carpool together!",
      "carpool_name": "Evening Ride Home",
      "status": "pending",
      "expires_at": "2024-01-08T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **3. Carpool Creation Logic Updates**

#### **3.1 Update Carpool Creation Function**
When a match request is accepted, the carpool should be created with the name specified by the sender:

```go
func createCarpoolFromMatchRequest(request MatchRequest) (*Carpool, error) {
    // Create carpool with sender's chosen name
    carpool := &Carpool{
        Name: request.CarpoolName, // Use the name from the request
        CreatedBy: request.FromUserID,
        // ... other carpool fields
    }
    
    // Add both users as members
    carpool.Members = []CarpoolMember{
        {UserID: request.FromUserID, Role: "creator"},
        {UserID: request.ToUserID, Role: "member"},
    }
    
    return carpool, nil
}
```

#### **3.2 Update Request Status Update Logic**
**Endpoint**: `PUT /api/matching/requests/:id`

**Updated Response when accepted**:
```json
{
  "id": "req_12345",
  "status": "accepted",
  "updated_at": "2024-01-01T12:00:00Z",
  "carpool_id": "carpool_789",
  "carpool_name": "Morning Commute to Downtown",
  "message": "Carpool created successfully with your chosen name"
}
```

### **4. Data Model Updates**

#### **4.1 Update Go Structs**
```go
type MatchRequest struct {
    ID                string    `json:"id" gorm:"primaryKey"`
    FromUserID        string    `json:"from_user_id" gorm:"not null"`
    ToUserID          string    `json:"to_user_id" gorm:"not null"`
    PotentialMatchID  string    `json:"potential_match_id" gorm:"not null"`
    Message           string    `json:"message"`
    CarpoolName       string    `json:"carpool_name"` // NEW FIELD
    Status            string    `json:"status" gorm:"default:'pending'"`
    ExpiresAt         time.Time `json:"expires_at"`
    CreatedAt         time.Time `json:"created_at"`
    UpdatedAt         time.Time `json:"updated_at"`
}
```

#### **4.2 Update Request Payload Struct**
```go
type MatchRequestPayload struct {
    PotentialMatchID string `json:"potential_match_id" binding:"required"`
    ToUserID         string `json:"to_user_id" binding:"required"`
    Message          string `json:"message"`
    CarpoolName      string `json:"carpool_name" binding:"required"` // NEW FIELD
}
```

### **5. Validation Rules**

#### **5.1 Carpool Name Validation**
```go
func validateCarpoolName(name string) error {
    if len(name) == 0 {
        return errors.New("carpool name is required")
    }
    if len(name) > 255 {
        return errors.New("carpool name must be 255 characters or less")
    }
    if strings.TrimSpace(name) == "" {
        return errors.New("carpool name cannot be empty or only whitespace")
    }
    return nil
}
```

#### **5.2 Business Rules**
1. **Required Field**: Carpool name must be provided when sending a request
2. **Length Limit**: Maximum 255 characters
3. **No Empty Names**: Cannot be empty or only whitespace
4. **Sender's Choice**: Only the sender can choose the name
5. **No Editing**: Once set, the carpool name cannot be changed by the receiver

### **6. Error Handling**

#### **6.1 New Error Responses**
```json
{
  "error": "MISSING_CARPOOL_NAME",
  "message": "Carpool name is required when sending a match request",
  "field": "carpool_name"
}
```

```json
{
  "error": "INVALID_CARPOOL_NAME",
  "message": "Carpool name must be between 1 and 255 characters",
  "provided_name": "A very long name...",
  "max_length": 255
}
```

```json
{
  "error": "EMPTY_CARPOOL_NAME",
  "message": "Carpool name cannot be empty or only whitespace",
  "field": "carpool_name"
}
```

### **7. Frontend Integration Requirements**

#### **7.1 Frontend Changes Needed**
The frontend will need to be updated to:
1. **Collect carpool name** when sending match requests
2. **Display carpool name** in request lists
3. **Show carpool name** when requests are accepted
4. **Validate carpool name** before sending requests

#### **7.2 Frontend API Integration**
```typescript
// Updated interface for sending requests
interface SendMatchRequestPayload {
  potential_match_id: string;
  to_user_id: string;
  message?: string;
  carpool_name: string; // NEW REQUIRED FIELD
}

// Updated interface for request responses
interface MatchRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  potential_match_id: string;
  message?: string;
  carpool_name: string; // NEW FIELD
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: string;
  created_at: string;
  from_user?: {
    id: string;
    name: string;
    display_name: string;
  };
}
```

## 🚀 **Implementation Priority**

### **Phase 1: Database & Core Logic**
1. Add `carpool_name` column to `match_requests` table
2. Update Go structs and validation
3. Update carpool creation logic to use sender's name

### **Phase 2: API Updates**
1. Update send request endpoint to accept `carpool_name`
2. Update get requests endpoint to return `carpool_name`
3. Update request status update to return carpool name

### **Phase 3: Error Handling & Validation**
1. Add carpool name validation
2. Add appropriate error responses
3. Update business logic validation

### **Phase 4: Frontend Integration**
1. Update frontend to collect carpool names
2. Update UI to display carpool names
3. Add frontend validation

## 📊 **Testing Scenarios**

### **Scenario 1: Successful Request with Name**
- User A sends request with carpool name "Morning Commute"
- User B accepts the request
- Carpool is created with name "Morning Commute"
- Both users see the carpool with the correct name

### **Scenario 2: Missing Carpool Name**
- User A tries to send request without carpool name
- API returns error: "Carpool name is required"
- Request is not created

### **Scenario 3: Invalid Carpool Name**
- User A sends request with empty carpool name
- API returns error: "Carpool name cannot be empty"
- Request is not created

### **Scenario 4: Long Carpool Name**
- User A sends request with carpool name > 255 characters
- API returns error: "Carpool name must be 255 characters or less"
- Request is not created

## 🔧 **Migration Strategy**

### **Database Migration**
```sql
-- Add carpool_name column to existing table
ALTER TABLE match_requests ADD COLUMN carpool_name VARCHAR(255);

-- Set default names for existing requests (optional)
UPDATE match_requests 
SET carpool_name = 'Carpool ' || id 
WHERE carpool_name IS NULL;
```

### **Backward Compatibility**
- Existing requests without carpool names should still work
- Default carpool names can be generated if needed
- Frontend should handle both old and new request formats

## 📈 **Expected Outcomes**

### **Before Implementation:**
- Carpools created with generic names
- No personalization
- Poor user experience

### **After Implementation:**
- Carpools created with meaningful names chosen by sender
- Better user experience and personalization
- Clear ownership of carpool naming
- Improved carpool management

## 🎯 **Success Metrics**

1. **Functionality**: 100% of accepted requests create carpools with sender's chosen names
2. **Validation**: 0% of requests accepted with invalid carpool names
3. **User Experience**: Users can easily identify their carpools by meaningful names
4. **Error Handling**: Clear error messages for invalid carpool names

---

**Priority**: High - This feature directly impacts user experience and carpool management.

**Estimated Implementation Time**: 2-3 days for backend changes, 1-2 days for frontend integration.

**Dependencies**: Requires frontend updates to collect and display carpool names.
