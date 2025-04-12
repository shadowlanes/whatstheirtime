import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  RefreshControl,
  Image 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../App';
import FriendManager, { Friend } from '../models/Friend';
import { getFormattedTimeDifference, getDayDifference } from '../utils/TimeManager';
import { TimeOfDay, timeOfDayColors, getTimeOfDay, getHourInTimezone } from '../utils/TimeOfDayUtil';

type FriendListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FriendList'>;

interface Props {
  navigation: FriendListScreenNavigationProp;
}

const FriendListScreen: React.FC<Props> = ({ navigation }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const friendManager = FriendManager.getInstance();

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

  const addNewFriend = () => {
    navigation.navigate('CitySearch', {
      onSelect: (city) => {
        // Show name input dialog
        Alert.prompt(
          'Add Friend',
          'Enter your friend\'s name',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Save',
              onPress: async (name) => {
                if (name && name.trim()) {
                  await friendManager.addFriend(name.trim(), city);
                  loadFriends();
                }
              },
            },
          ],
          'plain-text'
        );
      },
    });
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const timeDifference = getFormattedTimeDifference(item.city.timezone);
    const dayDifference = getDayDifference(item.city.timezone);
    
    let dayText = '';
    if (dayDifference === 1) {
      dayText = ' (tomorrow)';
    } else if (dayDifference === -1) {
      dayText = ' (yesterday)';
    }

    // Get time of day for this friend's timezone
    const hour = getHourInTimezone(item.city.timezone);
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

  const WelcomeWidget = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>Welcome to What's Their Time</Text>
      <Text style={styles.welcomeDescription}>
        Keep track of your friends, family, and colleagues across different time zones.
        Never schedule a meeting at 3 AM for someone again!
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
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<WelcomeWidget />}
      />
      <TouchableOpacity style={styles.addButton} onPress={addNewFriend}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  friendItem: {
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  friendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  friendLocation: {
    fontSize: 14, 
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  timeInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeDifference: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  welcomeContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#444',
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
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
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
});

export default FriendListScreen;