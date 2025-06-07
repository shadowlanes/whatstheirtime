import AsyncStorage from '@react-native-async-storage/async-storage';
import FriendManager from '../../../models/Friend';
// import { cities } from '../../../models/CityData';
import { City } from '../../../models/CityData';

describe('Friend Model', () => {
  let friendManager: FriendManager;
  // const testCity = cities[0]; // Using the first city in our dataset
  const testCity: City = { 
    id: '1', 
    name: 'New York', 
    country: 'USA', 
    timezone: 'America/New_York', 
    alternateNames: ['NYC', 'Big Apple'] 
  };
  const anotherTestCity: City = {
    id: '2',
    name: 'London',
    country: 'UK',
    timezone: 'Europe/London',
    alternateNames: []
  };
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the singleton instance
    // @ts-ignore - Accessing private static property for testing
    FriendManager['instance'] = undefined;
    
    // Create a fresh instance for each test
    friendManager = FriendManager.getInstance();
    
    // Mock the friends array to start empty
    // @ts-ignore - Accessing private property for testing
    friendManager['friends'] = [];
  });
  
  describe('Singleton Pattern', () => {
    it('should always return the same instance', () => {
      const instance1 = FriendManager.getInstance();
      const instance2 = FriendManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('Friend Management', () => {
    it('should load friends from AsyncStorage on initialization', async () => {
      const mockFriends = [
        { id: '1', name: 'Test Friend', city: testCity, notes: 'Test notes' }
      ];
      
      // Mock AsyncStorage.getItem to return our test data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockFriends));
      
      await friendManager.loadFriends();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('whatstheirtime_friends');
      expect(friendManager.getFriends()).toEqual(mockFriends);
    });
    
    it('should add a new friend and save to AsyncStorage', async () => {
      // Mock AsyncStorage functions
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
      
      const newFriend = await friendManager.addFriend('Test Friend', testCity, 'Test notes');
      
      // Verify friend was added correctly
      expect(friendManager.getFriends()).toContainEqual(newFriend);
      expect(newFriend.name).toBe('Test Friend');
      expect(newFriend.city).toBe(testCity);
      expect(newFriend.notes).toBe('Test notes');
      
      // Verify it was saved to AsyncStorage
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
    
    it('should add a friend with default empty notes when not provided', async () => {
      // Mock AsyncStorage functions
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
      
      const newFriend = await friendManager.addFriend('Test Friend', testCity);
      
      expect(newFriend.notes).toBe('');
    });
    
    it('should retrieve a friend by ID', async () => {
      const mockFriends = [
        { id: '1', name: 'Friend 1', city: testCity, notes: '' },
        { id: '2', name: 'Friend 2', city: testCity, notes: '' }
      ];
      
      // Mock AsyncStorage.getItem to return our test data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockFriends));
      
      await friendManager.loadFriends();
      
      const friend = friendManager.getFriend('2');
      
      expect(friend).toBeDefined();
      expect(friend?.name).toBe('Friend 2');
    });
    
    it('should update an existing friend', async () => {
      const mockFriends = [
        { id: '1', name: 'Friend 1', city: testCity, notes: '' }
      ];
      
      // Mock AsyncStorage.getItem to return our test data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockFriends));
      
      await friendManager.loadFriends();
      
      // const newCity = cities[1]; // Different city
      const newCity = anotherTestCity; // Different city
      await friendManager.updateFriend('1', 'Updated Name', newCity, 'Updated notes');
      
      const updatedFriend = friendManager.getFriend('1');
      
      expect(updatedFriend?.name).toBe('Updated Name');
      expect(updatedFriend?.city).toBe(newCity);
      expect(updatedFriend?.notes).toBe('Updated notes');
      
      // Verify it was saved to AsyncStorage
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
    
    it('should delete a friend', async () => {
      const mockFriends = [
        { id: '1', name: 'Friend 1', city: testCity, notes: '' },
        { id: '2', name: 'Friend 2', city: testCity, notes: '' }
      ];
      
      // Mock AsyncStorage.getItem to return our test data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockFriends));
      
      await friendManager.loadFriends();
      await friendManager.deleteFriend('1');
      
      const remainingFriends = friendManager.getFriends();
      
      expect(remainingFriends.length).toBe(1);
      expect(remainingFriends[0].id).toBe('2');
      
      // Verify it was saved to AsyncStorage
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
  
  describe('Helper Methods', () => {
    it('should format location with flag', () => {
      const friend = {
        id: '1',
        name: 'Test Friend',
        city: {
          id: '21',
          name: 'London',
          country: 'UK',
          timezone: 'GMT+0',
          tzName: 'Europe/London',
          alternateNames: []
        },
        notes: ''
      };
      
      const formattedLocation = friendManager.getFormattedLocation(friend);
      expect(formattedLocation).toBe('🇬🇧 London, UK');
    });
  });
});