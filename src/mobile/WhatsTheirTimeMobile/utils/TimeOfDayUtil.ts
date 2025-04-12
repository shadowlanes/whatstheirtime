import { City } from '../models/CityData';
import { getEffectiveTimezone } from './TimeManager';

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
  [TimeOfDay.DAWN]: ['#a1b4ed', '#a1b4ed', '#FFC371'],
  [TimeOfDay.DAY]: ['#00c6ff', '#4facfe', '#0072ff'],
  [TimeOfDay.EVENING]: ['#4742db', '#8e68cc', '#FFC371']
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
export const getHourInTimezone = (city: City | string): number => {
  const date = new Date();
  const timezone = typeof city === 'string' ? city : getEffectiveTimezone(city);
  
  if (timezone.startsWith('GMT')) {
    try {
      // Parse GMT offset
      const offsetStr = timezone.substring(3); // Remove 'GMT'
      const offsetHours = parseFloat(offsetStr);
      
      if (isNaN(offsetHours)) {
        return date.getHours(); // Fallback to local time
      }
      
      // For testing, we need to handle the case where Date.getTimezoneOffset is mocked
      // Get UTC hours and minutes
      const utcHours = date.getUTCHours();
      const utcMinutes = date.getUTCMinutes();

      // Convert to decimal hours
      const utcDecimalHours = utcHours + utcMinutes / 60;
      
      // Apply GMT offset
      let hour = utcDecimalHours + offsetHours;
      
      // Adjust for overflow
      hour = (hour + 24) % 24;
      
      return Math.floor(hour);
    } catch (e) {
      return date.getHours(); // Fallback to local time
    }
  }
  
  // Default to local time if timezone format is not recognized
  return date.getHours();
};