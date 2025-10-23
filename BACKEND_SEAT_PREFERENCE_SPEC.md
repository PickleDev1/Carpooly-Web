# Backend API Specification: Dynamic Carpool Seat Management

## 🎯 **Overview**
Implement dynamic carpool capacity management where users can specify their preferred carpool size when sending/receiving match requests, and carpools display accurate seat availability.

## 📋 **Required Backend Changes**

### **1. Match Request API Updates**

#### **POST /api/matching/requests**
**Current Request Body:**
```json
{
  "potential_match_id": "string",
  "to_user_id": "string", 
  "message": "string"
}
```

**Updated Request Body:**
```json
{
  "potential_match_id": "string",
  "to_user_id": "string",
  "message": "string",
  "preferred_carpool_size": 4  // NEW: User's preferred total carpool size
}
```

#### **GET /api/matching/requests**
**Updated Response:**
```json
{
  "incoming": [
    {
      "id": "string",
      "from_user": {...},
      "to_user": {...},
      "message": "string",
      "preferred_carpool_size": 4,  // NEW: Sender's preferred size
      "status": "pending",
      "created_at": "string"
    }
  ],
  "outgoing": [
    {
      "id": "string", 
      "from_user": {...},
      "to_user": {...},
      "message": "string",
      "preferred_carpool_size": 3,  // NEW: Your preferred size
      "status": "pending",
      "created_at": "string"
    }
  ]
}
```

### **2. Carpool Creation API Updates**

#### **PUT /api/matching/requests/{request_id}/status**
**When accepting a request (status: "accepted"):**

**Updated Response:**
```json
{
  "id": "string",
  "status": "accepted",
  "updated_at": "string",
  "message": "string",
  "carpool_id": "string",
  "carpool": {  // NEW: Full carpool details
    "id": "string",
    "name": "string",
    "destination_address": "string",
    "total_capacity": 4,  // NEW: Total seats in carpool
    "current_members": 2,  // NEW: Current number of members
    "available_seats": 2,  // NEW: Available seats (total - current)
    "members": [
      {
        "user_id": "string",
        "name": "string",
        "role": "driver" // or "passenger"
      }
    ],
    "created_at": "string"
  }
}
```

### **3. Carpool Management API Updates**

#### **GET /api/carpools/users/{user_id}**
**Updated Response:**
```json
[
  {
    "id": "string",
    "name": "string", 
    "destination_address": "string",
    "total_capacity": 4,  // NEW: Total seats
    "current_members": 2,  // NEW: Current members
    "available_seats": 2,  // NEW: Available seats
    "is_full": false,  // NEW: Whether carpool is full
    "members": [
      {
        "user_id": "string",
        "name": "string",
        "role": "driver"
      }
    ],
    "created_at": "string"
  }
]
```

#### **POST /api/carpools/{carpool_id}/join**
**New endpoint for users to join existing carpools:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined carpool",
  "carpool": {
    "id": "string",
    "total_capacity": 4,
    "current_members": 3,
    "available_seats": 1,
    "is_full": false
  }
}
```

### **4. Database Schema Updates**

#### **New Table: `carpool_seat_preferences`**
```sql
CREATE TABLE carpool_seat_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carpool_id UUID REFERENCES carpools(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  preferred_size INTEGER NOT NULL CHECK (preferred_size >= 2 AND preferred_size <= 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Updated Table: `carpools`**
```sql
ALTER TABLE carpools ADD COLUMN total_capacity INTEGER DEFAULT 4;
ALTER TABLE carpools ADD COLUMN current_members INTEGER DEFAULT 2;
ALTER TABLE carpools ADD COLUMN available_seats INTEGER DEFAULT 2;
ALTER TABLE carpools ADD COLUMN is_full BOOLEAN DEFAULT FALSE;
```

#### **Updated Table: `match_requests`**
```sql
ALTER TABLE match_requests ADD COLUMN preferred_carpool_size INTEGER DEFAULT 4;
```

### **5. Business Logic Requirements**

#### **Carpool Creation Logic:**
1. When a match request is accepted:
   - Use the **higher** of the two users' preferred sizes
   - Set `total_capacity` = max(sender_preferred_size, receiver_preferred_size)
   - Set `current_members` = 2 (the two people who created it)
   - Set `available_seats` = total_capacity - 2
   - Set `is_full` = false

#### **Seat Availability Logic:**
1. **Available seats** = total_capacity - current_members
2. **Is full** = available_seats <= 0
3. **Can join** = available_seats > 0 AND user not already a member

#### **Validation Rules:**
1. **Minimum carpool size**: 2 people
2. **Maximum carpool size**: 8 people (safety limit)
3. **Default size**: 4 people if not specified
4. **Size negotiation**: Use the higher of the two preferences

### **6. Error Handling**

#### **New Error Responses:**
```json
{
  "error": "CARPOOL_FULL",
  "message": "This carpool is full and cannot accept new members",
  "carpool_id": "string",
  "total_capacity": 4,
  "current_members": 4,
  "available_seats": 0
}
```

```json
{
  "error": "INVALID_CARPOOL_SIZE", 
  "message": "Carpool size must be between 2 and 8 people",
  "provided_size": 10
}
```

## 🚀 **Implementation Priority**

1. **Phase 1**: Database schema updates
2. **Phase 2**: Match request API updates (add preferred_carpool_size)
3. **Phase 3**: Carpool creation logic updates
4. **Phase 4**: Carpool management API updates
5. **Phase 5**: Error handling and validation

## 📊 **Testing Scenarios**

### **Scenario 1: Size Negotiation**
- User A sends request with preferred_size: 3
- User B accepts with preferred_size: 5
- **Expected**: Carpool created with total_capacity: 5

### **Scenario 2: Default Size**
- User A sends request without preferred_size
- User B accepts without preferred_size  
- **Expected**: Carpool created with total_capacity: 4 (default)

### **Scenario 3: Full Carpool**
- Carpool with total_capacity: 4, current_members: 4
- User tries to join
- **Expected**: Error "CARPOOL_FULL"

## 🔧 **Frontend Integration Points**

The frontend will need to:
1. **Collect seat preferences** when sending match requests
2. **Display seat preferences** when viewing requests
3. **Show dynamic seat availability** in carpool lists
4. **Handle join/leave functionality** for existing carpools
5. **Update UI** when carpool capacity changes

---

**Note**: This specification ensures that carpools are created with user-specified capacity and display accurate seat availability, replacing the current hardcoded "0 of 4 (Full)" display with dynamic "2 of 4 remaining" or "3 of 5 remaining" based on actual capacity and membership.
