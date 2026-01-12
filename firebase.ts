
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Thay thế các thông số này bằng thông tin từ Firebase Console của bạn
const firebaseConfig = {
   apiKey: "AIzaSyAO98boIWEewKF8HKj7jJZbmkT0uu6pXYE",
  authDomain: "so-y-te.firebaseapp.com",
  projectId: "so-y-te",
  storageBucket: "so-y-te.firebasestorage.app",
  messagingSenderId: "203017190488",
  appId: "1:203017190488:web:33ebb73d618a41e799de2d",
  measurementId: "G-84TCF013S9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
