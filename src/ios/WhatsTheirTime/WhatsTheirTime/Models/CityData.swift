import Foundation

struct City: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let country: String
    let timezone: String
    let tzName: String
    
    func formattedDisplayName() -> String {
        return "\(getFlag(for: country)) \(name), \(country) (\(timezone))"
    }
    
    func getFlag(for countryName: String) -> String {
        let countryCode = getCountryCode(for: countryName)
        
        // Convert country code to regional indicator symbols
        let base: UInt32 = 127397
        var emoji = ""
        for scalar in countryCode.unicodeScalars {
            emoji.append(String(UnicodeScalar(base + scalar.value)!))
        }
        
        return emoji
    }
    
    private func getCountryCode(for countryName: String) -> String {
        let countryMap: [String: String] = [
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
        ]
        
        return countryMap[countryName] ?? "UN"
    }
}

class CityDataManager {
    static let shared = CityDataManager()
    
    private init() {}
    
    // Cities data with GMT offset format timezones
    let cities: [City] = [
        // United States
        City(name: "New York", country: "USA", timezone: "GMT-5", tzName: "America/New_York"),
        City(name: "Los Angeles", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles"),
        City(name: "Chicago", country: "USA", timezone: "GMT-6", tzName: "America/Chicago"),
        City(name: "Washington DC", country: "USA", timezone: "GMT-5", tzName: "America/New_York"),
        City(name: "San Francisco", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles"),
        City(name: "Miami", country: "USA", timezone: "GMT-5", tzName: "America/New_York"),
        City(name: "Boston", country: "USA", timezone: "GMT-5", tzName: "America/New_York"),
        City(name: "Houston", country: "USA", timezone: "GMT-6", tzName: "America/Chicago"),
        City(name: "Seattle", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles"),
        City(name: "Las Vegas", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles"),
        
        // India
        City(name: "New Delhi", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Mumbai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Bangalore", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Chennai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Kolkata", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Hyderabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Pune", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Ahmedabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Jaipur", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        City(name: "Lucknow", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata"),
        
        // Europe
        City(name: "London", country: "UK", timezone: "GMT+0", tzName: "Europe/London"),
        City(name: "Paris", country: "France", timezone: "GMT+1", tzName: "Europe/Paris"),
        City(name: "Berlin", country: "Germany", timezone: "GMT+1", tzName: "Europe/Berlin"),
        City(name: "Madrid", country: "Spain", timezone: "GMT+1", tzName: "Europe/Madrid"),
        City(name: "Rome", country: "Italy", timezone: "GMT+1", tzName: "Europe/Rome"),
        City(name: "Amsterdam", country: "Netherlands", timezone: "GMT+1", tzName: "Europe/Amsterdam"),
        City(name: "Brussels", country: "Belgium", timezone: "GMT+1", tzName: "Europe/Brussels"),
        City(name: "Vienna", country: "Austria", timezone: "GMT+1", tzName: "Europe/Vienna"),
        City(name: "Stockholm", country: "Sweden", timezone: "GMT+1", tzName: "Europe/Stockholm"),
        City(name: "Oslo", country: "Norway", timezone: "GMT+1", tzName: "Europe/Oslo"),
        City(name: "Copenhagen", country: "Denmark", timezone: "GMT+1", tzName: "Europe/Copenhagen"),
        City(name: "Dublin", country: "Ireland", timezone: "GMT+0", tzName: "Europe/Dublin"),
        City(name: "Lisbon", country: "Portugal", timezone: "GMT+0", tzName: "Europe/Lisbon"),
        
        // Asia
        City(name: "Tokyo", country: "Japan", timezone: "GMT+9", tzName: "Asia/Tokyo"),
        City(name: "Beijing", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai"),
        City(name: "Shanghai", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai"),
        City(name: "Hong Kong", country: "China", timezone: "GMT+8", tzName: "Asia/Hong_Kong"),
        City(name: "Singapore", country: "Singapore", timezone: "GMT+8", tzName: "Asia/Singapore"),
        City(name: "Seoul", country: "South Korea", timezone: "GMT+9", tzName: "Asia/Seoul"),
        City(name: "Bangkok", country: "Thailand", timezone: "GMT+7", tzName: "Asia/Bangkok"),
        City(name: "Jakarta", country: "Indonesia", timezone: "GMT+7", tzName: "Asia/Jakarta"),
        City(name: "Manila", country: "Philippines", timezone: "GMT+8", tzName: "Asia/Manila"),
        City(name: "Kuala Lumpur", country: "Malaysia", timezone: "GMT+8", tzName: "Asia/Kuala_Lumpur"),
        
        // Others
        City(name: "Sydney", country: "Australia", timezone: "GMT+11", tzName: "Australia/Sydney"),
        City(name: "Melbourne", country: "Australia", timezone: "GMT+11", tzName: "Australia/Melbourne"),
        City(name: "Dubai", country: "UAE", timezone: "GMT+4", tzName: "Asia/Dubai"),
        City(name: "Moscow", country: "Russia", timezone: "GMT+3", tzName: "Europe/Moscow"),
        City(name: "São Paulo", country: "Brazil", timezone: "GMT-3", tzName: "America/Sao_Paulo"),
        City(name: "Mexico City", country: "Mexico", timezone: "GMT-6", tzName: "America/Mexico_City"),
        City(name: "Cairo", country: "Egypt", timezone: "GMT+2", tzName: "Africa/Cairo"),
        City(name: "Lagos", country: "Nigeria", timezone: "GMT+1", tzName: "Africa/Lagos"),
        City(name: "Toronto", country: "Canada", timezone: "GMT-5", tzName: "America/Toronto"),
        City(name: "Vancouver", country: "Canada", timezone: "GMT-8", tzName: "America/Vancouver")
    ]
    
    func searchCities(query: String) -> [City] {
        if query.trimmingCharacters(in: .whitespacesAndNewlines).count < 2 {
            return []
        }
        
        let normalizedQuery = query.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        
        let filteredCities = cities.filter { city in
            city.name.lowercased().contains(normalizedQuery) ||
            city.country.lowercased().contains(normalizedQuery)
        }
        
        // Limit results to 10 for better UX
        return Array(filteredCities.prefix(10))
    }
    
    func getTimezoneForCity(cityName: String) -> String? {
        if let city = cities.first(where: { $0.name.lowercased() == cityName.lowercased() }) {
            return city.timezone
        }
        return nil
    }
    
    func parseGmtOffset(gmtTimezone: String) -> Int {
        if !gmtTimezone.hasPrefix("GMT") {
            return 0
        }
        
        let offsetStr = String(gmtTimezone.dropFirst(3)) // Remove "GMT"
        if let offsetHours = Double(offsetStr) {
            return Int(offsetHours * 60) // Convert to minutes
        }
        
        return 0
    }
}