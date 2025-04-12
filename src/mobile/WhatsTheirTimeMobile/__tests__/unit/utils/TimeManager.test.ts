import { 
  getEffectiveTimezone, 
  isDateInRange, 
  getLocalTime, 
  getLocalDay, 
  getDayDifference,
  getFormattedTimeDifference,
  parseGmtOffset
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
        timezone: 'GMT+2',
        tzName: 'Test/Timezone',
        alternateNames: []
      };
      
      expect(getEffectiveTimezone(city)).toBe('GMT+2');
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
        timezone: 'GMT-5',
        tzName: 'America/New_York',
        alternateNames: [],
        alternateTimeZone: {
          startDay: '14-3', // March 14
          endDay: '7-11',   // November 7
          newTimezone: 'GMT-4'
        }
      };
      
      expect(getEffectiveTimezone(mockCity)).toBe('GMT-4');
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
        timezone: 'GMT-5',
        tzName: 'America/New_York',
        alternateNames: [],
        alternateTimeZone: {
          startDay: '14-3', // March 14
          endDay: '7-11',   // November 7
          newTimezone: 'GMT-4'
        }
      };
      
      expect(getEffectiveTimezone(mockCity)).toBe('GMT-5');
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
      // Override the mockDate instance methods for this specific test suite
      mockDate.getHours = jest.fn(() => 12);
      mockDate.getMinutes = jest.fn(() => 0);
      
      // Use Jest's spyOn instead of trying to mock the Date constructor
      // This gives us more control over the behavior
      jest.spyOn(global, 'Date').mockImplementation((time) => {
        if (time === undefined) {
          return mockDate;
        }
        
        // When a new Date is created with a timestamp in getLocalTime
        if (typeof time === 'number') {
          // For GMT+3
          if (time === mockDate.getTime() + 180 * 60000) {
            const plus3Date = new Date(mockDate);
            plus3Date.getHours = jest.fn(() => 15);
            plus3Date.getMinutes = jest.fn(() => 0);
            return plus3Date;
          }
          
          // For GMT-5
          if (time === mockDate.getTime() - 300 * 60000) {
            const minus5Date = new Date(mockDate);
            minus5Date.getHours = jest.fn(() => 7);
            minus5Date.getMinutes = jest.fn(() => 0);
            return minus5Date;
          }
        }
        
        return new Date(time);
      });
    });

    it('should format local time correctly for GMT+3 timezone', () => {
      // When it's 12:00 UTC, GMT+3 is 15:00 (3:00 PM)
      expect(getLocalTime('GMT+3')).toBe('3:00 PM');
    });
    
    it('should format local time correctly for GMT-5 timezone', () => {
      // When it's 12:00 UTC, GMT-5 is 7:00 (7:00 AM)
      expect(getLocalTime('GMT-5')).toBe('7:00 AM');
    });
    
    it('should handle non-GMT timezone formats by returning local time', () => {
      // When timezone format is not recognized, should return local time (12:00 PM in our mock)
      expect(getLocalTime('America/New_York')).toBe('12:00 PM');
    });
  });
  
  describe('parseGmtOffset', () => {
    it('should parse positive GMT offset correctly', () => {
      expect(parseGmtOffset('GMT+3')).toBe(180); // +3 hours = 180 minutes
    });
    
    it('should parse negative GMT offset correctly', () => {
      expect(parseGmtOffset('GMT-5')).toBe(-300); // -5 hours = -300 minutes
    });
    
    it('should parse fractional GMT offset correctly', () => {
      expect(parseGmtOffset('GMT+5.5')).toBe(330); // +5.5 hours = 330 minutes
    });
    
    it('should return null for invalid GMT format', () => {
      expect(parseGmtOffset('GMTInvalid')).toBeNull();
    });
    
    it('should return null for non-GMT format', () => {
      expect(parseGmtOffset('America/New_York')).toBeNull();
    });
  });
});