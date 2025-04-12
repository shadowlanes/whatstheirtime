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
      
      // Mock timezone offset to make tests more predictable
      // For testing, we'll set our "local" timezone to UTC
      mockDate.getTimezoneOffset = jest.fn(() => 0);
      
      // Mock hours methods
      mockDate.getHours = jest.fn(() => 16); // This is what our implementation returns for fallback
      mockDate.getUTCHours = jest.fn(() => 12);
      mockDate.getUTCMinutes = jest.fn(() => 0);
    });

    it('should calculate the correct hour for GMT+3 timezone', () => {
      // When local time is noon UTC (12:00), GMT+3 should be 15:00
      expect(getHourInTimezone('GMT+3')).toBe(15);
    });

    it('should calculate the correct hour for GMT-5 timezone', () => {
      // When local time is noon UTC (12:00), GMT-5 should be 7:00
      expect(getHourInTimezone('GMT-5')).toBe(7);
    });

    it('should handle city objects', () => {
      // For this test, we'll create a mock city object instead of using cities array
      const mockCity = {
        id: '1',
        name: 'Test City',
        country: 'Test Country',
        timezone: 'GMT-4',
        tzName: 'Test/Timezone',
        alternateNames: []
      };
      
      // When local time is noon UTC, GMT-4 should be 8:00
      expect(getHourInTimezone(mockCity)).toBe(8);
    });

    it('should handle non-GMT timezone formats by returning local hour', () => {
      // For non-GMT formats, it should return local time (16:00 in our mock)
      expect(getHourInTimezone('America/New_York')).toBe(16);
    });

    it('should handle invalid GMT formats by returning local hour', () => {
      expect(getHourInTimezone('GMTInvalid')).toBe(16);
    });
  });
});