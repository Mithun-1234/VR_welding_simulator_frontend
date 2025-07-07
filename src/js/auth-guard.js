// Authentication Guard
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Admin Configuration
const ADMIN_EMAILS = [
  'admin@test.com',
  'admin@yourcompany.com' // Add more admin emails as needed
];

// Check if user is admin
function isAdmin(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Redirect to login page
function redirectToLogin() {
  window.location.href = 'sign-in.html';
}

// Show loading state
function showLoading() {
  document.body.innerHTML = `
    <div class="fixed inset-0 bg-white flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  `;
}

// Auth Guard Function
function initAuthGuard() {
  // Show loading state while checking auth
  showLoading();
  
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe after first check
      
      if (user && isAdmin(user.email)) {
        // User is authenticated and is admin
        console.log('Auth Guard: User authenticated -', user.email);
        
        // Store user info in session storage
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userDisplayName', user.displayName || 'Admin');
        sessionStorage.setItem('userUid', user.uid);
        
        resolve(user);
      } else {
        // User is not authenticated or not admin
        console.log('Auth Guard: User not authenticated or not admin');
        
        // Clear session storage
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userDisplayName');
        sessionStorage.removeItem('userUid');
        
        // Sign out if user exists but is not admin
        if (user && !isAdmin(user.email)) {
          signOut(auth).then(() => {
            redirectToLogin();
          });
        } else {
          redirectToLogin();
        }
        
        reject(new Error('Authentication required'));
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      unsubscribe();
      console.log('Auth Guard: Timeout');
      redirectToLogin();
      reject(new Error('Authentication timeout'));
    }, 10000);
  });
}

// Initialize user info in the dashboard
function initUserInfo() {
  const userEmail = sessionStorage.getItem('userEmail');
  const userDisplayName = sessionStorage.getItem('userDisplayName');
  
  // Update user info in the dashboard
  const userEmailElements = document.querySelectorAll('[data-user-email]');
  const userNameElements = document.querySelectorAll('[data-user-name]');
  
  userEmailElements.forEach(element => {
    element.textContent = userEmail || 'Unknown';
  });
  
  userNameElements.forEach(element => {
    element.textContent = userDisplayName || 'Admin';
  });
}

// Logout function
function logout() {
  signOut(auth).then(() => {
    sessionStorage.clear();
    redirectToLogin();
  }).catch((error) => {
    console.error('Logout error:', error);
    // Force redirect even if sign out fails
    sessionStorage.clear();
    redirectToLogin();
  });
}

function setupLogoutButtons() {
  const logoutButtons = document.querySelectorAll('[data-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Logout button clicked');
      logout();
    });
  });
}


// Initialize auth guard for dashboard pages
document.addEventListener('DOMContentLoaded', () => {
  // Only run auth guard on dashboard pages
  if (window.location.pathname.includes('dashboard.html') || 
      window.location.pathname.includes('profile.html') ||
      window.location.pathname.includes('tables.html') ||
      window.location.pathname.includes('billing.html') ||
      window.location.pathname.includes('virtual-reality.html')) {
    
    initAuthGuard().then(() => {
      // Authentication successful, initialize dashboard
      initUserInfo();
      setupLogoutButtons();
    }).catch((error) => {
      console.error('Auth guard error:', error);
      // Already redirected to login
    });
  }
});

// Export functions
export { initAuthGuard, logout, initUserInfo, setupLogoutButtons };