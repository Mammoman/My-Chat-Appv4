// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPx8MsNRLtBh0gSsHztsebif26bQaYaJ0",
  authDomain: "final-chat-app-6d388.firebaseapp.com",
  projectId: "final-chat-app-6d388",
  storageBucket: "final-chat-app-6d388.appspot.com",
  messagingSenderId: "607965490911",
  appId: "1:607965490911:web:e54b36fbecd8ff132ac36a",
  measurementId: "G-2P2GQ7DBPK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app); 