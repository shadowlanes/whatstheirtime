/**
 * City data and search functionality
 */

const CityData = (function() {
    // City data with GMT offset format timezones
    const cities = [
        // United States
        { name: "New York", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
        { name: "Los Angeles", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },
        { name: "Chicago", country: "USA", timezone: "GMT-6", tzName: "America/Chicago" },
        { name: "Washington DC", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
        { name: "San Francisco", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },
        { name: "Miami", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
        { name: "Boston", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
        { name: "Houston", country: "USA", timezone: "GMT-6", tzName: "America/Chicago" },
        { name: "Seattle", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },
        { name: "Las Vegas", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },

        // India
        { name: "New Delhi", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Mumbai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Bangalore", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Chennai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Kolkata", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Hyderabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Pune", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Ahmedabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Jaipur", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
        { name: "Lucknow", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },

        // Europe
        { name: "London", country: "UK", timezone: "GMT+0", tzName: "Europe/London" },
        { name: "Paris", country: "France", timezone: "GMT+1", tzName: "Europe/Paris" },
        { name: "Berlin", country: "Germany", timezone: "GMT+1", tzName: "Europe/Berlin" },
        { name: "Madrid", country: "Spain", timezone: "GMT+1", tzName: "Europe/Madrid" },
        { name: "Rome", country: "Italy", timezone: "GMT+1", tzName: "Europe/Rome" },
        { name: "Amsterdam", country: "Netherlands", timezone: "GMT+1", tzName: "Europe/Amsterdam" },
        { name: "Brussels", country: "Belgium", timezone: "GMT+1", tzName: "Europe/Brussels" },
        { name: "Vienna", country: "Austria", timezone: "GMT+1", tzName: "Europe/Vienna" },
        { name: "Stockholm", country: "Sweden", timezone: "GMT+1", tzName: "Europe/Stockholm" },
        { name: "Oslo", country: "Norway", timezone: "GMT+1", tzName: "Europe/Oslo" },
        { name: "Copenhagen", country: "Denmark", timezone: "GMT+1", tzName: "Europe/Copenhagen" },
        { name: "Dublin", country: "Ireland", timezone: "GMT+0", tzName: "Europe/Dublin" },
        { name: "Lisbon", country: "Portugal", timezone: "GMT+0", tzName: "Europe/Lisbon" },

        // Asia
        { name: "Tokyo", country: "Japan", timezone: "GMT+9", tzName: "Asia/Tokyo" },
        { name: "Beijing", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai" },
        { name: "Shanghai", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai" },
        { name: "Hong Kong", country: "China", timezone: "GMT+8", tzName: "Asia/Hong_Kong" },
        { name: "Singapore", country: "Singapore", timezone: "GMT+8", tzName: "Asia/Singapore" },
        { name: "Seoul", country: "South Korea", timezone: "GMT+9", tzName: "Asia/Seoul" },
        { name: "Bangkok", country: "Thailand", timezone: "GMT+7", tzName: "Asia/Bangkok" },
        { name: "Jakarta", country: "Indonesia", timezone: "GMT+7", tzName: "Asia/Jakarta" },
        { name: "Manila", country: "Philippines", timezone: "GMT+8", tzName: "Asia/Manila" },
        { name: "Kuala Lumpur", country: "Malaysia", timezone: "GMT+8", tzName: "Asia/Kuala_Lumpur" },

        // Others
        { name: "Sydney", country: "Australia", timezone: "GMT+11", tzName: "Australia/Sydney" },
        { name: "Melbourne", country: "Australia", timezone: "GMT+11", tzName: "Australia/Melbourne" },
        { name: "Dubai", country: "UAE", timezone: "GMT+4", tzName: "Asia/Dubai" },
        { name: "Moscow", country: "Russia", timezone: "GMT+3", tzName: "Europe/Moscow" },
        { name: "São Paulo", country: "Brazil", timezone: "GMT-3", tzName: "America/Sao_Paulo" },
        { name: "Mexico City", country: "Mexico", timezone: "GMT-6", tzName: "America/Mexico_City" },
        { name: "Cairo", country: "Egypt", timezone: "GMT+2", tzName: "Africa/Cairo" },
        { name: "Lagos", country: "Nigeria", timezone: "GMT+1", tzName: "Africa/Lagos" },
        { name: "Toronto", country: "Canada", timezone: "GMT-5", tzName: "America/Toronto" },
        { name: "Vancouver", country: "Canada", timezone: "GMT-8", tzName: "America/Vancouver" }
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
     * Get country code for flag emoji
     * @param {string} countryName - Full country name
     * @returns {string} Two-letter country code for flags
     */
    function getCountryCodeForFlag(countryName) {
        const countryMap = {
            "USA": "US",
            "UK": "GB",
            "France": "FR",
            "Germany": "DE",
            "Spain": "ES",
            "Italy": "IT",
            "Netherlands": "NL",
            "Belgium": "BE",
            "Austria": "AT",
            "Sweden": "SE",
            "Norway": "NO",
            "Denmark": "DK",
            "Ireland": "IE",
            "Portugal": "PT",
            "Japan": "JP",
            "Australia": "AU",
            "Singapore": "SG",
            "UAE": "AE",
            "India": "IN",
            "China": "CN",
            "South Korea": "KR",
            "Thailand": "TH",
            "Indonesia": "ID",
            "Philippines": "PH",
            "Malaysia": "MY",
            "Brazil": "BR",
            "Mexico": "MX",
            "Egypt": "EG",
            "Nigeria": "NG",
            "Russia": "RU",
            "Canada": "CA"
        };
        
        return countryMap[countryName] || "UN"; // Default to UN flag if not found
    }
    
    /**
     * Get flag emoji from country name
     * @param {string} countryName - Full country name
     * @returns {string} Flag emoji
     */
    function getFlagEmoji(countryName) {
        const countryCode = getCountryCodeForFlag(countryName);
        
        // Convert country code to regional indicator symbols
        // Each letter is represented by a Regional Indicator Symbol, which is
        // 127397 code points after its ASCII position
        const codePoints = [...countryCode].map(char => 
            127397 + char.charCodeAt(0)
        );
        
        return String.fromCodePoint(...codePoints);
    }

    /**
     * Format city display in search results with flag
     * @param {Object} city - City object
     * @returns {string} Formatted city display string with flag
     */
    function formatCityDisplay(city) {
        const flag = getFlagEmoji(city.country);
        return `${flag} ${city.name}, ${city.country} (${city.timezone})`;
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
        parseGmtOffset,
        getFlagEmoji
    };
})();

// Explicitly make CityData available globally
window.CityData = CityData;
