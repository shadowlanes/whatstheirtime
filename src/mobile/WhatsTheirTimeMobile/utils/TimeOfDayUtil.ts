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
  const timezone = typeof city === 'string' ? city : getEffectiveTimezone(city);
  
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    });
    
    const timeString = formatter.format(date);
    const hour = parseInt(timeString, 10);
    
    return isNaN(hour) ? date.getHours() : hour;
  } catch (e) {
    // Fallback to local time if timezone is invalid
    return new Date().getHours();
  }
};