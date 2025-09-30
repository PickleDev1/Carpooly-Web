# Backend Carpool Request System - Technical Specification

## Overview
Implement a complete carpool request system that allows users to send, receive, and manage carpool requests between potential matches.

## Current Status
- ✅ Frontend matching system is working
- ✅ Users can see potential matches
- ❌ **MISSING**: Carpool request functionality
- ❌ **MISSING**: Request management (send, accept, reject)
- ❌ **MISSING**: Request status tracking

## Required Implementation

### 1. Database Schema

#### **New Table: `match_requests`**
```sql
CREATE TABLE match_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    potential_match_id UUID NOT NULL REFERENCES potential_matches(id),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_from_user_id (from_user_id),
    INDEX idx_to_user_id (to_user_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);
```

#### **Request Expiration Logic**
```sql
-- Auto-expire requests after 7 days
UPDATE match_requests 
SET status = 'expired' 
WHERE status = 'pending' 
AND expires_at < NOW();
```

### 2. API Endpoints

#### **2.1 Send Carpool Request**
**Endpoint**: `POST /api/matching/requests`

**Request Body**:
```json
{
  "potential_match_id": "73b25d62-938d-47f1-a8f3-4a6a77c519b4",
  "to_user_id": "d1d945d8-c8c5-4761-8c60-f3eefc57bb19",
  "message": "Hi! I'd love to carpool with you. We have a great match!"
}
```

**Response**:
```json
{
  "id": "req_12345",
  "from_user_id": "current_user_id",
  "to_user_id": "d1d945d8-c8c5-4761-8c60-f3eefc57bb19",
  "potential_match_id": "73b25d62-938d-47f1-a8f3-4a6a77c519b4",
  "message": "Hi! I'd love to carpool with you. We have a great match!",
  "status": "pending",
  "expires_at": "2024-01-08T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Implementation Logic**:
```go
func SendMatchRequest(c *gin.Context) {
    var request MatchRequestPayload
    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request payload"})
        return
    }
    
    // Validate users exist
    if !userExists(request.ToUserID) {
        c.JSON(404, gin.H{"error": "Recipient user not found"})
        return
    }
    
    // Check if potential match exists
    if !potentialMatchExists(request.PotentialMatchID) {
        c.JSON(404, gin.H{"error": "Potential match not found"})
        return
    }
    
    // Check if request already exists
    if requestAlreadyExists(request.FromUserID, request.ToUserID, request.PotentialMatchID) {
        c.JSON(409, gin.H{"error": "Request already exists"})
        return
    }
    
    // Create request
    requestID := createMatchRequest(request)
    
    // Set expiration (7 days from now)
    expiresAt := time.Now().AddDate(0, 0, 7)
    
    // Save to database
    matchRequest := MatchRequest{
        ID: requestID,
        FromUserID: request.FromUserID,
        ToUserID: request.ToUserID,
        PotentialMatchID: request.PotentialMatchID,
        Message: request.Message,
        Status: "pending",
        ExpiresAt: expiresAt,
        CreatedAt: time.Now(),
    }
    
    if err := db.Create(&matchRequest).Error; err != nil {
        c.JSON(500, gin.H{"error": "Failed to create request"})
        return
    }
    
    c.JSON(201, matchRequest)
}
```

#### **2.2 Get User Requests**
**Endpoint**: `GET /api/matching/requests`

**Response**:
```json
{
  "incoming": [
    {
      "id": "req_12345",
      "from_user_id": "user_456",
      "to_user_id": "current_user_id",
      "potential_match_id": "match_789",
      "message": "Hi! I'd love to carpool with you.",
      "status": "pending",
      "expires_at": "2024-01-08T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "from_user": {
        "id": "user_456",
        "name": "John Doe",
        "display_name": "John"
      }
    }
  ],
  "outgoing": [
    {
      "id": "req_67890",
      "from_user_id": "current_user_id",
      "to_user_id": "user_789",
      "potential_match_id": "match_123",
      "message": "Hi! I'd love to carpool with you.",
      "status": "pending",
      "expires_at": "2024-01-08T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "to_user": {
        "id": "user_789",
        "name": "Jane Smith",
        "display_name": "Jane"
      }
    }
  ]
}
```

**Implementation Logic**:
```go
func GetUserRequests(c *gin.Context) {
    userID := getCurrentUserID(c)
    
    // Get incoming requests
    var incomingRequests []MatchRequest
    db.Where("to_user_id = ?", userID).
       Preload("FromUser").
       Find(&incomingRequests)
    
    // Get outgoing requests
    var outgoingRequests []MatchRequest
    db.Where("from_user_id = ?", userID).
       Preload("ToUser").
       Find(&outgoingRequests)
    
    response := MatchRequestsResponse{
        Incoming: incomingRequests,
        Outgoing: outgoingRequests,
    }
    
    c.JSON(200, response)
}
```

#### **2.3 Update Request Status**
**Endpoint**: `PUT /api/matching/requests/:requestId`

**Request Body**:
```json
{
  "status": "accepted"  // or "rejected"
}
```

**Response**:
```json
{
  "id": "req_12345",
  "status": "accepted",
  "updated_at": "2024-01-01T12:00:00Z",
  "message": "Request updated successfully"
}
```

**Implementation Logic**:
```go
func UpdateRequestStatus(c *gin.Context) {
    requestID := c.Param("requestId")
    userID := getCurrentUserID(c)
    
    var request MatchRequest
    if err := db.Where("id = ? AND to_user_id = ?", requestID, userID).First(&request).Error; err != nil {
        c.JSON(404, gin.H{"error": "Request not found"})
        return
    }
    
    if request.Status != "pending" {
        c.JSON(400, gin.H{"error": "Request is no longer pending"})
        return
    }
    
    var updatePayload struct {
        Status string `json:"status"`
    }
    if err := c.ShouldBindJSON(&updatePayload); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request payload"})
        return
    }
    
    if updatePayload.Status != "accepted" && updatePayload.Status != "rejected" {
        c.JSON(400, gin.H{"error": "Invalid status"})
        return
    }
    
    // Update request status
    request.Status = updatePayload.Status
    request.UpdatedAt = time.Now()
    
    if err := db.Save(&request).Error; err != nil {
        c.JSON(500, gin.H{"error": "Failed to update request"})
        return
    }
    
    // If accepted, create carpool relationship
    if updatePayload.Status == "accepted" {
        createCarpoolRelationship(request.FromUserID, request.ToUserID, request.PotentialMatchID)
    }
    
    c.JSON(200, gin.H{
        "id": request.ID,
        "status": request.Status,
        "updated_at": request.UpdatedAt,
        "message": "Request updated successfully",
    })
}
```

### 3. Data Models

#### **Go Structs**:
```go
type MatchRequest struct {
    ID                string    `json:"id" gorm:"primaryKey"`
    FromUserID        string    `json:"from_user_id" gorm:"not null"`
    ToUserID          string    `json:"to_user_id" gorm:"not null"`
    PotentialMatchID  string    `json:"potential_match_id" gorm:"not null"`
    Message           string    `json:"message"`
    Status            string    `json:"status" gorm:"default:'pending'"`
    ExpiresAt         time.Time `json:"expires_at"`
    CreatedAt         time.Time `json:"created_at"`
    UpdatedAt         time.Time `json:"updated_at"`
    
    // Relations
    FromUser          User      `json:"from_user" gorm:"foreignKey:FromUserID"`
    ToUser            User      `json:"to_user" gorm:"foreignKey:ToUserID"`
    PotentialMatch    PotentialMatch `json:"potential_match" gorm:"foreignKey:PotentialMatchID"`
}

