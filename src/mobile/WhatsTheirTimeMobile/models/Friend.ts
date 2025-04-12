import AsyncStorage from '@react-native-async-storage/async-storage';
import { City, getFlag } from '../models/CityData';
import { getLocalTime } from '../utils/TimeManager';

export interface Friend {
  id: string;
  name: string;
  city: City;
  notes: string;
}

class FriendManager {
  private friends: Friend[] = [];
  private readonly storageKey = 'whatstheirtime_friends';
  private static instance: FriendManager;

  private constructor() {
    this.loadFriends();
  }

  public static getInstance(): FriendManager {
    if (!FriendManager.instance) {
      FriendManager.instance = new FriendManager();
    }
    return FriendManager.instance;
  }

  public async loadFriends(): Promise<void> {
    try {
      const storedFriends = await AsyncStorage.getItem(this.storageKey);
      if (storedFriends) {
        this.friends = JSON.parse(storedFriends);
      }
    } catch (error) {
      console.error('Error loading friends from storage:', error);
    }
  }

  private async saveFriends(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.friends));
    } catch (error) {
      console.error('Error saving friends to storage:', error);
    }
  }

  public getFriends(): Friend[] {
    return [...this.friends];
  }

  public getFriend(id: string): Friend | undefined {
    return this.friends.find(friend => friend.id === id);
  }

  public async addFriend(name: string, city: City, notes: string = ''): Promise<Friend> {
    const newFriend: Friend = {
      id: Date.now().toString(), // Simple ID generation
      name,
      city,
      notes
    };

    this.friends.push(newFriend);
    await this.saveFriends();
    return newFriend;
  }

  public async updateFriend(id: string, name: string, city: City, notes: string): Promise<void> {
    const index = this.friends.findIndex(friend => friend.id === id);
    if (index !== -1) {
      this.friends[index] = {
        ...this.friends[index],
        name,
        city,
        notes
      };
      await this.saveFriends();
    }
  } 

  public async deleteFriend(id: string): Promise<void> {
    this.friends = this.friends.filter(friend => friend.id !== id);
    await this.saveFriends();
  }

  // Helper function to get formatted location with flag
  public getFormattedLocation(friend: Friend): string {
    return `${getFlag(friend.city.country)} ${friend.city.name}, ${friend.city.country}`;
  }

  // Helper function to get local time for friend
  public getTime(friend: Friend): string {
    return getLocalTime(friend.city);
  }
}

export default FriendManager;