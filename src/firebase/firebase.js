// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {  
  apiKey: "AIzaSyBPBvstUuYp-zBXoz27-cd_Lr4MIugnAPQ",
  authDomain: "samplereact-32360.firebaseapp.com", 
  projectId: "samplereact-32360",
  storageBucket: "samplereact-32360.appspot.com",
  messagingSenderId: "544585504111",
  appId: "1:544585504111:web:c4001f218841600e0cc49a",
  measurementId: "G-9R531X1306"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Provider
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
