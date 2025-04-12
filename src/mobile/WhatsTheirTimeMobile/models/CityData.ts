export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
  tzName: string;
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
  { id: '1', name: "New York", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
  { id: '2', name: "Los Angeles", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },
  { id: '3', name: "Chicago", country: "USA", timezone: "GMT-6", tzName: "America/Chicago" },
  { id: '4', name: "Washington DC", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
  { id: '5', name: "San Francisco", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },
  { id: '6', name: "Miami", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
  { id: '7', name: "Boston", country: "USA", timezone: "GMT-5", tzName: "America/New_York" },
  { id: '8', name: "Houston", country: "USA", timezone: "GMT-6", tzName: "America/Chicago" },
  { id: '9', name: "Seattle", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },
  { id: '10', name: "Las Vegas", country: "USA", timezone: "GMT-8", tzName: "America/Los_Angeles" },
  
  // India
  { id: '11', name: "New Delhi", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '12', name: "Mumbai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '13', name: "Bangalore", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '14', name: "Chennai", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '15', name: "Kolkata", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '16', name: "Hyderabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '17', name: "Pune", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '18', name: "Ahmedabad", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '19', name: "Jaipur", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  { id: '20', name: "Lucknow", country: "India", timezone: "GMT+5.5", tzName: "Asia/Kolkata" },
  
  // Europe
  { id: '21', name: "London", country: "UK", timezone: "GMT+0", tzName: "Europe/London" },
  { id: '22', name: "Paris", country: "France", timezone: "GMT+1", tzName: "Europe/Paris" },
  { id: '23', name: "Berlin", country: "Germany", timezone: "GMT+1", tzName: "Europe/Berlin" },
  { id: '24', name: "Madrid", country: "Spain", timezone: "GMT+1", tzName: "Europe/Madrid" },
  { id: '25', name: "Rome", country: "Italy", timezone: "GMT+1", tzName: "Europe/Rome" },
  { id: '26', name: "Amsterdam", country: "Netherlands", timezone: "GMT+1", tzName: "Europe/Amsterdam" },
  { id: '27', name: "Brussels", country: "Belgium", timezone: "GMT+1", tzName: "Europe/Brussels" },
  { id: '28', name: "Vienna", country: "Austria", timezone: "GMT+1", tzName: "Europe/Vienna" },
  { id: '29', name: "Stockholm", country: "Sweden", timezone: "GMT+1", tzName: "Europe/Stockholm" },
  { id: '30', name: "Oslo", country: "Norway", timezone: "GMT+1", tzName: "Europe/Oslo" },
  { id: '31', name: "Copenhagen", country: "Denmark", timezone: "GMT+1", tzName: "Europe/Copenhagen" },
  { id: '32', name: "Dublin", country: "Ireland", timezone: "GMT+0", tzName: "Europe/Dublin" },
  { id: '33', name: "Lisbon", country: "Portugal", timezone: "GMT+0", tzName: "Europe/Lisbon" },
  
  // Asia
  { id: '34', name: "Tokyo", country: "Japan", timezone: "GMT+9", tzName: "Asia/Tokyo" },
  { id: '35', name: "Beijing", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai" },
  { id: '36', name: "Shanghai", country: "China", timezone: "GMT+8", tzName: "Asia/Shanghai" },
  { id: '37', name: "Hong Kong", country: "China", timezone: "GMT+8", tzName: "Asia/Hong_Kong" },
  { id: '38', name: "Singapore", country: "Singapore", timezone: "GMT+8", tzName: "Asia/Singapore" },
  { id: '39', name: "Seoul", country: "South Korea", timezone: "GMT+9", tzName: "Asia/Seoul" },
  { id: '40', name: "Bangkok", country: "Thailand", timezone: "GMT+7", tzName: "Asia/Bangkok" },
  { id: '41', name: "Jakarta", country: "Indonesia", timezone: "GMT+7", tzName: "Asia/Jakarta" },
  { id: '42', name: "Manila", country: "Philippines", timezone: "GMT+8", tzName: "Asia/Manila" },
  { id: '43', name: "Kuala Lumpur", country: "Malaysia", timezone: "GMT+8", tzName: "Asia/Kuala_Lumpur" },
  
  // Others
  { id: '44', name: "Sydney", country: "Australia", timezone: "GMT+11", tzName: "Australia/Sydney" },
  { id: '45', name: "Melbourne", country: "Australia", timezone: "GMT+11", tzName: "Australia/Melbourne" },
  { id: '46', name: "Dubai", country: "UAE", timezone: "GMT+4", tzName: "Asia/Dubai" },
  { id: '47', name: "Moscow", country: "Russia", timezone: "GMT+3", tzName: "Europe/Moscow" },
  { id: '48', name: "São Paulo", country: "Brazil", timezone: "GMT-3", tzName: "America/Sao_Paulo" },
  { id: '49', name: "Mexico City", country: "Mexico", timezone: "GMT-6", tzName: "America/Mexico_City" },
  { id: '50', name: "Cairo", country: "Egypt", timezone: "GMT+2", tzName: "Africa/Cairo" },
  { id: '51', name: "Lagos", country: "Nigeria", timezone: "GMT+1", tzName: "Africa/Lagos" },
  { id: '52', name: "Toronto", country: "Canada", timezone: "GMT-5", tzName: "America/Toronto" },
  { id: '53', name: "Vancouver", country: "Canada", timezone: "GMT-8", tzName: "America/Vancouver" }
];

// Function to search cities based on a query
export const searchCities = (query: string): City[] => {
  if (query.trim().length < 2) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.country.toLowerCase().includes(normalizedQuery)
  );
  
  // Limit results to 10 for better UX
  return filteredCities.slice(0, 10);
};