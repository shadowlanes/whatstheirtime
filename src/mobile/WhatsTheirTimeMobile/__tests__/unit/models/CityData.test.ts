import { getFlag, searchCities, cities } from '../../../models/CityData';

describe('CityData', () => {
  describe('getFlag', () => {
    it('should return a flag emoji for supported countries', () => {
      expect(getFlag('USA')).toBe('🇺🇸');
      expect(getFlag('UK')).toBe('🇬🇧');
      expect(getFlag('India')).toBe('🇮🇳');
      expect(getFlag('Japan')).toBe('🇯🇵');
    });

    it('should return the UN flag for unsupported countries', () => {
      expect(getFlag('Unknown Country')).toBe('🇺🇳');
    });
  });

  describe('searchCities', () => {
    it('should return empty array for queries less than 2 characters', () => {
      expect(searchCities('')).toEqual([]);
      expect(searchCities('a')).toEqual([]);
    });

    it('should find cities matching the query by name', () => {
      const results = searchCities('new');
      
      // Should find New York, New Delhi
      expect(results.some(city => city.name === 'New York')).toBe(true);
      expect(results.some(city => city.name === 'New Delhi')).toBe(true);
    });

    it('should find cities matching the query by country', () => {
      const results = searchCities('india');
      
      // Should find cities in India
      expect(results.every(city => city.country === 'India')).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find cities matching the query by alternate name', () => {
      const results = searchCities('big apple');
      
      // Should find New York which has "Big Apple" as an alternate name
      expect(results.some(city => city.name === 'New York')).toBe(true);
    });

    it('should return maximum 10 results', () => {
      // Search for a common term that would match many cities
      const results = searchCities('a');
      
      // Should be limited to 10 results
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should perform case-insensitive search', () => {
      const lowerResults = searchCities('tokyo');
      const upperResults = searchCities('TOKYO');
      const mixedResults = searchCities('ToKyO');
      
      // All should find Tokyo
      expect(lowerResults.some(city => city.name === 'Tokyo')).toBe(true);
      expect(upperResults.some(city => city.name === 'Tokyo')).toBe(true);
      expect(mixedResults.some(city => city.name === 'Tokyo')).toBe(true);
    });
  });

  describe('cities data', () => {
    it('should have unique IDs for all cities', () => {
      const cityIds = cities.map(city => city.id);
      const uniqueIds = [...new Set(cityIds)];
      expect(cityIds.length).toBe(uniqueIds.length);
    });

    it('should have required properties for all cities', () => {
      cities.forEach(city => {
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('country');
        expect(city).toHaveProperty('timezone');
        expect(city).toHaveProperty('alternateNames');
      });
    });

    it('should have valid timezone format for all cities', () => {
      // IANA timezone format validation - should contain at least one slash
      cities.forEach(city => {
        expect(city.timezone).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$/);
      });
    });
  });
});