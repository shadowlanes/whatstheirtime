import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { City, searchCities, getFlag } from '../models/CityData';

type CitySearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CitySearch'>;
type CitySearchScreenRouteProp = RouteProp<RootStackParamList, 'CitySearch'>;

interface Props {
  navigation: CitySearchScreenNavigationProp;
  route: CitySearchScreenRouteProp;
}

const CitySearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { onSelect } = route.params;

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(() => {
        const results = searchCities(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
      
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: City) => {
    onSelect(city);
    navigation.goBack();
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleCitySelect(item)}
    >
      <View style={styles.cityInfoContainer}>
        <Text style={styles.flagText}>{getFlag(item.country)}</Text>
        <View style={styles.cityTextContainer}>
          <Text style={styles.cityName}>{item.name}, {item.country}</Text>
          <Text style={styles.timezone}>{item.timezone}</Text>
        </View>
      </View>
      <Text style={styles.selectText}>Select</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a city..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {isSearching ? (
        <ActivityIndicator size="large" color="#f4511e" style={styles.loader} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderCityItem}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length < 2
                  ? 'Enter at least 2 characters to search'
                  : 'No cities found matching your search'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  cityItem: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagText: {
    fontSize: 24,
    marginRight: 12,
  },
  cityTextContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  timezone: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  selectText: {
    color: '#f4511e',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
  },
});

export default CitySearchScreen;