# Backend Carpool Request System - Quick Summary

## 🚨 URGENT: Implement Carpool Request System

### Current Status
- ✅ Frontend matching system works
- ✅ Users can see potential matches  
- ❌ **MISSING**: Users cannot send carpool requests
- ❌ **MISSING**: No request management system

### What Users Need
1. **Send Requests**: Click "Send Carpool Request" on potential matches
2. **View Requests**: See incoming and outgoing requests
3. **Manage Requests**: Accept or reject incoming requests
4. **Track Status**: See if requests were accepted/rejected

## Required Implementation

### 1. Database Table
```sql
CREATE TABLE match_requests (
    id UUID PRIMARY KEY,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    potential_match_id UUID NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### **Send Request**
- **POST** `/api/matching/requests`
- **Body**: `{ "potential_match_id": "uuid", "to_user_id": "uuid", "message": "text" }`
- **Response**: Created request object

#### **Get User Requests**  
- **GET** `/api/matching/requests`
- **Response**: `{ "incoming": [...], "outgoing": [...] }`

#### **Update Request Status**
- **PUT** `/api/matching/requests/:id`
- **Body**: `{ "status": "accepted" }` or `{ "status": "rejected" }`

### 3. Business Logic

#### **Request Validation**
- ✅ Recipient user exists
- ✅ Potential match exists  
- ✅ User not sending to themselves
- ✅ No duplicate requests
- ✅ Users not already carpooling

#### **Request Expiration**
- ✅ Requests expire after 7 days
- ✅ Auto-expire old pending requests
- ✅ Background job to clean up expired requests

#### **Carpool Creation**
- ✅ When request is accepted, create carpool relationship
- ✅ Send notifications to both users
- ✅ Update user statuses

### 4. Security Requirements
- ✅ JWT token authentication
- ✅ Users can only access their own requests
- ✅ Users can only update requests sent to them
- ✅ Input validation and sanitization

### 5. Performance Requirements
- ✅ API responses under 500ms
- ✅ Database indexes on user_id and status
- ✅ Caching for frequently accessed data
- ✅ Rate limiting on request creation

## Implementation Priority

### 🔴 HIGH PRIORITY (Core Functionality)
1. **Database schema** - Create match_requests table
2. **Send request API** - POST /api/matching/requests
3. **Get requests API** - GET /api/matching/requests  
4. **Update status API** - PUT /api/matching/requests/:id

### 🟡 MEDIUM PRIORITY (User Experience)
1. **Request validation** - Prevent invalid requests
2. **Request expiration** - 7-day auto-expiry
3. **Carpool creation** - When requests are accepted
4. **Error handling** - Proper error messages

### 🟢 LOW PRIORITY (Optimization)
1. **Caching** - Improve performance
2. **Monitoring** - Track request metrics
3. **Background jobs** - Clean up expired requests
4. **Notifications** - Email/SMS alerts

## Testing Requirements

### Unit Tests
- ✅ Request creation with valid data
- ✅ Request validation (duplicates, self-requests)
- ✅ Status updates (accept/reject)
- ✅ Request expiration logic

### Integration Tests  
- ✅ Complete request flow (send → accept → carpool)
- ✅ Error handling for invalid requests
- ✅ Security (unauthorized access)
- ✅ Performance (response times)

## Success Criteria

### Functional
- ✅ Users can send requests to potential matches
- ✅ Users can view all their requests (incoming/outgoing)
- ✅ Users can accept or reject incoming requests
- ✅ Accepted requests create carpool relationships
- ✅ Requests expire after 7 days

### Technical
- ✅ All API endpoints working
- ✅ Proper authentication and authorization
- ✅ Database performance optimized
- ✅ Error handling comprehensive
- ✅ Tests passing

## Timeline

### Week 1: Core Implementation
- Database schema and migrations
- Basic API endpoints (send, get, update)
- Request validation and security

### Week 2: Advanced Features  
- Request expiration logic
- Carpool relationship creation
- Error handling and logging

### Week 3: Testing & Deployment
- Unit and integration tests
- Performance optimization
- Production deployment

---

**Status**: 🚨 URGENT - Core functionality missing  
**Priority**: HIGH - Users cannot interact with matches  
**Timeline**: 3 weeks for complete implementation
