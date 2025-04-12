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
  Keyboard
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../App';
import FriendManager, { Friend } from '../models/Friend';
import { getFormattedTimeDifference, getDayDifference } from '../utils/TimeManager';
import { TimeOfDay, timeOfDayColors, getTimeOfDay, getHourInTimezone } from '../utils/TimeOfDayUtil';
import { getFlag } from '../models/CityData';

type FriendListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FriendList'>;

interface Props {
  navigation: FriendListScreenNavigationProp;
}

const FriendListScreen: React.FC<Props> = ({ navigation }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [addPanelVisible, setAddPanelVisible] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [addingStep, setAddingStep] = useState<'name' | 'location'>('name');
  const slideAnim = useState(new Animated.Value(-600))[0];
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const nameInputRef = useRef<TextInput>(null);
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

  const toggleAddPanel = () => {
    if (!addPanelVisible) {
      // Open the panel
      setAddPanelVisible(true);
      setAddingStep('name');
      setNewFriendName('');
      setSelectedCity(null);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: false,
          friction: 8,
          tension: 65,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Focus the name input after animation completes
      setTimeout(() => nameInputRef.current?.focus(), 300);
    } else {
      // Close the panel
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -600,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setAddPanelVisible(false);
        setNewFriendName('');
        setSelectedCity(null);
        setAddingStep('name');
      });
    }
  };

  const proceedToLocationStep = () => {
    if (newFriendName.trim() === '') {
      Alert.alert('Missing Name', 'Please enter a name for your friend');
      return;
    }
    setAddingStep('location');
  };

  const returnToNameStep = () => {
    setAddingStep('name');
  };

  const openCitySearch = () => {
    navigation.navigate('CitySearch', {
      onSelect: (city) => {
        setSelectedCity(city);
        // When we have both name and city, we're ready to save
        if (newFriendName.trim()) {
          saveFriend(newFriendName.trim(), city);
        }
      },
    });
  };

  const saveFriend = async (name = newFriendName.trim(), city = selectedCity) => {
    if (name === '' || !city) {
      return;
    }

    await friendManager.addFriend(name, city);
    loadFriends();
    toggleAddPanel(); 
  };

  const addNewFriend = () => {
    toggleAddPanel();
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

  // New grid layout for the friend list
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

  // Add Friend Widget Panel
  const AddFriendPanel = useCallback(() => (
    <>
      <TouchableWithoutFeedback onPress={toggleAddPanel}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>
      
      <Animated.View style={[styles.addPanel, { transform: [{ translateY: slideAnim }] }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.addPanelContent}
        >
          <View style={styles.addPanelHeader}>
            <Text style={styles.addPanelTitle}>
              {addingStep === 'name' ? 'Add a Friend' : `Choose Location for ${newFriendName}`}
            </Text>
            <TouchableOpacity onPress={toggleAddPanel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {addingStep === 'name' ? (
            <>
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
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Where is {newFriendName} located?</Text>
                {selectedCity ? (
                  <View style={styles.selectedCityContainer}>
                    <View style={styles.selectedCityContent}>
                      <Text style={styles.flagText}>{getFlag(selectedCity.country)}</Text>
                      <View>
                        <Text style={styles.selectedCityName}>{selectedCity.name}, {selectedCity.country}</Text>
                        <Text style={styles.selectedCityTimezone}>{selectedCity.timezone}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={openCitySearch} style={styles.changeCityButton}>
                      <Text style={styles.changeCityText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.locationSelector}
                    onPress={openCitySearch}
                  >
                    <Text style={styles.locationPlaceholder}>
                      Tap to select a city
                    </Text>
                  </TouchableOpacity>
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
                    onPress={() => saveFriend()}
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
            </>
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  ), [addingStep, newFriendName, selectedCity, opacityAnim, slideAnim]);

  const WelcomeWidget = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>Welcome to What's Their Time</Text>
      <Text style={styles.welcomeDescription}>
        Keep track of your friends, family and colleagues across different time zones.
        Never schedule a meeting at 3 AM with someone again!
      </Text>
      <TouchableOpacity 
        style={styles.welcomeButton}
        onPress={addNewFriend}
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
      
      {addPanelVisible && <AddFriendPanel />}
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={toggleAddPanel}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
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
});

export default FriendListScreen;