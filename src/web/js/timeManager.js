/**
 * Time management module
 */

const TimeManager = (function() {
    /**
     * Get the current user's timezone offset in minutes
     * @returns {number} Current timezone offset in minutes
     */
    function getCurrentTimezoneOffset() {
        // Get the local time offset in minutes
        // Note: getTimezoneOffset() returns minutes WEST of UTC, so negative for timezones east of UTC
        return new Date().getTimezoneOffset();
    }

    /**
     * Get the timezone offset string in GMT format (e.g., "GMT-5")
     * @returns {string} Current timezone in GMT format
     */
    function getCurrentTimezoneString() {
        const offsetMinutes = getCurrentTimezoneOffset();
        // Convert to hours (negative because getTimezoneOffset() returns minutes west of UTC)
        const offsetHours = -(offsetMinutes / 60);
        const sign = offsetHours >= 0 ? '+' : '-';
        const absoluteHours = Math.abs(offsetHours);
        const hours = Math.floor(absoluteHours);
        const minutes = Math.round((absoluteHours - hours) * 60);
        
        if (minutes === 0) {
            return `GMT${sign}${hours}`;
        } else {
            return `GMT${sign}${hours}.${minutes}`;
        }
    }
    
    /**
     * Get current time in a specific timezone
     * @param {string} tzName - IANA timezone name (e.g., "America/New_York")
     * @returns {Date} Current date/time in that timezone
     */
    function getCurrentTimeInTimezone(tzName) {
        try {
            // Use tzName directly with moment-timezone
            if (tzName && moment.tz.zone(tzName)) {
                // Convert moment object to Date object properly to preserve timezone
                return moment().tz(tzName).toDate();
            }
            
            // If tzName is not valid, fall back to local time
            console.warn(`Invalid timezone name: ${tzName}, falling back to local time`);
            return new Date();
        } catch (error) {
            console.error(`Error calculating time for timezone ${tzName}:`, error);
            return new Date(); // Return local time as fallback
        }
    }
    
    /**
     * Format time for display (HH:MM AM/PM)
     * @param {Date} date - The date object to format
     * @returns {string} Formatted time string
     */
    function formatTimeForDisplay(date) {
        // When formatting time from a Date object that came from moment.tz().toDate(),
        // we need to use moment again to preserve the timezone info
        if (date._isAMomentObject) {
            // If it's a moment object, format it directly
            return date.format('hh:mm A');
        }
        
        // Otherwise use locale time formatting (for Date objects)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    
    /**
     * Get formatted time for a timezone
     * @param {string} tzName - IANA timezone name
     * @returns {string} Formatted time string
     */
    function getFormattedTimeForTimezone(tzName) {
        // Use moment directly for formatting to preserve timezone info
        if (tzName && moment.tz.zone(tzName)) {
            return moment().tz(tzName).format('hh:mm A');
        }
        
        // Fall back to standard method if tzName is invalid
        const time = getCurrentTimeInTimezone(tzName);
        return formatTimeForDisplay(time);
    }
    
    /**
     * Update time element with current time for a timezone
     * @param {HTMLElement} element - The element to update
     * @param {string} tzName - IANA timezone name
     */
    function updateTimeElement(element, tzName) {
        if (!element) return;
        element.textContent = getFormattedTimeForTimezone(tzName);
    }
    
    return {
        getCurrentTimezoneOffset,
        getCurrentTimezoneString,
        getCurrentTimeInTimezone,
        formatTimeForDisplay,
        getFormattedTimeForTimezone,
        updateTimeElement
    };
})();

// Explicitly make TimeManager available globally
window.TimeManager = TimeManager;