type MatchRequestPayload struct {
    PotentialMatchID string `json:"potential_match_id" binding:"required"`
    ToUserID         string `json:"to_user_id" binding:"required"`
    Message          string `json:"message"`
}

type MatchRequestsResponse struct {
    Incoming []MatchRequest `json:"incoming"`
    Outgoing []MatchRequest `json:"outgoing"`
}
```

### 4. Business Logic Requirements

#### **4.1 Request Validation**
```go
func validateMatchRequest(request MatchRequestPayload, fromUserID string) error {
    // Check if recipient exists
    if !userExists(request.ToUserID) {
        return errors.New("recipient user not found")
    }
    
    // Check if potential match exists
    if !potentialMatchExists(request.PotentialMatchID) {
        return errors.New("potential match not found")
    }
    
    // Check if user is trying to send request to themselves
    if fromUserID == request.ToUserID {
        return errors.New("cannot send request to yourself")
    }
    
    // Check if request already exists
    if requestAlreadyExists(fromUserID, request.ToUserID, request.PotentialMatchID) {
        return errors.New("request already exists")
    }
    
    // Check if users are already in a carpool
    if usersAlreadyCarpooling(fromUserID, request.ToUserID) {
        return errors.New("users are already carpooling")
    }
    
    return nil
}
```

#### **4.2 Request Expiration**
```go
func expireOldRequests() {
    // Run this as a background job every hour
    db.Model(&MatchRequest{}).
       Where("status = ? AND expires_at < ?", "pending", time.Now()).
       Update("status", "expired")
}
```

#### **4.3 Carpool Creation**
```go
func createCarpoolRelationship(fromUserID, toUserID, potentialMatchID string) {
    // Create carpool record
    carpool := Carpool{
        ID: generateCarpoolID(),
        User1ID: fromUserID,
        User2ID: toUserID,
        PotentialMatchID: potentialMatchID,
        Status: "active",
        CreatedAt: time.Now(),
    }
    
    db.Create(&carpool)
    
    // Send notification to both users
    sendCarpoolCreatedNotification(fromUserID, toUserID)
}
```

### 5. Error Handling

#### **HTTP Status Codes**:
- `200` - Success
- `201` - Request created successfully
- `400` - Bad request (invalid payload)
- `401` - Unauthorized (invalid token)
- `404` - User or match not found
- `409` - Request already exists
- `500` - Internal server error

#### **Error Response Format**:
```json
{
  "error": "Request already exists",
  "code": "REQUEST_EXISTS",
  "details": "A request between these users already exists"
}
```

### 6. Security Requirements

#### **6.1 Authentication**
```go
func authenticateRequest(c *gin.Context) {
    token := c.GetHeader("Authorization")
    if token == "" {
        c.JSON(401, gin.H{"error": "Authorization header required"})
        c.Abort()
        return
    }
    
    userID, err := validateJWTToken(token)
    if err != nil {
        c.JSON(401, gin.H{"error": "Invalid token"})
        c.Abort()
        return
    }
    
    c.Set("user_id", userID)
    c.Next()
}
```

#### **6.2 Authorization**
```go
func authorizeRequestAccess(c *gin.Context) {
    userID := c.GetString("user_id")
    requestID := c.Param("requestId")
    
    var request MatchRequest
    if err := db.Where("id = ? AND (from_user_id = ? OR to_user_id = ?)", 
                      requestID, userID, userID).First(&request).Error; err != nil {
        c.JSON(403, gin.H{"error": "Access denied"})
        c.Abort()
        return
    }
    
    c.Set("request", request)
    c.Next()
}
```

### 7. Performance Considerations

#### **7.1 Database Indexes**
```sql
-- Composite indexes for common queries
CREATE INDEX idx_requests_user_status ON match_requests(to_user_id, status);
CREATE INDEX idx_requests_from_user ON match_requests(from_user_id, status);
CREATE INDEX idx_requests_expires ON match_requests(expires_at, status);
```

#### **7.2 Caching Strategy**
```go
// Cache user requests for 5 minutes
func getCachedUserRequests(userID string) (*MatchRequestsResponse, error) {
    cacheKey := fmt.Sprintf("user_requests_%s", userID)
    
    if cached, found := cache.Get(cacheKey); found {
        return cached.(*MatchRequestsResponse), nil
    }
    
    // Fetch from database
    requests := fetchUserRequestsFromDB(userID)
    
    // Cache for 5 minutes
    cache.Set(cacheKey, requests, 5*time.Minute)
    
    return requests, nil
}
```

### 8. Testing Requirements

#### **8.1 Unit Tests**
```go
func TestSendMatchRequest(t *testing.T) {
    // Test valid request
    payload := MatchRequestPayload{
        PotentialMatchID: "valid_match_id",
        ToUserID: "valid_user_id",
        Message: "Test message",
    }
    
    result := sendMatchRequest(payload, "from_user_id")
    assert.NoError(t, result.Error)
    assert.Equal(t, "pending", result.Status)
}

