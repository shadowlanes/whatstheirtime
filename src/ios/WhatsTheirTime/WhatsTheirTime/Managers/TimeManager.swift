import Foundation

class TimeManager {
    
    static func getLocalTime(for timezone: String) -> String {
        let date = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        
        if let offset = parseGmtOffset(timezone) {
            // Create custom time zone from GMT offset
            let seconds = offset * 60
            let timeZone = TimeZone(secondsFromGMT: seconds)
            formatter.timeZone = timeZone
            return formatter.string(from: date)
        } else {
            // Fallback to system time
            return formatter.string(from: date)
        }
    }
    
    static func getDayDifference(for timezone: String) -> Int {
        let localDate = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone.current
        
        let localDateStr = formatter.string(from: localDate)
        
        if let offset = parseGmtOffset(timezone) {
            // Set the formatter to the target timezone
            let seconds = offset * 60
            formatter.timeZone = TimeZone(secondsFromGMT: seconds)
            let remoteDateStr = formatter.string(from: localDate)
            
            // Compare date strings to see if they're different
            if remoteDateStr > localDateStr {
                return 1  // Remote time is a day ahead
            } else if remoteDateStr < localDateStr {
                return -1  // Remote time is a day behind
            }
        }
        
        return 0  // Same day
    }
    
    static func getLocalDay(for timezone: String) -> String {
        let date = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"  // Full day name
        
        if let offset = parseGmtOffset(timezone) {
            // Create custom time zone from GMT offset
            let seconds = offset * 60
            let timeZone = TimeZone(secondsFromGMT: seconds)
            formatter.timeZone = timeZone
            return formatter.string(from: date)
        } else {
            // Fallback to system time
            return formatter.string(from: date)
        }
    }
    
    static func getFormattedTimeDifference(for timezone: String) -> String {
        guard let offset = parseGmtOffset(timezone) else {
            return "Unknown"
        }
        
        // Get local timezone offset in minutes
        let localOffset = TimeZone.current.secondsFromGMT() / 60
        
        // Calculate difference
        let difference = offset - localOffset
        
        if difference == 0 {
            return "Same time as you"
        }
        
        let hours = abs(difference) / 60
        let minutes = abs(difference) % 60
        
        var result = ""
        
        if difference > 0 {
            result = "+"
        } else {
            result = "-"
        }
        
        if hours > 0 {
            result += "\(hours)h"
        }
        
        if minutes > 0 {
            result += " \(minutes)m"
        }
        
        return result
    }
    
    // Parse GMT timezone offset string (e.g., "GMT+5.5") to minutes
    static func parseGmtOffset(_ gmtTimezone: String) -> Int? {
        guard gmtTimezone.hasPrefix("GMT") else {
            return nil
        }
        
        let offsetStr = String(gmtTimezone.dropFirst(3)) // Remove "GMT"
        guard let offsetHours = Double(offsetStr) else {
            return nil
        }
        
        return Int(offsetHours * 60) // Convert to minutes
    }
}