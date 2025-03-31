/**
 * Utilities module with pure functions
 */

const Utils = (function() {
    /**
     * Safely parse JSON with error handling
     * @param {string} jsonString - The JSON string to parse
     * @param {*} defaultValue - Default value if parsing fails
     * @returns {*} Parsed JSON or default value
     */
    function safeJsonParse(jsonString, defaultValue = null) {
        try {
            return jsonString ? JSON.parse(jsonString) : defaultValue;
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return defaultValue;
        }
    }

    /**
     * Store data in localStorage with key
     * @param {string} key - The storage key
     * @param {*} data - Data to store (will be stringified)
     */
    function storeData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error storing data:', error);
        }
    }

    /**
     * Retrieve data from localStorage
     * @param {string} key - The storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Retrieved data or default value
     */
    function retrieveData(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        return safeJsonParse(data, defaultValue);
    }

    /**
     * Debounce function for limiting function call frequency
     * @param {Function} func - The function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, delay) {
        let debounceTimer;
        return function(...args) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Generate a unique ID
     * @returns {string} Unique ID string
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    return {
        safeJsonParse,
        storeData,
        retrieveData,
        debounce,
        generateId
    };
})();

// Explicitly make Utils available globally
window.Utils = Utils;
