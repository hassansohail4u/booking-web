"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, limit, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking, Seat } from "@/types/booking";

function ConfirmationContent() {
  const { currentUser, userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    async function fetchBooking() {
      try {
        const bookingId = searchParams.get("id");
        if (bookingId) {
          // Fetch booking by ID
          const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
          if (bookingDoc.exists() && bookingDoc.data().userId === currentUser?.uid) {
            const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
            setBooking(bookingData);

            // Fetch seat details
            const seatDoc = await getDoc(
              doc(db, "trips", bookingData.tripId, "seats", bookingData.seatId)
            );
            if (seatDoc.exists()) {
              setSeat({ id: seatDoc.id, ...seatDoc.data() } as Seat);
            }
          } else {
            // Fallback: get latest booking
            const bookingsRef = collection(db, "bookings");
            const q = query(
              bookingsRef,
              where("userId", "==", currentUser?.uid),
              orderBy("confirmedAt", "desc"),
              limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const bookingData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Booking;
              setBooking(bookingData);

              const seatDoc = await getDoc(
                doc(db, "trips", bookingData.tripId, "seats", bookingData.seatId)
              );
              if (seatDoc.exists()) {
                setSeat({ id: seatDoc.id, ...seatDoc.data() } as Seat);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [currentUser, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your seat has been successfully booked
          </p>
        </div>

        {seat && booking && (
          <div className="space-y-4 mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Seat Number</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {seat.number}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Passenger</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {userData?.name}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking ID</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                {booking.id}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/seat-selection")}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Book Another Seat
        </button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

