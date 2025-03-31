/**
 * Time management module
 */

const TimeManager = (function() {
    /**
     * Get current time in a specific GMT timezone
     * @param {string} gmtTimezone - The timezone in GMT format (e.g., "GMT+5.5")
     * @returns {Date} Current date/time in that timezone
     */
    function getCurrentTimeInTimezone(gmtTimezone) {
        const date = new Date();
        
        try {
            // Get the local time offset in minutes
            const localOffset = date.getTimezoneOffset();
            
            // Parse the GMT offset from the timezone string
            const targetOffset = CityData.parseGmtOffset(gmtTimezone);
            
            // Calculate the time difference in minutes
            // Note: getTimezoneOffset() returns negative minutes for timezones ahead of UTC
            const diff = -localOffset - targetOffset;
            
            // Adjust the time by adding the difference in milliseconds
            const ms = date.getTime() + (diff * 60 * 1000);
            
            // Create a new date with the adjusted time
            return new Date(ms);
        } catch (error) {
            console.error(`Error calculating time for timezone ${gmtTimezone}:`, error);
            return date; // Return local time as fallback
        }
    }
    
    /**
     * Format time for display (HH:MM AM/PM)
     * @param {Date} date - The date object to format
     * @returns {string} Formatted time string
     */
    function formatTimeForDisplay(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    
    /**
     * Get formatted time for a GMT timezone
     * @param {string} gmtTimezone - The timezone in GMT format
     * @returns {string} Formatted time string
     */
    function getFormattedTimeForTimezone(gmtTimezone) {
        const time = getCurrentTimeInTimezone(gmtTimezone);
        return formatTimeForDisplay(time);
    }
    
    /**
     * Update time element with current time for a timezone
     * @param {HTMLElement} element - The element to update
     * @param {string} gmtTimezone - The timezone in GMT format
     */
    function updateTimeElement(element, gmtTimezone) {
        if (!element) return;
        element.textContent = getFormattedTimeForTimezone(gmtTimezone);
    }
    
    return {
        getCurrentTimeInTimezone,
        formatTimeForDisplay,
        getFormattedTimeForTimezone,
        updateTimeElement
    };
})();

// Explicitly make TimeManager available globally
window.TimeManager = TimeManager;
