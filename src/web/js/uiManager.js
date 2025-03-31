/**
 * UI Management module
 */

const UIManager = (function() {
    // Keep track of time update intervals
    const timeUpdateIntervals = {};
    
    /**
     * Sort friends by their current time (earliest first)
     * @param {Object[]} friends - Array of friend objects
     * @returns {Object[]} Sorted array of friend objects
     */
    function sortFriendsByTime(friends) {
        return [...friends].sort((a, b) => {
            // Get current time for each friend's timezone
            const timeA = TimeManager.getCurrentTimeInTimezone(a.timezone);
            const timeB = TimeManager.getCurrentTimeInTimezone(b.timezone);
            
            // Compare hours first (0-23)
            const hourA = timeA.getHours();
            const hourB = timeB.getHours();
            
            if (hourA !== hourB) {
                return hourA - hourB; // Sort by hour ascending (early hours first)
            }
            
            // If hours are the same, compare minutes
            return timeA.getMinutes() - timeB.getMinutes();
        });
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
        
        // Sort friends by time (earliest first)
        const sortedFriends = sortFriendsByTime(friends);
        
        // Render each friend in sorted order
        sortedFriends.forEach(friend => {
            renderFriendCard(friend);
        });
    }
    
    /**
     * Re-sort and refresh all friends (to update ordering)
     */
    function refreshFriendOrder() {
        // Re-render all friends to update the order
        renderAllFriends();
    }
    
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
        
        // Create form overlay for modal effect
        const formOverlay = document.createElement('div');
        formOverlay.className = 'form-overlay';
        document.body.appendChild(formOverlay);
        
        // Load existing friends
        renderAllFriends();
        
        // Add friend button click
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => {
                friendFormContainer.classList.remove('hidden');
                formOverlay.classList.add('active');
                friendNameInput.focus();
            });
        }
        
        // Cancel adding friend
        if (cancelAddFriendBtn) {
            cancelAddFriendBtn.addEventListener('click', () => {
                hideAddFriendForm();
            });
        }
        
        // Close form when clicking overlay
        formOverlay.addEventListener('click', () => {
            hideAddFriendForm();
        });
        
        function hideAddFriendForm() {
            friendFormContainer.classList.add('hidden');
            formOverlay.classList.remove('active');
            friendForm.reset();
            citySuggestions.style.display = 'none';
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
                    hideAddFriendForm();
                } catch (error) {
                    alert(error.message);
                }
            });
        }
        
        // Handle escape key for closing form
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !friendFormContainer.classList.contains('hidden')) {
                hideAddFriendForm();
            }
        });
        
        // Click outside suggestions to close them
        document.addEventListener('click', (e) => {
            if (citySuggestions && 
                !friendCityInput.contains(e.target) && 
                !citySuggestions.contains(e.target)) {
                citySuggestions.style.display = 'none';
            }
        });
        
        // Set up periodic re-sorting of friends list (every hour)
        const resortInterval = setInterval(() => {
            refreshFriendOrder();
        }, 60 * 60 * 1000); // Every hour
        
        // Store interval for cleanup
        timeUpdateIntervals['resort'] = resortInterval;
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
            
            // Add flag and city data
            div.textContent = CityData.formatCityDisplay(city);
            div.dataset.cityName = city.name;
            div.dataset.cityCountry = city.country;
            
            div.addEventListener('click', () => {
                // Use the formatted display with flag in the input
                inputField.value = `${city.name}, ${city.country}`;
                inputField.dataset.selectedCountry = city.country; // Store country for flag
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
        
        // Create header with name and flag
        const cardHeader = document.createElement('div');
        cardHeader.className = 'friend-card-header';
        
        // Get country from the timezone/city info stored in friend object
        const country = findCountryForCity(friend.city);
        const flag = country ? CityData.getFlagEmoji(country) : '';
        
        // Add friend's name with flag
        const nameHeading = document.createElement('h4');
        
        // Add flag if available
        if (flag) {
            const flagSpan = document.createElement('span');
            flagSpan.className = 'friend-flag';
            flagSpan.textContent = flag;
            nameHeading.appendChild(flagSpan);
            nameHeading.appendChild(document.createTextNode(' ' + friend.name));
        } else {
            nameHeading.textContent = friend.name;
        }
        
        cardHeader.appendChild(nameHeading);
        card.appendChild(cardHeader);
        
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
     * Find country for a city
     * @param {string} cityName - City name
     * @returns {string} Country name or empty string if not found
     */
    function findCountryForCity(cityName) {
        const cities = CityData.getAllCities();
        const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        return city ? city.country : '';
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
        refreshFriendOrder,
        cleanup
    };
})();

// Explicitly make UIManager available globally
window.UIManager = UIManager;
