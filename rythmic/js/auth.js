// Import Firebase
const firebase = window.firebase;

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth state observer
firebase.auth().onAuthStateChanged((user) => {
    const authButton = document.getElementById('auth-button');
    const userInfo = document.getElementById('user-info');
    
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.displayName);
        
        if (authButton && userInfo) {
            authButton.style.display = 'none';
            userInfo.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${user.photoURL}" alt="${user.displayName}" class="w-8 h-8 rounded-full">
                    <div>
                        <p class="font-medium">${user.displayName}</p>
                        <button onclick="logout()" class="text-sm text-red-500 hover:text-red-600">Sign Out</button>
                    </div>
                </div>
            `;
            userInfo.style.display = 'block';
        }
        
        // Save user preferences
        localStorage.setItem('user_preferences', JSON.stringify({
            userId: user.uid,
            name: user.displayName,
            email: user.email,
            lastLogin: new Date().toISOString()
        }));
    } else {
        // User is signed out
        console.log('User is signed out');
        
        if (authButton && userInfo) {
            authButton.style.display = 'block';
            userInfo.style.display = 'none';
        }
        
        // Clear user preferences
        localStorage.removeItem('user_preferences');
    }
});

// Google Sign In
function initGoogleAuth() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            // Show success message
            showNotification('Successfully signed in! 🎉', 'success');
        })
        .catch((error) => {
            console.error('Error during sign in:', error);
            showNotification('Failed to sign in. Please try again.', 'error');
        });
}

// Sign out
function logout() {
    firebase.auth().signOut()
        .then(() => {
            showNotification('Successfully signed out!', 'success');
        })
        .catch((error) => {
            console.error('Error during sign out:', error);
            showNotification('Failed to sign out. Please try again.', 'error');
        });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded shadow-lg transition-opacity duration-500 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-xl">${
                type === 'success' ? '✅' :
                type === 'error' ? '❌' :
                'ℹ️'
            }</span>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Fade out and remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Export functions
window.initGoogleAuth = initGoogleAuth;
window.logout = logout;
