"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User as AppUser, Gender } from "@/types/booking";

interface AuthContextType {
  currentUser: User | null;
  userData: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, gender: Gender) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isSigningUpRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Don't update state if we're in the middle of signup process
      if (isSigningUpRef.current && user) {
        return;
      }
      setCurrentUser(user);
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as AppUser);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(
    email: string,
    password: string,
    name: string,
    gender: Gender
  ) {
    // Set flag BEFORE creating user to prevent listener from updating state
    isSigningUpRef.current = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Update profile and save data while user is still signed in
      await updateProfile(userCredential.user, { displayName: name });
      
      // Save user data to Firestore
      const userData: AppUser = {
        id: userCredential.user.uid,
        email,
        name,
        gender,
      };
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      // Sign out immediately after saving data to prevent redirect
      await signOut(auth);
      
      // Ensure state is cleared
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      // If error occurs, reset flag
      isSigningUpRef.current = false;
      throw error;
    } finally {
      // Reset flag after a short delay to ensure signout is fully processed
      setTimeout(() => {
        isSigningUpRef.current = false;
      }, 200);
    }
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserData(null);
  }

  const value = {
    currentUser,
    userData,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

