export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
  tzName: string;
  alternateNames: string[];
}

export const getFlag = (countryName: string): string => {
  const countryCode = getCountryCode(countryName);
  
  // Convert country code to regional indicator symbols (flag emoji)
  const base = 127397;
  let emoji = '';
  for (const char of countryCode) {
    emoji += String.fromCodePoint(base + char.charCodeAt(0));
  }
  
  return emoji;
};

const getCountryCode = (countryName: string): string => {
  const countryMap: Record<string, string> = {
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
  
  return countryMap[countryName] || "UN";
};

// Cities data with GMT offset format timezones
export const cities: City[] = [
  // United States
  { id: '1', name: "New York", country: "USA", timezone: "GMT-5", tzName: "America/New_York", alternateNames: ["NYC", "Big Apple"] },
  { id: '2', name: "Los Angeles", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles", alternateNames: ["LA", "City of Angels"] },
  { id: '3', name: "Chicago", country: "USA", timezone: "GMT-6", tzName: "America/Chicago", alternateNames: ["Windy City"] },
  { id: '4', name: "Washington DC", country: "USA", timezone: "GMT-5", tzName: "America/New_York", alternateNames: ["DC", "Washington"] },
  { id: '5', name: "San Francisco", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles", alternateNames: ["SF", "San Fran"] },
  { id: '6', name: "Miami", country: "USA", timezone: "GMT-5", tzName: "America/New_York", alternateNames: [] },
  { id: '7', name: "Boston", country: "USA", timezone: "GMT-5", tzName: "America/New_York", alternateNames: [] },
  { id: '8', name: "Houston", country: "USA", timezone: "GMT-6", tzName: "America/Chicago", alternateNames: [] },
  { id: '9', name: "Seattle", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles", alternateNames: [] },
  { id: '10', name: "Las Vegas", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles", alternateNames: ["Vegas"] },
  
  // India
  { id: '11', name: "New Delhi", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: ["Delhi"] },
  { id: '12', name: "Mumbai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: ["Bombay"] },
  { id: '13', name: "Bangalore", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: ["Bengaluru"] },
  { id: '14', name: "Chennai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: ["Madras"] },
  { id: '15', name: "Kolkata", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: ["Calcutta"] },
  { id: '16', name: "Hyderabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: [] },
  { id: '17', name: "Pune", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: ["Poona"] },
  { id: '18', name: "Ahmedabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: [] },
  { id: '19', name: "Jaipur", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: ["Pink City"] },
  { id: '20', name: "Lucknow", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata", alternateNames: [] },
  
  // Europe
  { id: '21', name: "London", country: "UK", timezone: "GMT+0", tzName: "Europe/London", alternateNames: [] },
  { id: '22', name: "Paris", country: "France", timezone: "GMT+1", tzName: "Europe/Paris", alternateNames: [] },
  { id: '23', name: "Berlin", country: "Germany", timezone: "GMT+1", tzName: "Europe/Berlin", alternateNames: [] },
  { id: '24', name: "Madrid", country: "Spain", timezone: "GMT+1", tzName: "Europe/Madrid", alternateNames: [] },
  { id: '25', name: "Rome", country: "Italy", timezone: "GMT+1", tzName: "Europe/Rome", alternateNames: ["Roma"] },
  { id: '26', name: "Amsterdam", country: "Netherlands", timezone: "GMT+1", tzName: "Europe/Amsterdam", alternateNames: [] },
  { id: '27', name: "Brussels", country: "Belgium", timezone: "GMT+1", tzName: "Europe/Brussels", alternateNames: ["Bruxelles", "Brussel"] },
  { id: '28', name: "Vienna", country: "Austria", timezone: "GMT+1", tzName: "Europe/Vienna", alternateNames: ["Wien"] },
  { id: '29', name: "Stockholm", country: "Sweden", timezone: "GMT+1", tzName: "Europe/Stockholm", alternateNames: [] },
  { id: '30', name: "Oslo", country: "Norway", timezone: "GMT+1", tzName: "Europe/Oslo", alternateNames: [] },
  { id: '31', name: "Copenhagen", country: "Denmark", timezone: "GMT+1", tzName: "Europe/Copenhagen", alternateNames: ["København"] },
  { id: '32', name: "Dublin", country: "Ireland", timezone: "GMT+0", tzName: "Europe/Dublin", alternateNames: [] },
  { id: '33', name: "Lisbon", country: "Portugal", timezone: "GMT+0", tzName: "Europe/Lisbon", alternateNames: ["Lisboa"] },
  
  // Asia
  { id: '34', name: "Tokyo", country: "Japan", timezone: "GMT+9", tzName: "Asia/Tokyo", alternateNames: [] },
  { id: '35', name: "Beijing", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai", alternateNames: ["Peking"] },
  { id: '36', name: "Shanghai", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai", alternateNames: [] },
  { id: '37', name: "Hong Kong", country: "China", timezone: "GMT+8", tzName: "Asia/Hong_Kong", alternateNames: ["HK"] },
  { id: '38', name: "Singapore", country: "Singapore", timezone: "GMT+8", tzName: "Asia/Singapore", alternateNames: [] },
  { id: '39', name: "Seoul", country: "South Korea", timezone: "GMT+9", tzName: "Asia/Seoul", alternateNames: [] },
  { id: '40', name: "Bangkok", country: "Thailand", timezone: "GMT+7", tzName: "Asia/Bangkok", alternateNames: [] },
  { id: '41', name: "Jakarta", country: "Indonesia", timezone: "GMT+7", tzName: "Asia/Jakarta", alternateNames: [] },
  { id: '42', name: "Manila", country: "Philippines", timezone: "GMT+8", tzName: "Asia/Manila", alternateNames: [] },
  { id: '43', name: "Kuala Lumpur", country: "Malaysia", timezone: "GMT+8", tzName: "Asia/Kuala_Lumpur", alternateNames: ["KL"] },
  
  // Others
  { id: '44', name: "Sydney", country: "Australia", timezone: "GMT+11", tzName: "Australia/Sydney", alternateNames: [] },
  { id: '45', name: "Melbourne", country: "Australia", timezone: "GMT+11", tzName: "Australia/Melbourne", alternateNames: [] },
  { id: '46', name: "Dubai", country: "UAE", timezone: "GMT+4", tzName: "Asia/Dubai", alternateNames: [] },
  { id: '47', name: "Moscow", country: "Russia", timezone: "GMT+3", tzName: "Europe/Moscow", alternateNames: ["Москва"] },
  { id: '48', name: "São Paulo", country: "Brazil", timezone: "GMT-3", tzName: "America/Sao_Paulo", alternateNames: ["Sao Paulo"] },
  { id: '49', name: "Mexico City", country: "Mexico", timezone: "GMT-6", tzName: "America/Mexico_City", alternateNames: ["Ciudad de México"] },
  { id: '50', name: "Cairo", country: "Egypt", timezone: "GMT+2", tzName: "Africa/Cairo", alternateNames: ["القاهرة"] },
  { id: '51', name: "Lagos", country: "Nigeria", timezone: "GMT+1", tzName: "Africa/Lagos", alternateNames: [] },
  { id: '52', name: "Toronto", country: "Canada", timezone: "GMT-5", tzName: "America/Toronto", alternateNames: [] },
  { id: '53', name: "Vancouver", country: "Canada", timezone: "GMT-8", tzName: "America/Vancouver", alternateNames: [] }
];

// Function to search cities based on a query
export const searchCities = (query: string): City[] => {
  if (query.trim().length < 2) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.country.toLowerCase().includes(normalizedQuery) ||
    city.alternateNames.some(altName => 
      altName.toLowerCase().includes(normalizedQuery)
    )
  );
  
  // Limit results to 10 for better UX
  return filteredCities.slice(0, 10);
};