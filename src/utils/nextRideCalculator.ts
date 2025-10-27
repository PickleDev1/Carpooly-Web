/**
 * Utility functions for calculating next ride times based on user preferences
 */

export interface NextRideInfo {
  nextRideDate: Date;
  nextRideDay: string;
  nextRideTime: string;
  daysUntil: number;
  hoursUntil: number;
  isToday: boolean;
  isTomorrow: boolean;
}

/**
 * Maps day abbreviations to full day names
 */
const DAY_MAP: Record<string, string> = {
  'mon': 'Monday',
  'tue': 'Tuesday', 
  'wed': 'Wednesday',
  'thu': 'Thursday',
  'fri': 'Friday',
  'sat': 'Saturday',
  'sun': 'Sunday'
};

/**
 * Maps day abbreviations to day numbers (0 = Sunday, 1 = Monday, etc.)
 */
const DAY_NUMBER_MAP: Record<string, number> = {
  'sun': 0,
  'mon': 1,
  'tue': 2,
  'wed': 3,
  'thu': 4,
  'fri': 5,
  'sat': 6
};

/**
 * Calculates the next ride time based on user preferences
 * @param arrivalTime - Time in HH:MM format (e.g., "09:00")
 * @param commuteDays - Array of day abbreviations (e.g., ["mon", "wed", "thu"])
 * @returns NextRideInfo object with calculated next ride details
 */
export function calculateNextRide(
  arrivalTime?: string,
  commuteDays?: string[]
): NextRideInfo | null {
  // Return null if no schedule data
  if (!arrivalTime || !commuteDays || commuteDays.length === 0) {
    return null;
  }

  const now = new Date();
  const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Convert commute days to numbers
  const commuteDayNumbers = commuteDays
    .map(day => DAY_NUMBER_MAP[day])
    .filter(num => num !== undefined)
    .sort((a, b) => a - b);

  if (commuteDayNumbers.length === 0) {
    return null;
  }

  // Parse arrival time
  const [hours, minutes] = arrivalTime.split(':').map(Number);
  const arrivalDateTime = new Date(now);
  arrivalDateTime.setHours(hours, minutes, 0, 0);

  // Find next ride day
  let nextRideDayNumber: number;
  let nextRideDate: Date;
  let isToday = false;
  let isTomorrow = false;

  // Check if today is a commute day and time hasn't passed yet
  if (commuteDayNumbers.includes(today)) {
    if (arrivalDateTime > now) {
      // Today is a commute day and time hasn't passed
      nextRideDayNumber = today;
      nextRideDate = arrivalDateTime;
      isToday = true;
    } else {
      // Today is a commute day but time has passed, find next day
      const nextDay = findNextCommuteDay(today, commuteDayNumbers);
      nextRideDayNumber = nextDay;
      nextRideDate = getNextRideDate(nextDay, hours, minutes);
      isTomorrow = nextDay === (today + 1) % 7;
    }
  } else {
    // Today is not a commute day, find next day
    const nextDay = findNextCommuteDay(today, commuteDayNumbers);
    nextRideDayNumber = nextDay;
    nextRideDate = getNextRideDate(nextDay, hours, minutes);
    isTomorrow = nextDay === (today + 1) % 7;
  }

  // Calculate time differences
  const timeDiff = nextRideDate.getTime() - now.getTime();
  const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));

  // Format time
  const nextRideTime = arrivalTime;
  const nextRideDay = DAY_MAP[commuteDays.find(day => DAY_NUMBER_MAP[day] === nextRideDayNumber)!];

  return {
    nextRideDate,
    nextRideDay,
    nextRideTime,
    daysUntil,
    hoursUntil,
    isToday,
    isTomorrow
  };
}

/**
 * Finds the next commute day after the given day
 */
function findNextCommuteDay(currentDay: number, commuteDays: number[]): number {
  // Look for next day in the same week
  for (let i = 1; i < 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (commuteDays.includes(nextDay)) {
      return nextDay;
    }
  }
  
  // This should never happen if commuteDays is not empty
  return commuteDays[0];
}

/**
 * Gets the date for the next ride on the specified day
 */
function getNextRideDate(dayNumber: number, hours: number, minutes: number): Date {
  const now = new Date();
  const nextRideDate = new Date(now);
  
  // Calculate days to add
  const currentDay = now.getDay();
  let daysToAdd = dayNumber - currentDay;
  
  // If the day has passed this week, add 7 days
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }
  
  nextRideDate.setDate(now.getDate() + daysToAdd);
  nextRideDate.setHours(hours, minutes, 0, 0);
  
  return nextRideDate;
}

/**
 * Formats the next ride info for display
 */
export function formatNextRide(nextRide: NextRideInfo): string {
  if (nextRide.isToday) {
    return `Today at ${nextRide.nextRideTime}`;
  } else if (nextRide.isTomorrow) {
    return `Tomorrow at ${nextRide.nextRideTime}`;
  } else if (nextRide.daysUntil === 1) {
    return `Tomorrow at ${nextRide.nextRideTime}`;
  } else if (nextRide.daysUntil < 7) {
    return `${nextRide.nextRideDay} at ${nextRide.nextRideTime}`;
  } else {
    return `${nextRide.nextRideDay} at ${nextRide.nextRideTime}`;
  }
}

/**
 * Gets a short description of time until next ride
 */
export function getTimeUntilNextRide(nextRide: NextRideInfo): string {
  if (nextRide.isToday) {
    if (nextRide.hoursUntil < 1) {
      const minutesUntil = Math.floor((nextRide.nextRideDate.getTime() - new Date().getTime()) / (1000 * 60));
      return `${minutesUntil} minutes`;
    } else {
      return `${nextRide.hoursUntil} hours`;
    }
  } else if (nextRide.isTomorrow) {
    return 'Tomorrow';
  } else {
    return `${nextRide.daysUntil} days`;
  }
}
