import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4FcQONiMZ7nxKWSwETlGqDWkNmq3sBxA",
  authDomain: "socketchat-f8cf4.firebaseapp.com",
  projectId: "socketchat-f8cf4",
  storageBucket: "socketchat-f8cf4.firebasestorage.app",
  messagingSenderId: "1091486948305",
  appId: "1:1091486948305:web:2d6f91d5dbdf3836129ef0",
  measurementId: "G-D16ZY4W3K0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // ← Add app reference here
const db = getFirestore(app); // ← Add app reference here

export { auth, db };
