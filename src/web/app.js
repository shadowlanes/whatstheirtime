document.addEventListener('DOMContentLoaded', () => {
    const nameForm = document.getElementById('name-form');
    const welcomeScreen = document.getElementById('welcome-screen');
    const userNameSpan = document.getElementById('user-name');
    const userForm = document.getElementById('user-form');
    const nameInput = document.getElementById('name-input');
    const installInfoBtn = document.getElementById('install-info-btn');
    const installInstructions = document.getElementById('install-instructions');
     
    // Check if the user name exists in local storage
    const userName = localStorage.getItem('userName');
    
    if (userName) {
        // User has already provided their name
        showWelcomeScreen(userName);
    } else {
        // Show the form to get the user's name
        showNameForm();
    } 
    
    // Handle form submission
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        
        if (name) {
            localStorage.setItem('userName', name);
            showWelcomeScreen(name);
        }
    });
    
    // Handle install info button click
    if (installInfoBtn) {
        installInfoBtn.addEventListener('click', () => {
            installInstructions.classList.toggle('hidden');
            installInfoBtn.textContent = installInstructions.classList.contains('hidden') 
                ? 'How to install this app' 
                : 'Hide installation instructions';
        });
    }
    
    function showWelcomeScreen(name) {
        nameForm.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        userNameSpan.textContent = name;
        
        // Initialize friend time functionality once user is logged in
        UIManager.initFriendTimeUI();
        
        // Ensure the add friend button is visible
        const addFriendBtn = document.getElementById('add-friend-btn');
        if (addFriendBtn) {
            addFriendBtn.classList.remove('hidden');
            addFriendBtn.style.display = 'flex';
            addFriendBtn.style.opacity = '1';
            addFriendBtn.style.visibility = 'visible';
            
            // Log to confirm the button exists and should be visible
            console.log('Add friend button should now be visible');
        } else {
            // If the button doesn't exist, create it
            console.warn('Add friend button not found, creating it');
            createAddFriendButton();
        }
    }
    
    // Function to create the add friend button if it doesn't exist
    function createAddFriendButton() {
        const existingBtn = document.getElementById('add-friend-btn');
        if (existingBtn) return; // Don't create if it already exists
        
        const btn = document.createElement('button');
        btn.id = 'add-friend-btn';
        btn.className = 'floating-action-btn';
        btn.title = 'Add a friend';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'plus-icon';
        iconSpan.textContent = '+';
        
        btn.appendChild(iconSpan);
        document.body.appendChild(btn);
        
        // Add event listener
        btn.addEventListener('click', () => {
            const friendFormContainer = document.getElementById('friend-form-container');
            const formOverlay = document.querySelector('.form-overlay');
            const friendNameInput = document.getElementById('friend-name');
            
            if (friendFormContainer) {
                friendFormContainer.classList.remove('hidden');
                if (formOverlay) formOverlay.classList.add('active');
                if (friendNameInput) friendNameInput.focus();
            }
        });
    }
    
    function showNameForm() {
        nameForm.classList.remove('hidden');
        welcomeScreen.classList.add('hidden');
    }
    
    // Check if the app can be installed (not already installed)
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
    });
    
    // Clean up resources when leaving the page
    window.addEventListener('beforeunload', () => {
        UIManager.cleanup();
    });
});
