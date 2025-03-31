/**
 * Friend management module
 */

const FriendManager = (function() {
    const STORAGE_KEY = 'friendsData';
    
    /**
     * Get all friends from storage
     * @returns {Object[]} Array of friend objects
     */
    function getAllFriends() {
        return Utils.retrieveData(STORAGE_KEY, []);
    }
    
    /**
     * Add a new friend
     * @param {string} name - Friend's name
     * @param {string} city - Friend's city
     * @param {string} timezone - Friend's timezone
     * @returns {Object} The newly added friend object
     */
    function addFriend(name, city, timezone) {
        const friends = getAllFriends();
        
        // Check for duplicate name
        if (friends.some(friend => friend.name.toLowerCase() === name.toLowerCase())) {
            throw new Error(`You already have a friend named ${name}`);
        }
        
        // Find the country for the city
        const cities = CityData.getAllCities();
        const cityData = cities.find(c => c.name.toLowerCase() === city.toLowerCase());
        const country = cityData ? cityData.country : '';
        
        const newFriend = {
            id: Utils.generateId(),
            name,
            city,
            country, // Store country information
            timezone,
            addedAt: new Date().toISOString()
        };
        
        friends.push(newFriend);
        Utils.storeData(STORAGE_KEY, friends);
        
        return newFriend;
    }
    
    /**
     * Remove friend by ID
     * @param {string} friendId - The ID of the friend to remove
     * @returns {boolean} Success status
     */
    function removeFriend(friendId) {
        const friends = getAllFriends();
        const filteredFriends = friends.filter(friend => friend.id !== friendId);
        
        if (filteredFriends.length !== friends.length) {
            Utils.storeData(STORAGE_KEY, filteredFriends);
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a friend name already exists
     * @param {string} name - Friend name to check
     * @returns {boolean} True if name exists
     */
    function friendNameExists(name) {
        const friends = getAllFriends();
        return friends.some(friend => friend.name.toLowerCase() === name.toLowerCase());
    }
    
    return {
        getAllFriends,
        addFriend,
        removeFriend,
        friendNameExists
    };
})();

// Explicitly make FriendManager available globally
window.FriendManager = FriendManager;
