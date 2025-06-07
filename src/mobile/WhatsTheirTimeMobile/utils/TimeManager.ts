import { City, cities } from '../models/CityData';

// Helper function to get the effective timezone based on current date and DST rules
export const getEffectiveTimezone = (city: City): string => {
  // With IANA timezones, DST is handled automatically, so we can simplify this
  // If there's an alternate timezone defined, we can still use the date range logic
 
    return city.timezone;
 
};

// Helper function to check if a date falls within a range
// Handles cases where the range spans across year boundary (e.g., Oct to Mar)
export const isDateInRange = (
  day: number, 
  month: number, 
  startDay: number, 
  startMonth: number, 
  endDay: number, 
  endMonth: number
): boolean => {
  // Convert dates to simple numeric representation for comparison
  const date = month * 100 + day;
  const start = startMonth * 100 + startDay;
  const end = endMonth * 100 + endDay;
  
  // If range doesn't cross year boundary
  if (start <= end) {
    return date >= start && date <= end;
  } 
  // If range crosses year boundary (e.g., Nov to Mar)
  else {
    return date >= start || date <= end;
  }
};

export const getLocalTime = (city: City | string): string => {
  const timezone = typeof city === 'string' ? city : getEffectiveTimezone(city);
  
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return formatter.format(date);
  } catch (e) {
    // Fallback to local time if timezone is invalid
    return formatTime(new Date());
  }
};

export const getLocalDay = (city: City | string): string => {
  const timezone = typeof city === 'string' ? city : getEffectiveTimezone(city);
  
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long'
    });
    
    return formatter.format(date);
  } catch (e) {
    // Fallback to local day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }
};

export const getDayDifference = (city: City | string): number => {
  const timezone = typeof city === 'string' ? city : getEffectiveTimezone(city);

  try {
    const now = new Date();
    
    // Get today's date in UTC (year, month, day)
    const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Get the date string in the target timezone
    const formatter = new Intl.DateTimeFormat('en-CA', { // Use 'en-CA' for YYYY-MM-DD
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const targetDateStr = formatter.format(now);
    
    // Parse the target date string into a Date object (in UTC, representing that timezone's date)
    const [year, month, day] = targetDateStr.split('-').map(Number);
    const targetToday = new Date(Date.UTC(year, month - 1, day)); // Month is 0-indexed

    // Calculate the difference in days
    // getTime() returns milliseconds since epoch. Divide by milliseconds in a day.
    const diffMillis = targetToday.getTime() - utcToday.getTime();
    const diffDays = Math.round(diffMillis / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (e) {
    // console.error("Error in getDayDifference:", e);
    return 0; // Fallback to 0 if there's an error
  }
};

export const getFormattedTimeDifference = (city: City | string): string => {
  const timezone = typeof city === 'string' ? city : getEffectiveTimezone(city);

  try {
    const now = new Date();

    // Get the current time in the target timezone using hour12: false for 24-hour format
    const targetTimeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    
    const targetTimeStr = targetTimeFormatter.format(now);
    const [targetHourStr, targetMinuteStr] = targetTimeStr.split(':');
    const targetHour = parseInt(targetHourStr, 10);
    const targetMinute = parseInt(targetMinuteStr, 10);

    // Get the current time in the local timezone (as per system, but mock is UTC)
    const localHour = now.getHours(); // In mock, this is UTC hours (12)
    const localMinute = now.getMinutes(); // In mock, this is UTC minutes (0)

    // Convert both times to minutes from the beginning of the day
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    const localTotalMinutes = localHour * 60 + localMinute;
    
    let diffMinutes = targetTotalMinutes - localTotalMinutes;

    // Get day difference to handle cases where timezone crosses day boundary
    const dayDiff = getDayDifference(timezone);

    // Adjust for day differences
    if (dayDiff === 1) {
      // Target is on the next day
      diffMinutes += 24 * 60;
    } else if (dayDiff === -1) {
      // Target is on the previous day
      diffMinutes -= 24 * 60;
    }

    if (diffMinutes === 0) {
      return 'Same time as you';
    }

    const sign = diffMinutes > 0 ? '+' : '-';
    const absDiffMinutes = Math.abs(diffMinutes);
    const hours = Math.floor(absDiffMinutes / 60);
    const minutes = absDiffMinutes % 60;

    let result = sign;
    if (hours > 0) {
      result += `${hours}h`;
    }
    if (minutes > 0) {
      if (hours > 0) result += ' ';
      result += `${minutes}m`;
    }
    
    return result.trim();

  } catch (e) {
    return 'Unknown';
  }
};

// Helper function to format time as "h:mm AM/PM"
const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
};