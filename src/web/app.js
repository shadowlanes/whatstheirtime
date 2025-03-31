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
});
