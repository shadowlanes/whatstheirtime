import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Modal
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../App';
import FriendManager, { Friend } from '../models/Friend';
import { getFormattedTimeDifference, getDayDifference } from '../utils/TimeManager';
import { TimeOfDay, timeOfDayColors, getTimeOfDay, getHourInTimezone } from '../utils/TimeOfDayUtil';
import { getFlag, searchCities, City } from '../models/CityData';

type FriendListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FriendList'>;

interface Props {
  navigation: FriendListScreenNavigationProp;
}

const FriendListScreen: React.FC<Props> = ({ navigation }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [addingStep, setAddingStep] = useState<'name' | 'location'>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const nameInputRef = useRef<TextInput>(null);
  const searchInputRef = useRef<TextInput>(null);
  const friendManager = FriendManager.getInstance();
  const screenWidth = Dimensions.get('window').width;

  // Load friends when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFriends();
      
      // Set up interval to update time every minute
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const loadFriends = async () => {
    await friendManager.loadFriends();
    setFriends(friendManager.getFriends());
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFriends();
  };

  const openAddModal = () => {
    // Reset all state for the add flow
    setAddModalVisible(true);
    setAddingStep('name');
    setNewFriendName('');
    setSelectedCity(null);
    setSearchQuery('');
    setSearchResults([]);
    
    // Wait for modal to appear before focusing input
    setTimeout(() => nameInputRef.current?.focus(), 300);
  };

  const closeAddModal = () => {
    // Dismiss keyboard first to avoid any re-render issues
    Keyboard.dismiss();
    
    setAddModalVisible(false);
    
    // Reset all fields after the modal is fully closed
    setTimeout(() => {
      setNewFriendName('');
      setSelectedCity(null);
      setSearchQuery('');
      setSearchResults([]);
      setAddingStep('name');
    }, 300);
  };

  const proceedToLocationStep = () => {
    if (newFriendName.trim() === '') {
      Alert.alert('Missing Name', 'Please enter a name for your friend');
      return;
    }
    setAddingStep('location');
    // Wait for the step transition then focus the search input
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const returnToNameStep = () => {
    setAddingStep('name');
    setSearchQuery('');
    setSearchResults([]);
    // Wait for the step transition then focus the name input
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  // Handle city search
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
    setSelectedCity(city);
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const saveFriend = async () => {
    if (newFriendName.trim() === '' || !selectedCity) {
      return;
    }

    await friendManager.addFriend(newFriendName.trim(), selectedCity);
    loadFriends();
    closeAddModal();
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const timeDifference = getFormattedTimeDifference(item.city);
    const dayDifference = getDayDifference(item.city);
    
    let dayText = '';
    if (dayDifference === 1) {
      dayText = ' (tomorrow)';
    } else if (dayDifference === -1) {
      dayText = ' (yesterday)';
    }

    // Get time of day for this friend's timezone
    const hour = getHourInTimezone(item.city);
    const timeOfDay = getTimeOfDay(hour);
    const gradientColors = timeOfDayColors[timeOfDay];

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('FriendDetail', { friendId: item.id })}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.friendItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.name}</Text>
            <Text style={styles.friendLocation}>
              {friendManager.getFormattedLocation(item)}
            </Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.time}>{friendManager.getTime(item)}</Text>
            <Text style={styles.timeDifference}>{timeDifference}{dayText}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Grid layout for the friend list
  const renderFriendGrid = ({ item, index }: { item: Friend, index: number }) => {
    const timeDifference = getFormattedTimeDifference(item.city);
    const dayDifference = getDayDifference(item.city);
    
    let dayText = '';
    if (dayDifference === 1) {
      dayText = ' (tomorrow)';
    } else if (dayDifference === -1) {
      dayText = ' (yesterday)';
    }

    // Get time of day for this friend's timezone
    const hour = getHourInTimezone(item.city);
    const timeOfDay = getTimeOfDay(hour);
    const gradientColors = timeOfDayColors[timeOfDay];

    // Calculate if this is a left or right item for the 2-column grid
    const isLeftItem = index % 2 === 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('FriendDetail', { friendId: item.id })}
        style={[
          styles.gridItem,
          isLeftItem ? { marginRight: 5 } : { marginLeft: 5 }
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gridItemGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.timeIconContainer}>
            <Text style={styles.timeIcon}>
              {timeOfDay === 'night' ? '🌙' : 
               timeOfDay === 'dawn' ? '🌅' :
               timeOfDay === 'day' ? '☀️' : '🌇'}
            </Text>
          </View>
          <Text style={styles.gridItemTime}>{friendManager.getTime(item)}</Text>
          <Text style={styles.gridItemName}>{item.name}</Text>
          <Text style={styles.gridItemLocation}>{item.city.name}</Text>
          <Text style={styles.gridItemDiff}>{timeDifference}{dayText}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render city search results
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

  // Welcome Widget for empty state
  const WelcomeWidget = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>Welcome to What's Their Time</Text>
      <Text style={styles.welcomeDescription}>
        Keep track of your friends, family and colleagues across different time zones.
        Never schedule a meeting at 3 AM with someone again!
      </Text>
      <TouchableOpacity 
        style={styles.welcomeButton}
        onPress={openAddModal}
      >
        <Text style={styles.welcomeButtonText}>Add Friend Now</Text>
      </TouchableOpacity>
      <Text style={styles.welcomeTip}>
        Tip: You can add as many contacts as you need and quickly check their local time.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What's Their Time</Text>
        <View style={styles.currentTimeContainer}>
          <Text style={styles.currentTimeLabel}>Your Time:</Text>
          <Text style={styles.currentTime}>
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
          <Text style={styles.currentTimezone}>
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </Text>
        </View>
      </View>
      
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendGrid}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<WelcomeWidget />}
      />
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeAddModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {addingStep === 'name' ? 'Add a Friend' : `Choose Location for ${newFriendName}`}
            </Text>
            <TouchableOpacity onPress={closeAddModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {addingStep === 'name' ? (
            // Name input step
            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Friend's Name</Text>
                <TextInput
                  ref={nameInputRef}
                  style={styles.textInput}
                  placeholder="Enter name"
                  placeholderTextColor="#777"
                  value={newFriendName}
                  onChangeText={setNewFriendName}
                  returnKeyType="next"
                  onSubmitEditing={proceedToLocationStep}
                  autoFocus={true}
                  blurOnSubmit={false}
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.nextButton, 
                  !newFriendName.trim() ? styles.buttonDisabled : {}
                ]}
                onPress={proceedToLocationStep}
                disabled={!newFriendName.trim()}
              >
                <Text style={styles.buttonText}>Continue to Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Location search step
            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Where is {newFriendName} located?</Text>
                
                {selectedCity ? (
                  // Display selected city
                  <View style={styles.selectedCityContainer}>
                    <View style={styles.selectedCityContent}>
                      <Text style={styles.flagText}>{getFlag(selectedCity.country)}</Text>
                      <View>
                        <Text style={styles.selectedCityName}>{selectedCity.name}, {selectedCity.country}</Text>
                        <Text style={styles.selectedCityTimezone}>{selectedCity.timezone}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedCity(null);
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }} 
                      style={styles.changeCityButton}
                    >
                      <Text style={styles.changeCityText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // City search interface
                  <View>
                    <TextInput
                      ref={searchInputRef}
                      style={styles.searchInput}
                      placeholder="Search for a city..."
                      placeholderTextColor="#777"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      returnKeyType="search"
                      autoFocus={true}
                    />
                    
                    {isSearching ? (
                      <ActivityIndicator size="large" color="#f4511e" style={styles.loader} />
                    ) : searchResults.length > 0 ? (
                      <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCityItem}
                        style={styles.searchResultsList}
                        nestedScrollEnabled={true}
                      />
                    ) : searchQuery.length >= 2 ? (
                      <Text style={styles.emptyResultsText}>No cities found matching your search</Text>
                    ) : searchQuery.length > 0 ? (
                      <Text style={styles.emptyResultsText}>Enter at least 2 characters to search</Text>
                    ) : null}
                  </View>
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={returnToNameStep}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                {selectedCity ? (
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={saveFriend}
                  >
                    <Text style={styles.buttonText}>Add Friend</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.saveButton, styles.buttonDisabled]}
                    disabled={true}
                  >
                    <Text style={styles.buttonText}>Add Friend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme background
  },
  header: {
    backgroundColor: '#1e1e1e',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentTimeContainer: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  currentTimeLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  currentTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  currentTimezone: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 8,
  },
  gridContainer: {
    padding: 10,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%', // Two columns
    aspectRatio: 0.8, // Card aspect ratio
    marginBottom: 10,
  },
  gridItemGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  timeIconContainer: {
    alignItems: 'flex-end',
  },
  timeIcon: {
    fontSize: 24,
  },
  gridItemTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gridItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 'auto',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gridItemLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  gridItemDiff: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#f4511e',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 99,
  },
  addPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 100,
    maxHeight: '80%',
  },
  addPanelContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  addPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#ccc',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#2a2a2a',
  },
  locationSelector: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: '#2a2a2a',
  },
  locationText: {
    fontSize: 16,
    color: '#fff',
  },
  locationPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  nextButton: {
    backgroundColor: '#f4511e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#f4511e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 2,
    marginLeft: 10,
  },
  backButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#444',
  },
  // Keep existing welcome widget styles
  welcomeContainer: {
    backgroundColor: '#1e1e1e',
    margin: 16,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  welcomeButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
  },
  welcomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeTip: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // New styles for the full-screen modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  modalHeader: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#2a2a2a',
    marginBottom: 10,
  },
  searchResultsList: {
    maxHeight: 300,
    marginBottom: 10,
  },
  cityItem: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    marginVertical: 5,
    borderRadius: 12,
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
    marginVertical: 20,
  },
  emptyResultsText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
    marginTop: 15,
  },
  selectedCityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedCityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedCityTimezone: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  changeCityButton: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeCityText: {
    color: '#fff',
    fontSize: 14,
  }
});

export default FriendListScreen;