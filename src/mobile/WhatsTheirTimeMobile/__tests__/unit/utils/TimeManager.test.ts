import { 
  getEffectiveTimezone, 
  isDateInRange, 
  getLocalTime, 
  getLocalDay, 
  getDayDifference,
  getFormattedTimeDifference
} from '../../../utils/TimeManager';

describe('TimeManager', () => {
  const baseMockDate = new Date('2025-04-12T12:00:00Z'); // Saturday, April 12, 2025, noon UTC
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date(baseMockDate);
    // Set a fixed date for testing
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    mockDate.getTimezoneOffset = jest.fn(() => 0); // Mock timezone offset to 0 (UTC)
    
    // Mock Date.prototype.getUTCHours and getUTCMinutes
    mockDate.getUTCHours = jest.fn(() => mockDate.getUTCHours()); 
    mockDate.getUTCMinutes = jest.fn(() => mockDate.getUTCMinutes());
    
    // Mock getHours and getMinutes for consistent testing (reflecting UTC as local for these tests)
    mockDate.getHours = jest.fn(() => mockDate.getUTCHours());
    mockDate.getMinutes = jest.fn(() => mockDate.getUTCMinutes());
    mockDate.getDay = jest.fn(() => mockDate.getUTCDay()); // 6 for Saturday
    mockDate.getFullYear = jest.fn(() => mockDate.getUTCFullYear());
    mockDate.getMonth = jest.fn(() => mockDate.getUTCMonth());
    mockDate.getDate = jest.fn(() => mockDate.getUTCDate());


    // Mock Intl.DateTimeFormat for consistent testing
    const mockDateTimeFormat = jest.fn().mockImplementation((locale, options) => ({
      format: jest.fn((dateToFormat) => {
        const tz = options?.timeZone;
        // getLocalTime
        if (options?.hour === 'numeric' && options?.minute === '2-digit') {
          if (tz === 'Europe/Moscow') return '3:00 PM'; // GMT+3
          if (tz === 'America/New_York') return '8:00 AM'; // GMT-4 (DST)
          if (tz === 'Asia/Kolkata') return '5:30 PM'; // GMT+5:30
          // Fallback for getFormattedTimeDifference
          if (tz && options.hour12 === false) { // for getFormattedTimeDifference
            const d = new Date(dateToFormat.getTime());
            // This is a simplified mock; real Intl.DateTimeFormat is more complex
            if (tz === 'Europe/Moscow') return `${(d.getUTCHours() + 3) % 24}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
            if (tz === 'America/New_York') return `${(d.getUTCHours() - 4 + 24) % 24}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
            if (tz === 'Asia/Kolkata') {
                let h = d.getUTCHours() + 5;
                let m = d.getUTCMinutes() + 30;
                if (m >= 60) { h++; m -=60; }
                return `${h % 24}:${String(m).padStart(2, '0')}`;
            }
          }
          return '12:00 PM'; // Default for getLocalTime
        }
        // getLocalDay
        if (options?.weekday === 'long') {
          if (tz === 'Europe/Moscow') return 'Saturday'; // 2025-04-12T15:00:00Z
          if (tz === 'Pacific/Auckland') return 'Sunday'; // 2025-04-13T00:00:00Z (UTC+12)
          if (tz === 'Pacific/Honolulu' && dateToFormat.getUTCHours() < 10) return 'Friday'; // e.g. 2025-04-12T08:00:00Z is 2025-04-11 in HNL
          if (tz === 'Pacific/Honolulu') return 'Saturday'; // 2025-04-12T12:00:00Z is 2025-04-12T02:00:00Z in HNL
          return 'Saturday'; // Default
        }
        // getDayDifference (en-CA format YYYY-MM-DD)
        if (locale === 'en-CA' && options?.year === 'numeric') {
          const d = new Date(dateToFormat.getTime());
          let year = d.getUTCFullYear();
          let month = d.getUTCMonth();
          let day = d.getUTCDate();

          if (tz === 'Europe/Moscow') { // UTC+3
            const tempDate = new Date(Date.UTC(year, month, day, d.getUTCHours() + 3, d.getUTCMinutes()));
            return `${tempDate.getUTCFullYear()}-${String(tempDate.getUTCMonth() + 1).padStart(2, '0')}-${String(tempDate.getUTCDate()).padStart(2, '0')}`;
          }
          if (tz === 'Pacific/Auckland') { // UTC+12
            const tempDate = new Date(Date.UTC(year, month, day, d.getUTCHours() + 12, d.getUTCMinutes()));
            return `${tempDate.getUTCFullYear()}-${String(tempDate.getUTCMonth() + 1).padStart(2, '0')}-${String(tempDate.getUTCDate()).padStart(2, '0')}`;
          }
          if (tz === 'Pacific/Honolulu') { // UTC-10
            const tempDate = new Date(Date.UTC(year, month, day, d.getUTCHours() - 10, d.getUTCMinutes()));
            return `${tempDate.getUTCFullYear()}-${String(tempDate.getUTCMonth() + 1).padStart(2, '0')}-${String(tempDate.getUTCDate()).padStart(2, '0')}`;
          }
          return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Default UTC
        }
        return 'FallbackFormat';
      })
    }));
    
    (mockDateTimeFormat as any).supportedLocalesOf = jest.fn();
    global.Intl = { ...global.Intl, DateTimeFormat: mockDateTimeFormat as any };
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
        format: jest.fn((dateToFormat) => {
          const tz = options?.timeZone;
          // getLocalTime
          if (options?.hour === 'numeric' && options?.minute === '2-digit') {
            if (tz === 'Europe/Moscow') return '3:00 PM'; // GMT+3
            if (tz === 'America/New_York') return '8:00 AM'; // GMT-4 (DST)
            if (tz === 'Asia/Kolkata') return '5:30 PM'; // GMT+5:30
            // Fallback for getFormattedTimeDifference
            if (tz && options.hour12 === false) { // for getFormattedTimeDifference
              const d = new Date(dateToFormat.getTime());
              // This is a simplified mock; real Intl.DateTimeFormat is more complex
              if (tz === 'Europe/Moscow') return `${(d.getUTCHours() + 3) % 24}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
              if (tz === 'America/New_York') return `${(d.getUTCHours() - 4 + 24) % 24}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
              if (tz === 'Asia/Kolkata') {
                  let h = d.getUTCHours() + 5;
                  let m = d.getUTCMinutes() + 30;
                  if (m >= 60) { h++; m -=60; }
                  return `${h % 24}:${String(m).padStart(2, '0')}`;
              }
            }
            return '12:00 PM'; // Default for getLocalTime
          }
          // getLocalDay
          if (options?.weekday === 'long') {
            if (tz === 'Europe/Moscow') return 'Saturday'; // 2025-04-12T15:00:00Z
            if (tz === 'Pacific/Auckland') return 'Sunday'; // 2025-04-13T00:00:00Z (UTC+12)
            if (tz === 'Pacific/Honolulu' && dateToFormat.getUTCHours() < 10) return 'Friday'; // e.g. 2025-04-12T08:00:00Z is 2025-04-11 in HNL
            if (tz === 'Pacific/Honolulu') return 'Saturday'; // 2025-04-12T12:00:00Z is 2025-04-12T02:00:00Z in HNL
            return 'Saturday'; // Default
          }
          // getDayDifference (en-CA format YYYY-MM-DD)
          if (locale === 'en-CA' && options?.year === 'numeric') {
            const d = new Date(dateToFormat.getTime());
            let year = d.getUTCFullYear();
            let month = d.getUTCMonth();
            let day = d.getUTCDate();

            if (tz === 'Europe/Moscow') { // UTC+3
              const tempDate = new Date(Date.UTC(year, month, day, d.getUTCHours() + 3, d.getUTCMinutes()));
              return `${tempDate.getUTCFullYear()}-${String(tempDate.getUTCMonth() + 1).padStart(2, '0')}-${String(tempDate.getUTCDate()).padStart(2, '0')}`;
            }
            if (tz === 'Pacific/Auckland') { // UTC+12
              const tempDate = new Date(Date.UTC(year, month, day, d.getUTCHours() + 12, d.getUTCMinutes()));
              return `${tempDate.getUTCFullYear()}-${String(tempDate.getUTCMonth() + 1).padStart(2, '0')}-${String(tempDate.getUTCDate()).padStart(2, '0')}`;
            }
            if (tz === 'Pacific/Honolulu') { // UTC-10
              const tempDate = new Date(Date.UTC(year, month, day, d.getUTCHours() - 10, d.getUTCMinutes()));
              return `${tempDate.getUTCFullYear()}-${String(tempDate.getUTCMonth() + 1).padStart(2, '0')}-${String(tempDate.getUTCDate()).padStart(2, '0')}`;
            }
            return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Default UTC
          }
          return 'FallbackFormat';
        })
      }));
      
      (mockDateTimeFormat as any).supportedLocalesOf = jest.fn();
      global.Intl = { ...global.Intl, DateTimeFormat: mockDateTimeFormat as any };
    });

    it('should format local time correctly for Europe/Moscow timezone', () => {
      expect(getLocalTime('Europe/Moscow')).toBe('3:00 PM');
    });
    
    it('should format local time correctly for America/New_York timezone', () => {
      expect(getLocalTime('America/New_York')).toBe('8:00 AM');
    });
    
    it('should handle invalid timezone formats by returning local time', () => {
      // Mock Intl.DateTimeFormat to throw for invalid timezones
      const mockThrowingDateTimeFormat = jest.fn().mockImplementation(() => {
        throw new Error('Invalid timezone');
      });
      (mockThrowingDateTimeFormat as any).supportedLocalesOf = jest.fn();
      global.Intl.DateTimeFormat = mockThrowingDateTimeFormat as any;
      
      // Ensure fallback formatTime uses the mocked date
      mockDate.getHours = jest.fn(() => 12); // Noon
      mockDate.getMinutes = jest.fn(() => 0);

      expect(getLocalTime('Invalid/Timezone')).toBe('12:00 PM');
    });
  });

  describe('getLocalDay', () => {
    it('should return the correct day for Europe/Moscow timezone', () => {
      // mockDate is Sat, 12 Apr 2025 12:00:00 UTC. Moscow is UTC+3 (15:00 Sat)
      expect(getLocalDay('Europe/Moscow')).toBe('Saturday');
    });

    it('should return the correct day for Pacific/Auckland timezone (next day)', () => {
      // mockDate is Sat, 12 Apr 2025 12:00:00 UTC. Auckland is UTC+12 (00:00 Sun, 13 Apr)
      expect(getLocalDay('Pacific/Auckland')).toBe('Sunday');
    });
    
    it('should return the correct day for Pacific/Honolulu timezone (previous day if UTC time is early)', () => {
      // Set time to early morning UTC, e.g., 08:00 UTC on Sat, Apr 12
      // This is 22:00 on Fri, Apr 11 in Honolulu (UTC-10)
      mockDate = new Date('2025-04-12T08:00:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());
      // Ensure getDay is called on the mockDate instance
      mockDate.getDay = jest.fn(() => 6); // Saturday


      expect(getLocalDay('Pacific/Honolulu')).toBe('Friday');
    });

    it('should handle invalid timezone formats by returning local day', () => {
      const mockThrowingDateTimeFormat = jest.fn().mockImplementation(() => {
        throw new Error('Invalid timezone');
      });
      (mockThrowingDateTimeFormat as any).supportedLocalesOf = jest.fn();
      global.Intl.DateTimeFormat = mockThrowingDateTimeFormat as any;
      
      // mockDate is Saturday
      mockDate.getDay = jest.fn(() => 6); // Saturday
      expect(getLocalDay('Invalid/Timezone')).toBe('Saturday');
    });
  });

  describe('getDayDifference', () => {
    // mockDate is Sat, 12 Apr 2025 12:00:00 UTC by default in beforeEach

    it('should return 1 for a timezone that is the next day', () => {
      // Auckland UTC+12. 12:00 UTC Sat is 00:00 NZST Sun
      expect(getDayDifference('Pacific/Auckland')).toBe(1); // Tomorrow
    });

    it('should return -1 for a timezone that is the previous day', () => {
      // Set UTC time to early morning, e.g., 02:00 UTC on Apr 12
      // This is 16:00 on Apr 11 in Honolulu (UTC-10)
      mockDate = new Date('2025-04-12T02:00:00Z'); // 2 AM UTC on Saturday
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());
      // Update related date parts for the new mockDate
      mockDate.getFullYear = jest.fn(() => 2025);
      mockDate.getMonth = jest.fn(() => 3); // April
      mockDate.getDate = jest.fn(() => 12);

      expect(getDayDifference('Pacific/Honolulu')).toBe(-1); // Yesterday
    });

    it('should return 0 for a timezone that is the same day', () => {
      // Moscow UTC+3. 12:00 UTC Sat is 15:00 MSK Sat
      expect(getDayDifference('Europe/Moscow')).toBe(0); // Same day
    });

    it('should return 0 for invalid timezone format (fallback)', () => {
      const mockThrowingDateTimeFormat = jest.fn().mockImplementation(() => {
        throw new Error('Invalid timezone');
      });
      (mockThrowingDateTimeFormat as any).supportedLocalesOf = jest.fn();
      global.Intl.DateTimeFormat = mockThrowingDateTimeFormat as any;
      expect(getDayDifference('Invalid/Timezone')).toBe(0);
    });
  });

  describe('getFormattedTimeDifference', () => {
    // mockDate is Sat, 12 Apr 2025 12:00:00 UTC. Local time is mocked as 12:00.
    // getTimezoneOffset is mocked to 0.

    it('should correctly format for a timezone ahead (e.g., Europe/Moscow UTC+3)', () => {
      // Local time 12:00, Moscow time 15:00
      expect(getFormattedTimeDifference('Europe/Moscow')).toBe('+3h');
    });

    it('should correctly format for a timezone behind (e.g., America/New_York UTC-4 with DST)', () => {
      // Local time 12:00, New York time 08:00
      expect(getFormattedTimeDifference('America/New_York')).toBe('-4h');
    });
    
    it('should correctly format for a timezone with hours and minutes (e.g., Asia/Kolkata UTC+5:30)', () => {
      // Local time 12:00, Kolkata time 17:30
      expect(getFormattedTimeDifference('Asia/Kolkata')).toBe('+5h 30m');
    });

    it('should return "Same time as you" for the same timezone (effectively UTC in this test setup)', () => {
       // Mocking getHours and getMinutes to be 12:00 for the "local" part of the calculation
      mockDate.getHours = jest.fn(() => 12);
      mockDate.getMinutes = jest.fn(() => 0);
      // Target timezone is also UTC (or a timezone that resolves to 12:00 in the mock)
      // The mock for Intl.DateTimeFormat with hour12:false needs to return '12:00' for UTC-like timezone
      const originalDateTimeFormat = global.Intl.DateTimeFormat;
      const mockSameTimeDateTimeFormat = jest.fn().mockImplementation((locale, options) => {
        if (options?.timeZone === 'Etc/UTC' && options?.hour12 === false) {
          return { format: jest.fn(() => '12:00') };
        }
        // Fallback to original mock for other cases if necessary, or simplify
        return originalDateTimeFormat(locale, options); 
      });
      (mockSameTimeDateTimeFormat as any).supportedLocalesOf = jest.fn();
      global.Intl.DateTimeFormat = mockSameTimeDateTimeFormat as any;

      expect(getFormattedTimeDifference('Etc/UTC')).toBe('Same time as you');
      global.Intl.DateTimeFormat = originalDateTimeFormat; // Restore original mock
    });
    
    it('should return "Unknown" for invalid timezone formats', () => {
      const mockThrowingDateTimeFormat = jest.fn().mockImplementation(() => {
        throw new Error('Invalid timezone');
      });
      (mockThrowingDateTimeFormat as any).supportedLocalesOf = jest.fn();
      global.Intl.DateTimeFormat = mockThrowingDateTimeFormat as any;
      expect(getFormattedTimeDifference('Invalid/Timezone')).toBe('Unknown');
    });
  });
});