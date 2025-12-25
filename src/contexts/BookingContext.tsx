"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Seat, SeatStatus, Gender, Booking } from "@/types/booking";
import { useAuth } from "./AuthContext";

interface BookingContextType {
  seats: Seat[];
  selectedSeat: Seat | null;
  lockedSeat: Seat | null;
  lockTimeRemaining: number;
  loading: boolean;
  selectSeat: (seat: Seat) => Promise<boolean>;
  confirmBooking: () => Promise<void>;
  cancelLock: () => Promise<void>;
  checkGenderCompatibility: (seat: Seat, userGender: Gender) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

const LOCK_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const TRIP_ID = "default-trip"; // You can make this dynamic later

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [lockedSeat, setLockedSeat] = useState<Seat | null>(null);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize seats (you can fetch from Firestore or generate)
  useEffect(() => {
    initializeSeats();
  }, []);

  // Listen to real-time seat updates
  useEffect(() => {
    if (!userData) return;

    const seatsRef = collection(db, "trips", TRIP_ID, "seats");
    const unsubscribe = onSnapshot(seatsRef, (snapshot) => {
      const seatsData: Seat[] = [];
      snapshot.forEach((doc) => {
        seatsData.push({ id: doc.id, ...doc.data() } as Seat);
      });
      setSeats(seatsData.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.column - b.column;
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  // Countdown timer for locked seat
  useEffect(() => {
    if (!lockedSeat || !lockedSeat.lockedUntil) return;

    const interval = setInterval(() => {
      const remaining = lockedSeat.lockedUntil! - Date.now();
      if (remaining <= 0) {
        setLockTimeRemaining(0);
        setLockedSeat(null);
        clearInterval(interval);
        // Release the lock if expired
        if (lockedSeat.id) {
          releaseLock(lockedSeat.id);
        }
      } else {
        setLockTimeRemaining(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [lockedSeat]);

  async function initializeSeats() {
    const tripRef = doc(db, "trips", TRIP_ID);
    const tripDoc = await getDoc(tripRef);

    if (!tripDoc.exists()) {
      // Create default seats layout (5 rows x 4 columns)
      const defaultSeats: Omit<Seat, "id">[] = [];
      for (let row = 1; row <= 5; row++) {
        for (let col = 1; col <= 4; col++) {
          defaultSeats.push({
            number: `${row}-${col}`,
            row,
            column: col,
            gender: null, // Unisex by default
            status: "available",
          });
        }
      }

      // Set some gender-specific seats as example
      defaultSeats[0].gender = "male";
      defaultSeats[1].gender = "female";
      defaultSeats[2].gender = "male";
      defaultSeats[3].gender = "female";

      // Create trip document
      await setDoc(tripRef, {
        id: TRIP_ID,
        createdAt: serverTimestamp(),
      });

      // Create seats
      const seatsRef = collection(db, "trips", TRIP_ID, "seats");
      for (const seat of defaultSeats) {
        await setDoc(doc(seatsRef), seat);
      }
    }
  }

  function checkGenderCompatibility(seat: Seat, userGender: Gender): boolean {
    if (seat.gender === null) return true; // Unisex seat
    return seat.gender === userGender;
  }

  async function selectSeat(seat: Seat): Promise<boolean> {
    if (!userData) return false;

    // Check if seat is available
    if (seat.status !== "available") {
      return false;
    }

    // Check gender compatibility
    if (!checkGenderCompatibility(seat, userData.gender)) {
      alert(`This seat is reserved for ${seat.gender === "male" ? "males" : "females"}`);
      return false;
    }

    // If the seat is gender-specific and matches user's gender, allow booking
    // (no need to check adjacent seats for gender-specific seats)
    if (seat.gender !== null && seat.gender === userData.gender) {
      // Allow booking gender-specific seats
    } else {
      // For unisex seats, check adjacent seats for conflicts
      const adjacentSeats = seats.filter(
        (s) =>
          s.id !== seat.id &&
          ((s.row === seat.row && Math.abs(s.column - seat.column) === 1) ||
            (s.column === seat.column && Math.abs(s.row - seat.row) === 1))
      );

      // If user is male, adjacent seats shouldn't be female-only (booked)
      if (userData.gender === "male") {
        const hasFemaleOnly = adjacentSeats.some(
          (s) => s.gender === "female" && s.status === "booked"
        );
        if (hasFemaleOnly) {
          alert("Cannot book this seat due to gender restrictions with adjacent seats");
          return false;
        }
      }

      // If user is female, adjacent seats shouldn't be male-only (booked)
      if (userData.gender === "female") {
        const hasMaleOnly = adjacentSeats.some(
          (s) => s.gender === "male" && s.status === "booked"
        );
        if (hasMaleOnly) {
          alert("Cannot book this seat due to gender restrictions with adjacent seats");
          return false;
        }
      }
    }

    setSelectedSeat(seat);

    // Lock the seat
    const lockUntil = Date.now() + LOCK_DURATION;
    const seatRef = doc(db, "trips", TRIP_ID, "seats", seat.id);
    await updateDoc(seatRef, {
      status: "locked",
      lockedBy: userData.id,
      lockedUntil: lockUntil,
    });

    setLockedSeat({ ...seat, status: "locked", lockedBy: userData.id, lockedUntil: lockUntil });
    setLockTimeRemaining(LOCK_DURATION);

    return true;
  }

  async function confirmBooking() {
    if (!userData || !lockedSeat) return;

    const seatRef = doc(db, "trips", TRIP_ID, "seats", lockedSeat.id);
    await updateDoc(seatRef, {
      status: "booked",
      bookedBy: userData.id,
      lockedBy: null,
      lockedUntil: null,
    });

    // Create booking record
    const bookingRef = doc(collection(db, "bookings"));
    const booking: Booking = {
      id: bookingRef.id,
      userId: userData.id,
      seatId: lockedSeat.id,
      tripId: TRIP_ID,
      createdAt: Date.now(),
      confirmedAt: Date.now(),
    };
    await setDoc(bookingRef, booking);

    setLockedSeat(null);
    setSelectedSeat(null);
    setLockTimeRemaining(0);

    // Redirect to confirmation page
    router.push(`/confirmation?id=${bookingRef.id}`);
  }

  async function cancelLock() {
    if (!lockedSeat) return;

    await releaseLock(lockedSeat.id);
    setLockedSeat(null);
    setSelectedSeat(null);
    setLockTimeRemaining(0);
  }

  async function releaseLock(seatId: string) {
    const seatRef = doc(db, "trips", TRIP_ID, "seats", seatId);
    const seatDoc = await getDoc(seatRef);
    if (seatDoc.exists()) {
      const seatData = seatDoc.data();
      // Only release if we're the one who locked it
      if (seatData.lockedBy === userData?.id && seatData.status === "locked") {
        await updateDoc(seatRef, {
          status: "available",
          lockedBy: null,
          lockedUntil: null,
        });
      }
    }
  }

  const value = {
    seats,
    selectedSeat,
    lockedSeat,
    lockTimeRemaining,
    loading,
    selectSeat,
    confirmBooking,
    cancelLock,
    checkGenderCompatibility,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

