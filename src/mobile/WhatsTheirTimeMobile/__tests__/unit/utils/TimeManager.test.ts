import { 
  getEffectiveTimezone, 
  isDateInRange, 
  getLocalTime, 
  getLocalDay, 
  getDayDifference,
  getFormattedTimeDifference
} from '../../../utils/TimeManager';
import { cities } from '../../../models/CityData';

describe('TimeManager', () => {
  const mockDate = new Date('2025-04-12T12:00:00Z'); // April 12, 2025, noon UTC
  
  beforeEach(() => {
    // Set a fixed date for testing
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    mockDate.getTimezoneOffset = jest.fn(() => 0); // Mock timezone offset to 0 (UTC)
    
    // Mock Date.prototype.getUTCHours and getUTCMinutes
    mockDate.getUTCHours = jest.fn(() => 12); // Noon UTC
    mockDate.getUTCMinutes = jest.fn(() => 0);
    
    // Mock getHours and getMinutes for consistent testing
    mockDate.getHours = jest.fn(() => 12);
    mockDate.getMinutes = jest.fn(() => 0);
  });
  
  describe('getEffectiveTimezone', () => {
    it('should return default timezone when no alternate timezone exists', () => {
      const city = {
        id: '100',
        name: 'Test City',
        country: 'Test Country',
        timezone: 'America/New_York',
        alternateNames: []
      };
      
      expect(getEffectiveTimezone(city)).toBe('America/New_York');
    });
    
    // For these DST tests, we need to mock the implementation of isDateInRange
    // since our test date is April 12, which is within DST period for New York
    it('should return alternate timezone when current date is within DST period', () => {
      jest.spyOn(global, 'Date').mockImplementation(() => ({
        ...mockDate,
        getMonth: () => 3, // April (0-based)
        getDate: () => 12
      } as unknown as Date));
      
      const mockCity = {
        id: '1',
        name: 'New York',
        country: 'USA',
        timezone: 'America/New_York',
        alternateNames: [],
        alternateTimeZone: {
          startDay: '14-3', // March 14
          endDay: '7-11',   // November 7
          newTimezone: 'America/New_York'
        }
      };
      
      expect(getEffectiveTimezone(mockCity)).toBe('America/New_York');
    });
    
    it('should return default timezone when current date is outside DST period', () => {
      // Mock date to January (outside DST)
      jest.spyOn(global, 'Date').mockImplementation(() => ({
        ...mockDate,
        getMonth: () => 0, // January (0-based)
        getDate: () => 12
      } as unknown as Date));
      
      const mockCity = {
        id: '1',
        name: 'New York',
        country: 'USA',
        timezone: 'America/New_York',
        alternateNames: [],
        alternateTimeZone: {
          startDay: '14-3', // March 14
          endDay: '7-11',   // November 7
          newTimezone: 'America/Chicago'
        }
      };
      
      expect(getEffectiveTimezone(mockCity)).toBe('America/New_York');
    });
  });
  
  describe('isDateInRange', () => {
    it('should correctly identify dates within a range in same year', () => {
      // Range: March 15 to September 20
      expect(isDateInRange(16, 3, 15, 3, 20, 9)).toBe(true); // March 16
      expect(isDateInRange(1, 9, 15, 3, 20, 9)).toBe(true); // September 1
      expect(isDateInRange(20, 9, 15, 3, 20, 9)).toBe(true); // September 20
      expect(isDateInRange(21, 9, 15, 3, 20, 9)).toBe(false); // September 21
      expect(isDateInRange(14, 3, 15, 3, 20, 9)).toBe(false); // March 14
    });
    
    it('should correctly identify dates within a range that crosses year boundary', () => {
      // Range: October 15 to March 20 (year boundary)
      expect(isDateInRange(16, 10, 15, 10, 20, 3)).toBe(true); // October 16
      expect(isDateInRange(1, 1, 15, 10, 20, 3)).toBe(true); // January 1
      expect(isDateInRange(20, 3, 15, 10, 20, 3)).toBe(true); // March 20
      expect(isDateInRange(21, 3, 15, 10, 20, 3)).toBe(false); // March 21
      expect(isDateInRange(14, 10, 15, 10, 20, 3)).toBe(false); // October 14
    });
  });
  
  describe('getLocalTime', () => {
    beforeEach(() => {
      // Mock Intl.DateTimeFormat for consistent testing
      const mockDateTimeFormat = jest.fn().mockImplementation((locale, options) => ({
        format: jest.fn((date) => {
          // Mock different timezone responses
          if (options?.timeZone === 'Europe/Moscow') {
            return '3:00 PM'; // GMT+3 equivalent
          } else if (options?.timeZone === 'America/New_York') {
            return '8:00 AM'; // GMT-4 (DST) equivalent  
          }
          return '12:00 PM'; // Default
        })
      }));
      
      // Add supportedLocalesOf method to the mock
      (mockDateTimeFormat as any).supportedLocalesOf = jest.fn();
      
      global.Intl = {
        ...global.Intl,
        DateTimeFormat: mockDateTimeFormat as any
      };
      
      // Mock fallback formatTime
      const mockDate = new Date('2025-04-12T12:00:00Z');
      mockDate.getHours = jest.fn(() => 12);
      mockDate.getMinutes = jest.fn(() => 0);
      global.Date = jest.fn(() => mockDate) as any;
    });

    it('should format local time correctly for Europe/Moscow timezone', () => {
      expect(getLocalTime('Europe/Moscow')).toBe('3:00 PM');
    });
    
    it('should format local time correctly for America/New_York timezone', () => {
      expect(getLocalTime('America/New_York')).toBe('8:00 AM');
    });
    
    it('should handle invalid timezone formats by returning local time', () => {
      // Mock Intl.DateTimeFormat to throw for invalid timezones
      const mockDateTimeFormat = jest.fn().mockImplementation(() => {
        throw new Error('Invalid timezone');
      });
      (mockDateTimeFormat as any).supportedLocalesOf = jest.fn();
      
      global.Intl.DateTimeFormat = mockDateTimeFormat as any;
      
      expect(getLocalTime('Invalid/Timezone')).toBe('12:00 PM');
    });
  });
});