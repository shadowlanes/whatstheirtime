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
            // Get current time for each friend's timezone using tzName only
            const timeA = TimeManager.getCurrentTimeInTimezone(a.tzName);
            const timeB = TimeManager.getCurrentTimeInTimezone(b.tzName);
            
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
     * Get activity icon based on time and day
     * @param {Date} dateTime - Current date/time in the friend's timezone
     * @returns {Object} Activity info with icon and description
     */
    function getActivityForTime(dateTime) {
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();
        const isWeekend = [0, 6].includes(dateTime.getDay()); // 0 is Sunday, 6 is Saturday
        const timeValue = hour + (minute / 60); // Convert to decimal time (e.g., 8:30 = 8.5)
        
        // Night time (9:30 PM - 6 AM): Sleeping
        if (timeValue >= 21.5 || timeValue < 6) {
            return {
                icon: '💤',
                description: 'Sleeping',
                cssClass: 'activity-sleeping'
            };
        }
        
        // Early morning (6 AM - 7 AM): Waking up
        if (timeValue >= 6 && timeValue < 7) {
            return {
                icon: '🌅',
                description: 'Waking up',
                cssClass: 'activity-waking'
            };
        }
        
        // Breakfast time (7 AM - 8 AM)
        if (timeValue >= 7 && timeValue < 8) {
            return {
                icon: '☕',
                description: 'Having breakfast',
                cssClass: 'activity-breakfast'
            };
        }
        
        // Lunch time (12:30 PM - 1:30 PM)
        if (timeValue >= 12.5 && timeValue < 13.5) {
            return {
                icon: '🍱',
                description: 'Lunch break',
                cssClass: 'activity-lunch'
            };
        }
        
        // Work hours (8 AM - 5:30 PM)
        if (timeValue >= 8 && timeValue < 17.5) {
            if (isWeekend) {
                return {
                    icon: '🎮',
                    description: 'Playing games',
                    cssClass: 'activity-weekend'
                };
            }
            return {
                icon: '💼',
                description: 'Working',
                cssClass: 'activity-working'
            };
        }
        
        // Evening (5:30 PM - 8:30 PM)
        if (timeValue >= 17.5 && timeValue < 20.5) {
            if (isWeekend) {
                return {
                    icon: '🎬',
                    description: 'Watching a movie',
                    cssClass: 'activity-movie'
                };
            }
            return {
                icon: '🚶',
                description: 'Heading home',
                cssClass: 'activity-evening'
            };
        }
        
        // Dinner time (8:30 PM - 9:30 PM)
        if (timeValue >= 20.5 && timeValue < 21.5) {
            return {
                icon: '🍽️',
                description: 'Having dinner',
                cssClass: 'activity-dinner'
            };
        }
        
        // Default (should never reach here, but just in case)
        return {
            icon: '⏰',
            description: 'Going about their day',
            cssClass: 'activity-default'
        };
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
        
        // Update stats counter
        updateFriendStats(sortedFriends);
        
        // Render each friend in sorted order
        sortedFriends.forEach(friend => {
            renderFriendCard(friend);
        });
    }
    
    /**
     * Update the friend statistics display
     * @param {Array} friends - Array of friend objects
     */
    function updateFriendStats(friends) {
        const statsContainer = document.getElementById('friend-stats');
        if (!statsContainer) return;
        
        // Count unique timezones
        const uniqueTimezones = new Set();
        friends.forEach(friend => uniqueTimezones.add(friend.timezone));
        
        // Update the stats display
        statsContainer.innerHTML = `
            <span class="stat-item">
                <span class="stat-value">${friends.length}</span>
                <span class="stat-label">Friend${friends.length !== 1 ? 's' : ''}</span>
            </span>
            <span class="stat-divider">•</span>
            <span class="stat-item">
                <span class="stat-value">${uniqueTimezones.size}</span>
                <span class="stat-label">Timezone${uniqueTimezones.size !== 1 ? 's' : ''}</span>
            </span>
        `;
        
        // Make stats visible if there are friends
        if (friends.length > 0) {
            statsContainer.classList.remove('hidden');
        } else {
            statsContainer.classList.add('hidden');
        }
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
        
        // Make sure the modal is hidden initially
        if (friendFormContainer) {
            friendFormContainer.classList.add('hidden');
        }
        
        // Make sure the add friend button is visible
        if (addFriendBtn) {
            addFriendBtn.classList.remove('hidden');
            addFriendBtn.style.display = 'flex';
        }
        
        // Create form overlay for modal effect
        let formOverlay = document.querySelector('.form-overlay');
        if (!formOverlay) {
            formOverlay = document.createElement('div');
            formOverlay.className = 'form-overlay';
            document.body.appendChild(formOverlay);
        }
        
        // Make sure the form is moved to be a direct child of the body
        if (friendFormContainer) {
            // First remove it from its current parent if not already a direct child of body
            if (friendFormContainer.parentNode && friendFormContainer.parentNode !== document.body) {
                friendFormContainer.parentNode.removeChild(friendFormContainer);
                // Then append it directly to the body
                document.body.appendChild(friendFormContainer);
            }
            
            // Ensure proper styling
            friendFormContainer.style.zIndex = '2000';
            friendFormContainer.style.position = 'fixed';
        }
        
        // Load existing friends
        renderAllFriends();
        
        // Add friend button click
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => {
                if (friendFormContainer) {
                    friendFormContainer.classList.remove('hidden');
                    formOverlay.classList.add('active');
                    if (friendNameInput) friendNameInput.focus();
                }
            });
        }
        
        // Cancel adding friend - FIX: Use stopPropagation
        if (cancelAddFriendBtn) {
            cancelAddFriendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                hideAddFriendForm();
            });
        }
        
        // Close form when clicking overlay - FIX: Check target more carefully
        if (formOverlay) {
            formOverlay.addEventListener('click', (e) => {
                // Make sure we're clicking the overlay itself, not its children
                if (e.target === formOverlay) {
                    e.stopPropagation();
                    hideAddFriendForm();
                }
            });
        }
        
        // FIX: Better implementation of hideAddFriendForm
        function hideAddFriendForm() {
            console.log('Hiding friend form');
            if (friendFormContainer) {
                friendFormContainer.classList.add('hidden');
            }
            
            if (formOverlay) {
                formOverlay.classList.remove('active');
            }
            
            if (friendForm) {
                friendForm.reset();
            }
            
            if (citySuggestions) {
                citySuggestions.style.display = 'none';
            }
        }
        
        // Handle escape key for closing form - Fix the event listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && friendFormContainer && 
                !friendFormContainer.classList.contains('hidden')) {
                hideAddFriendForm();
            }
        });
        
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
        
        // Handle form submission - FIX: Ensure form is properly hidden after submission
        if (friendForm) {
            friendForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const friendName = friendNameInput.value.trim();
                const cityInput = friendCityInput.value.trim();
                
                // Basic validation
                if (!friendName || !cityInput) {
                    alert('Please fill in all fields');
                    return;
                }
                
                // Extract city name from input (format is "City, Country")
                const cityName = cityInput.split(',')[0].trim();
                
                // Get complete city data with timezone and tzName
                const cities = CityData.getAllCities();
                const cityData = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
                
                if (!cityData) {
                    alert('Please select a valid city from the suggestions');
                    return;
                }
                
                try {
                    // Add the friend with both timezone and tzName
                    const friend = FriendManager.addFriend(friendName, cityName, cityData.timezone, cityData.tzName);
                    
                    // Add the friend to the UI
                    renderFriendCard(friend);
                    
                    // Reset form and hide it
                    hideAddFriendForm();
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
        
        // Store tzName as a data attribute for easy access
        if (friend.tzName) {
            card.dataset.tzName = friend.tzName;
        }
        
        // Make sure we have a valid tzName for this friend
        if (!friend.tzName) {
            console.error(`Friend ${friend.name} has no tzName, time display may be incorrect`);
            // Try to find tzName from city data as backup
            const cityData = CityData.getAllCities().find(c => 
                c.name.toLowerCase() === friend.city.toLowerCase());
            if (cityData && cityData.tzName) {
                friend.tzName = cityData.tzName;
                // Update in storage
                const friends = FriendManager.getAllFriends();
                const friendIndex = friends.findIndex(f => f.id === friend.id);
                if (friendIndex !== -1) {
                    friends[friendIndex].tzName = cityData.tzName;
                    Utils.storeData('friendsData', friends);
                }
            }
        }
        
        // Add subtle animation delay for staggered effect
        card.style.animationDelay = `${Math.random() * 0.5}s`;
        
        // Get the current time and activity for friend's timezone using tzName
        const friendTime = TimeManager.getCurrentTimeInTimezone(friend.tzName);
        const hour = friendTime.getHours();
        const activity = getActivityForTime(friendTime);
        
        // Time-based styling
        if (hour >= 5 && hour < 8) {
            // Dawn - soft oranges and yellows
            card.style.borderLeft = '3px solid rgba(235, 165, 76, 0.6)';
        } else if (hour >= 8 && hour < 16) {
            // Day - sky blue accents
            card.style.borderLeft = '3px solid rgba(98, 178, 208, 0.6)';
        } else if (hour >= 16 && hour < 19) {
            // Dusk - purples and pinks
            card.style.borderLeft = '3px solid rgba(235, 110, 128, 0.6)';
        } else {
            // Night - deep blues
            card.style.borderLeft = '3px solid rgba(42, 72, 120, 0.6)';
        }
        
        // Add activity class to the card
        card.classList.add(activity.cssClass);
        
        // Create header with name and flag
        const cardHeader = document.createElement('div');
        cardHeader.className = 'friend-card-header';
        
        // Get country from the friend object
        const country = friend.country || '';
        const flag = country ? CityData.getFlagEmoji(country) : '';
        
        // Add friend's name with flag
        const nameHeading = document.createElement('h4');
        
        // Add flag if available
        if (flag) {
            const flagSpan = document.createElement('span');
            flagSpan.className = 'friend-flag';
            flagSpan.textContent = flag;
            nameHeading.appendChild(flagSpan);
            nameHeading.appendChild(document.createTextNode(friend.name));
        } else {
            nameHeading.textContent = friend.name;
        }
        
        cardHeader.appendChild(nameHeading);
        card.appendChild(cardHeader);
        
        // Add activity indicator with time on the right
        const activityContainer = document.createElement('div');
        activityContainer.className = 'friend-activity';
        
        // Left side - activity icon and description
        const activityLeft = document.createElement('div');
        activityLeft.className = 'activity-left';
        
        const activityIcon = document.createElement('span');
        activityIcon.className = 'activity-icon';
        activityIcon.textContent = activity.icon;
        activityLeft.appendChild(activityIcon);
        
        const activityText = document.createElement('span');
        activityText.className = 'activity-description';
        activityText.textContent = activity.description;
        activityLeft.appendChild(activityText);
        
        activityContainer.appendChild(activityLeft);
        
        // Right side - time display
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'friend-time';
        timeDisplay.textContent = TimeManager.getFormattedTimeForTimezone(friend.tzName);
        activityContainer.appendChild(timeDisplay);
        
        card.appendChild(activityContainer);
        
        // Add city and timezone info (without background)
        const cityInfo = document.createElement('div');
        cityInfo.className = 'friend-city';
        
        // Include tzName in display
        cityInfo.textContent = `${friend.city} (${friend.tzName})`;
        card.appendChild(cityInfo);
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-friend';
        deleteBtn.innerHTML = '×';
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
        updateFriendTime(friend.id, timeDisplay, activityContainer, friend.tzName);
        
        // Schedule regular updates
        const intervalId = setInterval(() => {
            updateFriendTime(friend.id, timeDisplay, activityContainer, friend.tzName);
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
            
            // Update the friend stats
            updateFriendStats(FriendManager.getAllFriends());
        }
    }
    
    /**
     * Update time display and activity for a friend
     * @param {string} friendId - Friend ID
     * @param {HTMLElement} element - Time display element
     * @param {HTMLElement} activityElement - Activity container element
     * @param {string} tzName - IANA timezone name
     */
    function updateFriendTime(friendId, element, activityElement, tzName) {
        if (!element) return;
        
        // Directly use TimeManager.getFormattedTimeForTimezone for more reliable formatting
        element.textContent = TimeManager.getFormattedTimeForTimezone(tzName);
        
        // Get current time to update activity
        const currentTime = TimeManager.getCurrentTimeInTimezone(tzName);
        
        // Update activity if provided
        if (activityElement && currentTime) {
            const activity = getActivityForTime(currentTime);
            
            // Update icon
            const iconElement = activityElement.querySelector('.activity-icon');
            if (iconElement) iconElement.textContent = activity.icon;
            
            // Update description
            const descElement = activityElement.querySelector('.activity-description');
            if (descElement) descElement.textContent = activity.description;
            
            // Update the activity class on the card
            const card = document.querySelector(`.friend-card[data-friend-id="${friendId}"]`);
            if (card) {
                // Remove all activity classes
                card.classList.forEach(className => {
                    if (className.startsWith('activity-')) {
                        card.classList.remove(className);
                    }
                });
                
                // Add the current activity class
                card.classList.add(activity.cssClass);
            }
        }
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
