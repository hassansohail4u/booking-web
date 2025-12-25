import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIu7CFFeDXV3CvNHVm9AN_WNTZjLhoh-o",
  authDomain: "olx-clone-by-hassan-duroodwala.firebaseapp.com",
  projectId: "olx-clone-by-hassan-duroodwala",
  storageBucket: "olx-clone-by-hassan-duroodwala.firebasestorage.app",
  messagingSenderId: "739672176986",
  appId: "1:739672176986:web:5dceaa97c16049739f9b63",
  measurementId: "G-54DD6G7LBV"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;

