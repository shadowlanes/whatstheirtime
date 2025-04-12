import { City } from '../models/CityData';

// Time of day determination
export enum TimeOfDay {
  NIGHT = 'night',
  DAWN = 'dawn',
  DAY = 'day',
  EVENING = 'evening'
}

// Colors for different times of day
export const timeOfDayColors = {
  [TimeOfDay.NIGHT]: ['#0F2027', '#203A43', '#2C5364'],
  [TimeOfDay.DAWN]: ['#FF9966', '#FF5E62', '#FFC371'],
  [TimeOfDay.DAY]: ['#00c6ff', '#4facfe', '#0072ff'],
  [TimeOfDay.EVENING]: ['#cb2d3e', '#ef473a', '#F2994A']
};

// Determines the time of day based on hour (0-23)
export const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 22 || hour < 5) {
    return TimeOfDay.NIGHT; // 10 PM - 4:59 AM
  } else if (hour >= 5 && hour < 8) {
    return TimeOfDay.DAWN; // 5 AM - 7:59 AM
  } else if (hour >= 8 && hour < 18) {
    return TimeOfDay.DAY; // 8 AM - 5:59 PM
  } else {
    return TimeOfDay.EVENING; // 6 PM - 9:59 PM
  }
}; 

// Gets the hour in the timezone specified by the city
export const getHourInTimezone = (timezone: string): number => {
  const date = new Date();
  
  if (timezone.startsWith('GMT')) {
    try {
      // Parse GMT offset
      const offsetStr = timezone.substring(3); // Remove 'GMT'
      const offsetHours = parseFloat(offsetStr);
      
      if (isNaN(offsetHours)) {
        return date.getHours(); // Fallback to local time
      }
      
      // Get local timezone offset in hours
      const localOffsetHours = date.getTimezoneOffset() / -60;
      
      // Calculate the hour for the given timezone
      let hour = date.getHours() + (offsetHours - localOffsetHours);
      
      // Adjust for overflow
      hour = (hour + 24) % 24;
      
      return hour;
    } catch (e) {
      return date.getHours(); // Fallback to local time
    }
  }
  
  // Default to local time if timezone format is not recognized
  return date.getHours();
};