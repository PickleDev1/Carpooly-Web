# Backend Implementation Summary: Dynamic Carpool Seat Management

## 🎯 **What Needs to Be Done**

The frontend currently shows hardcoded "0 of 4 (Full)" for all carpools. We need to implement dynamic seat management where users can specify their preferred carpool size and carpools show accurate availability.

## 📋 **Key Changes Required**

### **1. Database Updates**
- Add `preferred_carpool_size` to `match_requests` table
- Add `total_capacity`, `current_members`, `available_seats`, `is_full` to `carpools` table
- Create `carpool_seat_preferences` table for tracking user preferences

### **2. API Updates**
- **Match Requests**: Accept and return `preferred_carpool_size` field
- **Carpool Creation**: Use user preferences to set dynamic capacity
- **Carpool Lists**: Return actual seat availability instead of hardcoded values

### **3. Business Logic**
- **Size Negotiation**: Use the higher of the two users' preferred sizes
- **Seat Calculation**: `available_seats = total_capacity - current_members`
- **Full Detection**: `is_full = available_seats <= 0`

## 🚀 **Implementation Order**

1. **Database schema updates** (add new columns and table)
2. **Match request API updates** (add preferred_carpool_size field)
3. **Carpool creation logic** (use preferences to set capacity)
4. **Carpool management APIs** (return dynamic seat data)
5. **Error handling** (carpool full, invalid sizes)

## 📊 **Expected Results**

**Before:**
- All carpools show "0 of 4 (Full)"
- No user input for carpool size
- Hardcoded capacity

**After:**
- Carpools show "2 of 4 remaining" or "3 of 5 remaining"
- Users specify preferred carpool size
- Dynamic capacity based on user preferences

## 🔧 **Frontend Integration**

The frontend will be updated to:
1. Collect seat preferences when sending match requests
2. Display dynamic seat availability in carpool lists
3. Show accurate "remaining seats" instead of hardcoded "Full"

---

**Priority**: High - This affects the core carpool functionality and user experience.
