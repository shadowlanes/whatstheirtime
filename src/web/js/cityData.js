/**
 * City data and search functionality
 */

const CityData = (function() {
    // City data with GMT offset format timezones
    const cities = [
        // United States
        { name: "New York", country: "USA", timezone: "GMT-5" },
        { name: "Los Angeles", country: "USA", timezone: "GMT-8" },
        { name: "Chicago", country: "USA", timezone: "GMT-6" },
        { name: "Washington DC", country: "USA", timezone: "GMT-5" },
        { name: "San Francisco", country: "USA", timezone: "GMT-8" },
        { name: "Miami", country: "USA", timezone: "GMT-5" },
        { name: "Boston", country: "USA", timezone: "GMT-5" },
        { name: "Houston", country: "USA", timezone: "GMT-6" },
        { name: "Seattle", country: "USA", timezone: "GMT-8" },
        { name: "Las Vegas", country: "USA", timezone: "GMT-8" },

        // India
        { name: "New Delhi", country: "India", timezone: "GMT+5.5" },
        { name: "Mumbai", country: "India", timezone: "GMT+5.5" },
        { name: "Bangalore", country: "India", timezone: "GMT+5.5" },
        { name: "Chennai", country: "India", timezone: "GMT+5.5" },
        { name: "Kolkata", country: "India", timezone: "GMT+5.5" },
        { name: "Hyderabad", country: "India", timezone: "GMT+5.5" },
        { name: "Pune", country: "India", timezone: "GMT+5.5" },
        { name: "Ahmedabad", country: "India", timezone: "GMT+5.5" },
        { name: "Jaipur", country: "India", timezone: "GMT+5.5" },
        { name: "Lucknow", country: "India", timezone: "GMT+5.5" },

        // Europe
        { name: "London", country: "UK", timezone: "GMT+0" },
        { name: "Paris", country: "France", timezone: "GMT+1" },
        { name: "Berlin", country: "Germany", timezone: "GMT+1" },
        { name: "Madrid", country: "Spain", timezone: "GMT+1" },
        { name: "Rome", country: "Italy", timezone: "GMT+1" },
        { name: "Amsterdam", country: "Netherlands", timezone: "GMT+1" },
        { name: "Brussels", country: "Belgium", timezone: "GMT+1" },
        { name: "Vienna", country: "Austria", timezone: "GMT+1" },
        { name: "Stockholm", country: "Sweden", timezone: "GMT+1" },
        { name: "Oslo", country: "Norway", timezone: "GMT+1" },
        { name: "Copenhagen", country: "Denmark", timezone: "GMT+1" },
        { name: "Dublin", country: "Ireland", timezone: "GMT+0" },
        { name: "Lisbon", country: "Portugal", timezone: "GMT+0" },

        // Asia
        { name: "Tokyo", country: "Japan", timezone: "GMT+9" },
        { name: "Beijing", country: "China", timezone: "GMT+8" },
        { name: "Shanghai", country: "China", timezone: "GMT+8" },
        { name: "Hong Kong", country: "China", timezone: "GMT+8" },
        { name: "Singapore", country: "Singapore", timezone: "GMT+8" },
        { name: "Seoul", country: "South Korea", timezone: "GMT+9" },
        { name: "Bangkok", country: "Thailand", timezone: "GMT+7" },
        { name: "Jakarta", country: "Indonesia", timezone: "GMT+7" },
        { name: "Manila", country: "Philippines", timezone: "GMT+8" },
        { name: "Kuala Lumpur", country: "Malaysia", timezone: "GMT+8" },

        // Others
        { name: "Sydney", country: "Australia", timezone: "GMT+11" },
        { name: "Melbourne", country: "Australia", timezone: "GMT+11" },
        { name: "Dubai", country: "UAE", timezone: "GMT+4" },
        { name: "Moscow", country: "Russia", timezone: "GMT+3" },
        { name: "São Paulo", country: "Brazil", timezone: "GMT-3" },
        { name: "Mexico City", country: "Mexico", timezone: "GMT-6" },
        { name: "Cairo", country: "Egypt", timezone: "GMT+2" },
        { name: "Lagos", country: "Nigeria", timezone: "GMT+1" },
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
