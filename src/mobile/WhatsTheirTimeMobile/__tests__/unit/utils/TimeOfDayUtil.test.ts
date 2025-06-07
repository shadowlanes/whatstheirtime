import { TimeOfDay, getTimeOfDay, getHourInTimezone } from '../../../utils/TimeOfDayUtil';
import { cities } from '../../../models/CityData';

describe('TimeOfDayUtil', () => {
  describe('getTimeOfDay', () => {
    it('should return NIGHT for hours between 22-23', () => {
      expect(getTimeOfDay(22)).toBe(TimeOfDay.NIGHT);
      expect(getTimeOfDay(23)).toBe(TimeOfDay.NIGHT);
    });

    it('should return NIGHT for hours between 0-4', () => {
      expect(getTimeOfDay(0)).toBe(TimeOfDay.NIGHT);
      expect(getTimeOfDay(1)).toBe(TimeOfDay.NIGHT);
      expect(getTimeOfDay(4)).toBe(TimeOfDay.NIGHT);
    });

    it('should return DAWN for hours between 5-7', () => {
      expect(getTimeOfDay(5)).toBe(TimeOfDay.DAWN);
      expect(getTimeOfDay(6)).toBe(TimeOfDay.DAWN);
      expect(getTimeOfDay(7)).toBe(TimeOfDay.DAWN);
    });

    it('should return DAY for hours between 8-17', () => {
      expect(getTimeOfDay(8)).toBe(TimeOfDay.DAY);
      expect(getTimeOfDay(12)).toBe(TimeOfDay.DAY);
      expect(getTimeOfDay(17)).toBe(TimeOfDay.DAY);
    });

    it('should return EVENING for hours between 18-21', () => {
      expect(getTimeOfDay(18)).toBe(TimeOfDay.EVENING);
      expect(getTimeOfDay(19)).toBe(TimeOfDay.EVENING);
      expect(getTimeOfDay(21)).toBe(TimeOfDay.EVENING);
    });
  });

  describe('getHourInTimezone', () => {
    beforeEach(() => {
      // Set a fixed date for testing
      const mockDate = new Date('2025-04-12T12:00:00Z'); // Noon UTC
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());
      
      // Mock Intl.DateTimeFormat for consistent testing
      const mockDateTimeFormat = jest.fn().mockImplementation((locale, options) => ({
        format: jest.fn((date) => {
          // Mock different timezone responses
          if (options?.timeZone === 'Europe/Moscow') {
            return '15'; // GMT+3 equivalent
          } else if (options?.timeZone === 'America/New_York') {
            return '8'; // GMT-4 (DST) equivalent  
          } else if (options?.timeZone === 'Asia/Kolkata') {
            return '17'; // GMT+5:30 equivalent
          }
          return '12'; // Default UTC
        })
      }));
      
      // Add supportedLocalesOf method to the mock
      (mockDateTimeFormat as any).supportedLocalesOf = jest.fn();
      
      global.Intl = {
        ...global.Intl,
        DateTimeFormat: mockDateTimeFormat as any
      };
      
      // Fallback for invalid timezones
      mockDate.getHours = jest.fn(() => 12);
    });

    it('should calculate the correct hour for Europe/Moscow timezone', () => {
      expect(getHourInTimezone('Europe/Moscow')).toBe(15);
    });

    it('should calculate the correct hour for America/New_York timezone', () => {
      expect(getHourInTimezone('America/New_York')).toBe(8);
    });

    it('should handle city objects', () => {
      const mockCity = {
        id: '1',
        name: 'Test City',
        country: 'Test Country',
        timezone: 'Asia/Kolkata',
        alternateNames: []
      };
      
      expect(getHourInTimezone(mockCity)).toBe(17);
    });

    it('should handle invalid timezone formats by returning local hour', () => {
      // Mock Intl.DateTimeFormat to throw for invalid timezones
      const mockDateTimeFormat = jest.fn().mockImplementation(() => {
        throw new Error('Invalid timezone');
      });
      (mockDateTimeFormat as any).supportedLocalesOf = jest.fn();
      
      global.Intl.DateTimeFormat = mockDateTimeFormat as any;
      
      expect(getHourInTimezone('Invalid/Timezone')).toBe(12);
    });
  });
});