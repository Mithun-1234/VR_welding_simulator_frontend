// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Your Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXBfwNRo6Cck-7JyOoZM0O3zZl8BJEW5g",
  authDomain: "test-weld.firebaseapp.com",
  databaseURL: "https://test-weld-default-rtdb.firebaseio.com",
  projectId: "test-weld",
  storageBucket: "test-weld.firebasestorage.app",
  messagingSenderId: "851606889928",
  appId: "1:851606889928:web:c3a2fbe218e7b559840cfd",
  measurementId: "G-FE3YR32NP1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Export the Firebase app instance
export default app;