/**
 * City data and search functionality
 */

const CityData = (function() {
    // City data with GMT offset format timezones
    const cities = [
        { name: "New York", country: "USA", timezone: "GMT-5" },
        { name: "Los Angeles", country: "USA", timezone: "GMT-8" },
        { name: "Chicago", country: "USA", timezone: "GMT-6" },
        { name: "London", country: "UK", timezone: "GMT+0" },
        { name: "Paris", country: "France", timezone: "GMT+1" },
        { name: "Berlin", country: "Germany", timezone: "GMT+1" },
        { name: "Madrid", country: "Spain", timezone: "GMT+1" },
        { name: "Rome", country: "Italy", timezone: "GMT+1" },
        { name: "Tokyo", country: "Japan", timezone: "GMT+9" },
        { name: "Sydney", country: "Australia", timezone: "GMT+11" },
        { name: "Singapore", country: "Singapore", timezone: "GMT+8" },
        { name: "Dubai", country: "UAE", timezone: "GMT+4" },
        { name: "Mumbai", country: "India", timezone: "GMT+5.5" },
        { name: "Delhi", country: "India", timezone: "GMT+5.5" },
        { name: "Bangalore", country: "India", timezone: "GMT+5.5" },
        { name: "Hong Kong", country: "China", timezone: "GMT+8" },
        { name: "Beijing", country: "China", timezone: "GMT+8" },
        { name: "Shanghai", country: "China", timezone: "GMT+8" },
        { name: "São Paulo", country: "Brazil", timezone: "GMT-3" },
        { name: "Mexico City", country: "Mexico", timezone: "GMT-6" },
        { name: "Cairo", country: "Egypt", timezone: "GMT+2" },
        { name: "Lagos", country: "Nigeria", timezone: "GMT+1" },
        { name: "Moscow", country: "Russia", timezone: "GMT+3" },
        { name: "Toronto", country: "Canada", timezone: "GMT-5" },
        { name: "Vancouver", country: "Canada", timezone: "GMT-8" }
    ];

    /**
     * Search for cities based on a query string
     * @param {string} query - The search query
     * @returns {Object[]} Array of matching cities
     */
    function searchCities(query) {
        if (!query || query.trim().length < 2) return [];
        
        const normalizedQuery = query.toLowerCase().trim();
        
        return cities.filter(city => 
            city.name.toLowerCase().includes(normalizedQuery) || 
            city.country.toLowerCase().includes(normalizedQuery)
        ).slice(0, 10); // Limit results to 10 for better UX
    }

    /**
     * Get timezone for a specific city
     * @param {string} cityName - The name of the city
     * @returns {string|null} Timezone or null if not found
     */
    function getTimezoneForCity(cityName) {
        const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        return city ? city.timezone : null;
    }

    /**
     * Format city display in search results
     * @param {Object} city - City object
     * @returns {string} Formatted city display string
     */
    function formatCityDisplay(city) {
        return `${city.name}, ${city.country} (${city.timezone})`;
    }

    /**
     * Get all available cities
     * @returns {Object[]} Array of all cities
     */
    function getAllCities() {
        return [...cities];
    }

    /**
     * Parse GMT timezone offset to minutes
     * @param {string} gmtTimezone - GMT timezone string (e.g., "GMT+5.5")
     * @returns {number} Offset in minutes
     */
    function parseGmtOffset(gmtTimezone) {
        if (!gmtTimezone || !gmtTimezone.startsWith('GMT')) {
            return 0;
        }
        
        const offsetStr = gmtTimezone.substring(3); // Remove "GMT"
        const offsetHours = parseFloat(offsetStr);
        return offsetHours * 60; // Convert to minutes
    }

    return {
        searchCities,
        getTimezoneForCity,
        formatCityDisplay,
        getAllCities,
        parseGmtOffset
    };
})();

// Explicitly make CityData available globally
window.CityData = CityData;
