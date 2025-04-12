import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  TextInput,
  ScrollView 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import FriendManager from '../models/Friend';
import { getLocalDay, getFormattedTimeDifference, getDayDifference } from '../utils/TimeManager';

type FriendDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FriendDetail'>;
type FriendDetailScreenRouteProp = RouteProp<RootStackParamList, 'FriendDetail'>;

interface Props {
  navigation: FriendDetailScreenNavigationProp;
  route: FriendDetailScreenRouteProp;
}

const FriendDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { friendId } = route.params;
  const [friend, setFriend] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const friendManager = FriendManager.getInstance();

  useEffect(() => {
    loadFriend();
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [friendId]);

  const loadFriend = async () => {
    await friendManager.loadFriends();
    const loadedFriend = friendManager.getFriend(friendId);
    setFriend(loadedFriend);
    
    if (loadedFriend) {
      navigation.setOptions({ title: loadedFriend.name });
    }
  };

  const deleteFriend = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${friend?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await friendManager.deleteFriend(friendId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const editFriend = () => {
    Alert.prompt(
      'Edit Contact',
      'Enter name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Change Location',
          onPress: (name) => {
            if (name && name.trim()) {
              navigation.navigate('CitySearch', {
                onSelect: async (city) => {
                  await friendManager.updateFriend(
                    friendId,
                    name.trim(),
                    city,
                    friend?.notes || ''
                  );
                  loadFriend();
                },
                friendId: friendId,
                friendName: name.trim(),
                friendNotes: friend?.notes || '',
              });
            }
          },
        },
        {
          text: 'Save',
          onPress: async (name) => {
            if (name && name.trim()) {
              await friendManager.updateFriend(
                friendId,
                name.trim(),
                friend.city,
                friend?.notes || ''
              );
              loadFriend();
            }
          },
        },
      ],
      'plain-text',
      friend?.name
    );
  };

  const editNotes = () => {
    Alert.prompt(
      'Edit Notes',
      'Enter notes about this contact:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: async (notes) => {
            await friendManager.updateFriend(
              friendId,
              friend.name,
              friend.city,
              notes || ''
            );
            loadFriend();
          },
        },
      ],
      'plain-text',
      friend?.notes
    );
  };

  if (!friend) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const timeDifference = getFormattedTimeDifference(friend.city.timezone);
  const dayDifference = getDayDifference(friend.city.timezone);
  const dayName = getLocalDay(friend.city.timezone);
  
  let dayText = '';
  if (dayDifference === 1) {
    dayText = 'tomorrow';
  } else if (dayDifference === -1) {
    dayText = 'yesterday';
  } else {
    dayText = 'today';
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name}>{friend.name}</Text>
          <Text style={styles.location}>{friendManager.getFormattedLocation(friend)}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{friendManager.getTime(friend)}</Text>
          <Text style={styles.day}>{dayName} ({dayText})</Text>
          <Text style={styles.timeDifference}>{timeDifference}</Text>
        </View>
        
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <TouchableOpacity onPress={editNotes}>
            <Text style={styles.notes}>
              {friend.notes ? friend.notes : 'Tap to add notes...'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={editFriend}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteFriend}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  day: {
    fontSize: 20,
    marginTop: 10,
  },
  timeDifference: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  notesContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notes: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FriendDetailScreen;