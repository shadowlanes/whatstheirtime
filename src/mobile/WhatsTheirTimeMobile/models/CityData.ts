export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string; // Now uses IANA timezone format
  alternateNames: string[];
}

// Cities data with IANA timezone format
export const cities: City[] = [
  // United States
  { id: '1', name: "New York", country: "USA", timezone: "America/New_York", alternateNames: ["NYC", "Big Apple"] },
  { id: '2', name: "Los Angeles", country: "USA", timezone: "America/Los_Angeles", alternateNames: ["LA", "City of Angels"] },
  { id: '3', name: "Chicago", country: "USA", timezone: "America/Chicago", alternateNames: ["Windy City"] },
  { id: '4', name: "Washington DC", country: "USA", timezone: "America/New_York", alternateNames: ["DC", "Washington"] },
  { id: '5', name: "San Francisco", country: "USA", timezone: "America/Los_Angeles", alternateNames: ["SF", "San Fran"] },
  { id: '6', name: "Miami", country: "USA", timezone: "America/New_York", alternateNames: [] },
  { id: '7', name: "Boston", country: "USA", timezone: "America/New_York", alternateNames: [] },
  { id: '8', name: "Houston", country: "USA", timezone: "America/Chicago", alternateNames: [] },
  { id: '9', name: "Seattle", country: "USA", timezone: "America/Los_Angeles", alternateNames: [] },
  { id: '10', name: "Las Vegas", country: "USA", timezone: "America/Los_Angeles", alternateNames: ["Vegas"] },
  
  // India
  { id: '11', name: "New Delhi", country: "India", timezone: "Asia/Kolkata", alternateNames: ["Delhi"] },
  { id: '12', name: "Mumbai", country: "India", timezone: "Asia/Kolkata", alternateNames: ["Bombay"] },
  { id: '13', name: "Bangalore", country: "India", timezone: "Asia/Kolkata", alternateNames: ["Bengaluru"] },
  { id: '14', name: "Chennai", country: "India", timezone: "Asia/Kolkata", alternateNames: ["Madras"] },
  { id: '15', name: "Kolkata", country: "India", timezone: "Asia/Kolkata", alternateNames: ["Calcutta"] },
  { id: '16', name: "Hyderabad", country: "India", timezone: "Asia/Kolkata", alternateNames: [] },
  { id: '17', name: "Pune", country: "India", timezone: "Asia/Kolkata", alternateNames: ["Poona"] },
  { id: '18', name: "Ahmedabad", country: "India", timezone: "Asia/Kolkata", alternateNames: [] },
  { id: '19', name: "Jaipur", country: "India", timezone: "Asia/Kolkata", alternateNames: ["Pink City"] },
  { id: '20', name: "Lucknow", country: "India", timezone: "Asia/Kolkata", alternateNames: [] },
  
  // Europe
  { id: '21', name: "London", country: "UK", timezone: "Europe/London", alternateNames: [] },
  { id: '22', name: "Paris", country: "France", timezone: "Europe/Paris", alternateNames: [] },
  { id: '23', name: "Berlin", country: "Germany", timezone: "Europe/Berlin", alternateNames: [] },
  { id: '24', name: "Madrid", country: "Spain", timezone: "Europe/Madrid", alternateNames: [] },
  { id: '25', name: "Rome", country: "Italy", timezone: "Europe/Rome", alternateNames: ["Roma"] },
  { id: '26', name: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam", alternateNames: [] },
  { id: '27', name: "Brussels", country: "Belgium", timezone: "Europe/Brussels", alternateNames: ["Bruxelles", "Brussel"] },
  { id: '28', name: "Vienna", country: "Austria", timezone: "Europe/Vienna", alternateNames: ["Wien"] },
  { id: '29', name: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", alternateNames: [] },
  { id: '30', name: "Oslo", country: "Norway", timezone: "Europe/Oslo", alternateNames: [] },
  { id: '31', name: "Copenhagen", country: "Denmark", timezone: "Europe/Copenhagen", alternateNames: ["København"] },
  { id: '32', name: "Dublin", country: "Ireland", timezone: "Europe/Dublin", alternateNames: [] },
  { id: '33', name: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon", alternateNames: ["Lisboa"] },
  
  // Asia
  { id: '34', name: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", alternateNames: [] },
  { id: '35', name: "Beijing", country: "China", timezone: "Asia/Shanghai", alternateNames: ["Peking"] },
  { id: '36', name: "Shanghai", country: "China", timezone: "Asia/Shanghai", alternateNames: [] },
  { id: '37', name: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong", alternateNames: ["HK"] },
  { id: '38', name: "Singapore", country: "Singapore", timezone: "Asia/Singapore", alternateNames: [] },
  { id: '39', name: "Seoul", country: "South Korea", timezone: "Asia/Seoul", alternateNames: [] },
  { id: '40', name: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", alternateNames: [] },
  { id: '41', name: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", alternateNames: [] },
  { id: '42', name: "Manila", country: "Philippines", timezone: "Asia/Manila", alternateNames: [] },
  { id: '43', name: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", alternateNames: ["KL"] },
  
  // Others
  { id: '44', name: "Sydney", country: "Australia", timezone: "Australia/Sydney", alternateNames: [] },
  { id: '45', name: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", alternateNames: [] },
  { id: '46', name: "Dubai", country: "UAE", timezone: "Asia/Dubai", alternateNames: [] },
  { id: '47', name: "Moscow", country: "Russia", timezone: "Europe/Moscow", alternateNames: ["Москва"] },
  { id: '48', name: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", alternateNames: ["Sao Paulo"] },
  { id: '49', name: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", alternateNames: ["Ciudad de México"] },
  { id: '50', name: "Cairo", country: "Egypt", timezone: "Africa/Cairo", alternateNames: ["القاهرة"] },
  { id: '51', name: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", alternateNames: [] },
  { id: '52', name: "Toronto", country: "Canada", timezone: "America/Toronto", alternateNames: [] },
  { id: '53', name: "Vancouver", country: "Canada", timezone: "America/Vancouver", alternateNames: [] }
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

// Function to get country code for flag emoji
const getCountryCodeForFlag = (countryName: string): string => {
  const countryMap: { [key: string]: string } = {
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
};

// Function to get flag emoji from country name
export const getFlag = (countryName: string): string => {
  const countryCode = getCountryCodeForFlag(countryName);
  
  // Convert country code to regional indicator symbols
  // Each letter is represented by a Regional Indicator Symbol, which is
  // 127397 code points after its ASCII position
  const codePoints = [...countryCode].map(char => 
    127397 + char.charCodeAt(0)
  );
  
  return String.fromCodePoint(...codePoints);
};