func TestRequestValidation(t *testing.T) {
    // Test self-request
    err := validateMatchRequest(MatchRequestPayload{
        ToUserID: "same_user_id",
    }, "same_user_id")
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "cannot send request to yourself")
}
```

#### **8.2 Integration Tests**
```go
func TestRequestFlow(t *testing.T) {
    // 1. Send request
    request := sendMatchRequest(validPayload)
    assert.Equal(t, "pending", request.Status)
    
    // 2. Get requests for recipient
    requests := getUserRequests(recipientID)
    assert.Len(t, requests.Incoming, 1)
    
    // 3. Accept request
    updateRequestStatus(request.ID, "accepted")
    
    // 4. Verify carpool created
    carpool := getCarpoolByUsers(senderID, recipientID)
    assert.NotNil(t, carpool)
}
```

### 9. Monitoring & Logging

#### **9.1 Request Metrics**
```go
// Track request metrics
func trackRequestMetrics(action string, userID string) {
    metrics.IncrementCounter("match_requests_total", map[string]string{
        "action": action,
        "user_id": userID,
    })
}
```

#### **9.2 Error Logging**
```go
func logRequestError(err error, context map[string]interface{}) {
    log.Error("Match request error", 
        "error", err.Error(),
        "context", context,
        "timestamp", time.Now(),
    )
}
```

### 10. Deployment Checklist

#### **10.1 Database Migration**
```sql
-- Create match_requests table
-- Add indexes
-- Set up expiration job
```

#### **10.2 Environment Variables**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://...  # For caching
```

#### **10.3 Background Jobs**
```go
// Set up cron job for request expiration
cron.AddFunc("@hourly", expireOldRequests)
```

## Success Criteria

### Functional Requirements:
- ✅ Users can send carpool requests to potential matches
- ✅ Users can view incoming and outgoing requests
- ✅ Users can accept or reject requests
- ✅ Requests expire after 7 days
- ✅ Accepted requests create carpool relationships

### Technical Requirements:
- ✅ API responses under 500ms
- ✅ 99.9% uptime for request system
- ✅ Proper error handling and validation
- ✅ Secure authentication and authorization
- ✅ Comprehensive logging and monitoring

## Timeline

### Phase 1 (Week 1): Core Implementation
- Database schema and migrations
- Basic API endpoints (send, get, update)
- Request validation and security

### Phase 2 (Week 2): Advanced Features
- Request expiration logic
- Carpool relationship creation
- Error handling and logging

### Phase 3 (Week 3): Testing & Optimization
- Unit and integration tests
- Performance optimization
- Monitoring and alerting

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready for Implementation  
**Priority**: HIGH - Core functionality for carpool system
