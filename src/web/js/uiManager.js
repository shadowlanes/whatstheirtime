/**
 * UI Management module
 */

const UIManager = (function() {
    // Keep track of time update intervals
    const timeUpdateIntervals = {};
    
    /**
     * Initialize the friend time UI
     */
    function initFriendTimeUI() {
        const addFriendBtn = document.getElementById('add-friend-btn');
        const friendFormContainer = document.getElementById('friend-form-container');
        const friendForm = document.getElementById('friend-form');
        const cancelAddFriendBtn = document.getElementById('cancel-add-friend');
        const friendCityInput = document.getElementById('friend-city');
        const citySuggestions = document.getElementById('city-suggestions');
        const friendNameInput = document.getElementById('friend-name');
        
        // Load existing friends
        renderAllFriends();
        
        // Add friend button click
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => {
                friendFormContainer.classList.remove('hidden');
                friendNameInput.focus();
            });
        }
        
        // Cancel adding friend
        if (cancelAddFriendBtn) {
            cancelAddFriendBtn.addEventListener('click', () => {
                friendFormContainer.classList.add('hidden');
                friendForm.reset();
                citySuggestions.style.display = 'none';
            });
        }
        
        // City search input
        if (friendCityInput) {
            // Debounce search input to prevent too many searches
            const handleCitySearch = Utils.debounce((e) => {
                const query = e.target.value;
                const results = CityData.searchCities(query);
                
                if (results.length > 0) {
                    renderCitySuggestions(results, citySuggestions, friendCityInput);
                    citySuggestions.style.display = 'block';
                } else {
                    citySuggestions.style.display = 'none';
                }
            }, 300);
            
            friendCityInput.addEventListener('input', handleCitySearch);
            
            // Handle keyboard navigation in suggestions
            friendCityInput.addEventListener('keydown', (e) => {
                if (citySuggestions.style.display === 'block') {
                    const items = citySuggestions.querySelectorAll('.suggestion-item');
                    const selected = citySuggestions.querySelector('.selected');
                    let index = -1;
                    
                    if (selected) {
                        index = Array.from(items).indexOf(selected);
                    }
                    
                    // Down arrow
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (index < items.length - 1) {
                            if (selected) selected.classList.remove('selected');
                            items[index + 1].classList.add('selected');
                            items[index + 1].scrollIntoView({ block: 'nearest' });
                        }
                    }
                    
                    // Up arrow
                    else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (index > 0) {
                            if (selected) selected.classList.remove('selected');
                            items[index - 1].classList.add('selected');
                            items[index - 1].scrollIntoView({ block: 'nearest' });
                        }
                    }
                    
                    // Enter key - select highlighted item
                    else if (e.key === 'Enter' && selected) {
                        e.preventDefault();
                        const cityName = selected.dataset.cityName;
                        const cityCountry = selected.dataset.cityCountry;
                        friendCityInput.value = `${cityName}, ${cityCountry}`;
                        citySuggestions.style.display = 'none';
                    }
                    
                    // Escape key - close suggestions
                    else if (e.key === 'Escape') {
                        citySuggestions.style.display = 'none';
                    }
                }
            });
        }
        
        // Handle form submission
        if (friendForm) {
            friendForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const friendName = friendNameInput.value.trim();
                const cityInput = friendCityInput.value.trim();
                
                // Basic validation
                if (!friendName || !cityInput) {
                    alert('Please fill in all fields');
                    return;
                }
                
                // Extract city name from input (format is "City, Country")
                const cityName = cityInput.split(',')[0].trim();
                
                // Get timezone for the city
                const timezone = CityData.getTimezoneForCity(cityName);
                
                if (!timezone) {
                    alert('Please select a valid city from the suggestions');
                    return;
                }
                
                try {
                    // Add the friend
                    const friend = FriendManager.addFriend(friendName, cityName, timezone);
                    
                    // Add the friend to the UI
                    renderFriendCard(friend);
                    
                    // Reset form and hide it
                    friendForm.reset();
                    friendFormContainer.classList.add('hidden');
                } catch (error) {
                    alert(error.message);
                }
            });
        }
        
        // Click outside suggestions to close them
        document.addEventListener('click', (e) => {
            if (citySuggestions && 
                !friendCityInput.contains(e.target) && 
                !citySuggestions.contains(e.target)) {
                citySuggestions.style.display = 'none';
            }
        });
    }
    
    /**
     * Render city suggestions dropdown
     * @param {Object[]} cities - Array of city objects
     * @param {HTMLElement} container - Container to render suggestions
     * @param {HTMLElement} inputField - Input field for city
     */
    function renderCitySuggestions(cities, container, inputField) {
        // Clear previous suggestions
        container.innerHTML = '';
        
        cities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = CityData.formatCityDisplay(city);
            div.dataset.cityName = city.name;
            div.dataset.cityCountry = city.country;
            
            div.addEventListener('click', () => {
                inputField.value = `${city.name}, ${city.country}`;
                container.style.display = 'none';
            });
            
            container.appendChild(div);
        });
    }
    
    /**
     * Render a friend card
     * @param {Object} friend - Friend object
     */
    function renderFriendCard(friend) {
        const friendsContainer = document.getElementById('friends-container');
        if (!friendsContainer) return;
        
        // Create card
        const card = document.createElement('div');
        card.className = 'friend-card';
        card.dataset.friendId = friend.id;
        
        // Add friend's name
        const nameHeading = document.createElement('h4');
        nameHeading.textContent = friend.name;
        card.appendChild(nameHeading);
        
        // Add time display
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'friend-time';
        card.appendChild(timeDisplay);
        
        // Add city info
        const cityInfo = document.createElement('div');
        cityInfo.className = 'friend-city';
        cityInfo.textContent = `${friend.city} (${friend.timezone})`;
        card.appendChild(cityInfo);
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-friend';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Remove friend';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Remove ${friend.name} from your friends list?`)) {
                removeFriendCard(friend.id);
            }
        });
        card.appendChild(deleteBtn);
        
        // Add to container
        friendsContainer.appendChild(card);
        
        // Initialize time display
        updateFriendTime(friend.id, timeDisplay, friend.timezone);
        
        // Schedule regular updates
        const intervalId = setInterval(() => {
            updateFriendTime(friend.id, timeDisplay, friend.timezone);
        }, 60000); // Update every minute
        
        // Store interval ID for cleanup
        timeUpdateIntervals[friend.id] = intervalId;
    }
    
    /**
     * Remove a friend card
     * @param {string} friendId - Friend ID
     */
    function removeFriendCard(friendId) {
        // Remove from data
        const success = FriendManager.removeFriend(friendId);
        
        if (success) {
            // Clear update interval
            if (timeUpdateIntervals[friendId]) {
                clearInterval(timeUpdateIntervals[friendId]);
                delete timeUpdateIntervals[friendId];
            }
            
            // Remove card from DOM
            const card = document.querySelector(`.friend-card[data-friend-id="${friendId}"]`);
            if (card) {
                card.remove();
            }
        }
    }
    
    /**
     * Update time display for a friend
     * @param {string} friendId - Friend ID
     * @param {HTMLElement} element - Time display element
     * @param {string} timezone - Friend's timezone
     */
    function updateFriendTime(friendId, element, timezone) {
        if (!element) return;
        TimeManager.updateTimeElement(element, timezone);
    }
    
    /**
     * Render all friends from storage
     */
    function renderAllFriends() {
        const friends = FriendManager.getAllFriends();
        
        // Clear any existing friend cards
        const friendsContainer = document.getElementById('friends-container');
        if (friendsContainer) {
            friendsContainer.innerHTML = '';
        }
        
        // Clear any existing intervals
        Object.keys(timeUpdateIntervals).forEach(key => {
            clearInterval(timeUpdateIntervals[key]);
            delete timeUpdateIntervals[key];
        });
        
        // Render each friend
        friends.forEach(friend => {
            renderFriendCard(friend);
        });
    }
    
    /**
     * Clean up intervals and event listeners (call when leaving the page)
     */
    function cleanup() {
        Object.keys(timeUpdateIntervals).forEach(key => {
            clearInterval(timeUpdateIntervals[key]);
        });
    }
    
    return {
        initFriendTimeUI,
        renderAllFriends,
        cleanup
    };
})();

// Explicitly make UIManager available globally
window.UIManager = UIManager;
