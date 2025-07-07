// Authentication Module
import { auth } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const successDiv = document.getElementById('success');
const successMessage = document.getElementById('successMessage');

// Admin Configuration
const ADMIN_EMAILS = [
  'admin@test.com',
  'admin@yourcompany.com' // Add more admin emails as needed
];

// Utility Functions
function showError(message) {
  errorMessage.textContent = message;
  errorDiv.classList.remove('hidden');
  successDiv.classList.add('hidden');
}

function showSuccess(message) {
  successMessage.textContent = message;
  successDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
}

function hideMessages() {
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  if (isLoading) {
    loginText.classList.add('hidden');
    loginSpinner.classList.remove('hidden');
  } else {
    loginText.classList.remove('hidden');
    loginSpinner.classList.add('hidden');
  }
}

// Check if user is admin
function isAdmin(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Authentication Functions
async function loginUser(email, password) {
  try {
    setLoading(true);
    hideMessages();
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user is admin
    if (!isAdmin(user.email)) {
      await signOut(auth);
      showError('Access denied: Admin privileges required.');
      return false;
    }
    
    // Store user info in session storage for dashboard
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('userDisplayName', user.displayName || 'Admin');
    
    showSuccess('Login successful! Redirecting to dashboard...');
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
    
    return true;
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error codes
    switch (error.code) {
      case 'auth/user-not-found':
        showError('No account found with this email address.');
        break;
      case 'auth/wrong-password':
        showError('Incorrect password. Please try again.');
        break;
      case 'auth/invalid-email':
        showError('Invalid email address format.');
        break;
      case 'auth/too-many-requests':
        showError('Too many failed login attempts. Please try again later.');
        break;
      case 'auth/network-request-failed':
        showError('Network error. Please check your connection.');
        break;
      default:
        showError('Login failed: ' + error.message);
    }
    
    return false;
  } finally {
    setLoading(false);
  }
}

// Check authentication state
function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user && isAdmin(user.email)) {
      // User is signed in and is admin
      console.log('User is logged in:', user.email);
      // If already on login page, redirect to dashboard
      if (window.location.pathname.includes('sign-in.html')) {
        window.location.href = 'dashboard.html';
      }
    } else {
      // User is signed out or not admin
      console.log('User is logged out or not admin');
      // Clear session storage
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userDisplayName');
    }
  });
}

// Event Listeners
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }
    
    await loginUser(email, password);
  });
}

// Initialize authentication state check
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
});

// Export functions for use in other modules
export { loginUser, isAdmin, checkAuthState, signOut };