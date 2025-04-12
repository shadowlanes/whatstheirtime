export const getLocalTime = (timezone: string): string => {
  const date = new Date();
  
  if (timezone.startsWith('GMT')) {
    try {
      // Parse GMT offset
      const offset = parseGmtOffset(timezone);
      if (offset === null) return formatTime(date);
      
      // Calculate the time for the given timezone
      const localTime = new Date(date.getTime() + (offset * 60000));
      return formatTime(localTime);
    } catch (e) {
      return formatTime(date);
    }
  }
  
  // Default to local time if timezone format is not recognized
  return formatTime(date);
};

export const getLocalDay = (timezone: string): string => {
  const date = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (timezone.startsWith('GMT')) {
    try {
      // Parse GMT offset
      const offset = parseGmtOffset(timezone);
      if (offset === null) return days[date.getDay()];
      
      // Calculate the date for the given timezone
      const localTime = new Date(date.getTime() + (offset * 60000));
      return days[localTime.getDay()];
    } catch (e) {
      return days[date.getDay()];
    }
  }
  
  // Default to local day if timezone format is not recognized
  return days[date.getDay()];
};

export const getDayDifference = (timezone: string): number => {
  const date = new Date();
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  
  if (timezone.startsWith('GMT')) {
    try {
      // Parse GMT offset
      const offset = parseGmtOffset(timezone);
      if (offset === null) return 0;
      
      // Calculate the date for the given timezone
      const localTime = new Date(date.getTime() + (offset * 60000));
      const remoteDate = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate()).getTime();
      
      if (remoteDate > localDate) {
        return 1; // Tomorrow
      } else if (remoteDate < localDate) {
        return -1; // Yesterday
      }
    } catch (e) {
      return 0;
    }
  }
  
  return 0; // Same day
};

export const getFormattedTimeDifference = (timezone: string): string => {
  if (!timezone.startsWith('GMT')) {
    return 'Unknown';
  }
  
  try {
    // Parse GMT offset from the timezone string
    const remoteOffset = parseGmtOffset(timezone);
    if (remoteOffset === null) return 'Unknown';
    
    // Get local timezone offset in minutes
    const localOffset = new Date().getTimezoneOffset() * -1;
    
    // Calculate difference
    const difference = remoteOffset - localOffset;
    
    if (difference === 0) {
      return 'Same time as you';
    }
    
    const hours = Math.floor(Math.abs(difference) / 60);
    const minutes = Math.abs(difference) % 60;
    
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

// Helper function to parse GMT timezone string to minutes offset
export const parseGmtOffset = (gmtTimezone: string): number | null => {
  if (!gmtTimezone.startsWith('GMT')) {
    return null;
  }
  
  const offsetStr = gmtTimezone.substring(3); // Remove 'GMT'
  const offsetHours = parseFloat(offsetStr);
  
  if (isNaN(offsetHours)) {
    return null;
  }
  
  // Convert to minutes and adjust for local timezone offset
  const localOffset = new Date().getTimezoneOffset();
  return Math.round(offsetHours * 60) - localOffset;
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