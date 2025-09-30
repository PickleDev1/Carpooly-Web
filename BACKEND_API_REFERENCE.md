# Carpool Request API Reference

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Send Carpool Request
**POST** `/api/matching/requests`

**Request Body:**
```json
{
  "potential_match_id": "73b25d62-938d-47f1-a8f3-4a6a77c519b4",
  "to_user_id": "d1d945d8-c8c5-4761-8c60-f3eefc57bb19",
  "message": "Hi! I'd love to carpool with you. We have a great match!"
}
```

**Response (201):**
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

**Error Responses:**
- `400` - Invalid request payload
- `404` - User or match not found
- `409` - Request already exists
- `500` - Internal server error

### 2. Get User Requests
**GET** `/api/matching/requests`

**Response (200):**
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

### 3. Update Request Status
**PUT** `/api/matching/requests/:requestId`

**Request Body:**
```json
{
  "status": "accepted"
}
```
or
```json
{
  "status": "rejected"
}
```

**Response (200):**
```json
{
  "id": "req_12345",
  "status": "accepted",
  "updated_at": "2024-01-01T12:00:00Z",
  "message": "Request updated successfully"
}
```

**Error Responses:**
- `400` - Invalid status or request no longer pending
- `404` - Request not found
- `403` - Access denied (not your request)
- `500` - Internal server error

## Request Status Values
- `pending` - Request sent, waiting for response
- `accepted` - Request accepted, carpool created
- `rejected` - Request rejected
- `expired` - Request expired (7 days)

## Business Rules
1. Users cannot send requests to themselves
2. Only one pending request between two users per potential match
3. Users cannot send requests if already carpooling
4. Requests expire after 7 days
5. Only the recipient can accept/reject requests
6. Accepted requests create carpool relationships

## Rate Limiting
- 10 requests per minute per user
- 100 requests per hour per user

## Error Format
```json
{
  "error": "Request already exists",
  "code": "REQUEST_EXISTS",
  "details": "A request between these users already exists"
}
```
