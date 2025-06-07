import { City, cities } from '../models/CityData';

// Helper function to get the effective timezone based on current date and DST rules
export const getEffectiveTimezone = (city: City): string => {
  // With IANA timezones, DST is handled automatically, so we can simplify this
  // If there's an alternate timezone defined, we can still use the date range logic
  if (!city.alternateTimeZone) {
    return city.timezone;
  }
   
  const { startDay, endDay, newTimezone } = city.alternateTimeZone;
  
  // Current date
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-based
  const currentDay = now.getDate();
  
  // Parse start and end days
  const [startDayNum, startMonthNum] = startDay.split('-').map(num => parseInt(num, 10));
  const [endDayNum, endMonthNum] = endDay.split('-').map(num => parseInt(num, 10));
  
  // Check if current date is within DST period
  if (isDateInRange(currentDay, currentMonth, startDayNum, startMonthNum, endDayNum, endMonthNum)) {
    return newTimezone;
  }
  
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
    const date = new Date();
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    
    // Get the date in the target timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const remoteDateStr = formatter.format(date);
    const [year, month, day] = remoteDateStr.split('-').map(num => parseInt(num, 10));
    const remoteDate = new Date(year, month - 1, day).getTime();
    
    if (remoteDate > localDate) {
      return 1; // Tomorrow
    } else if (remoteDate < localDate) {
      return -1; // Yesterday
    }
    
    return 0; // Same day
  } catch (e) {
    return 0; // Same day as fallback
  }
};

export const getFormattedTimeDifference = (city: City | string): string => {
  const timezone = typeof city === 'string' ? city : getEffectiveTimezone(city);
  
  try {
    const date = new Date();
    
    // Get local timezone offset in minutes
    const localOffset = date.getTimezoneOffset() * -1;
    
    // Create a date in the target timezone and compare
    const localTime = date.getTime();
    const utcTime = localTime + (date.getTimezoneOffset() * 60000);
    
    // Get time in target timezone
    const targetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    
    const targetTime = targetFormatter.format(new Date(utcTime));
    const [targetHour, targetMinute] = targetTime.split(':').map(num => parseInt(num, 10));
    const targetMinutes = (targetHour * 60) + targetMinute;
    
    // Get local time
    const localHour = date.getHours();
    const localMinute = date.getMinutes();
    const localMinutes = (localHour * 60) + localMinute;
    
    const difference = targetMinutes - localMinutes;
    
    if (difference === 0) {
      return 'Same time as you';
    }
    
    const absDiff = Math.abs(difference);
    const hours = Math.floor(absDiff / 60);
    const minutes = absDiff % 60;
    
    let result = difference > 0 ? '+' : '-';
    
    if (hours > 0) {
      result += `${hours}h`;
    }
    
    if (minutes > 0) {
      result += ` ${minutes}m`;
    }
    
    return result;
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