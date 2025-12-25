"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import SeatGrid from "@/components/SeatGrid";
import BookingConfirmation from "@/components/BookingConfirmation";
import CountdownTimer from "@/components/CountdownTimer";

export default function SeatSelectionPage() {
  const { currentUser, userData, loading: authLoading, logout } = useAuth();
  const { seats, lockedSeat, lockTimeRemaining, loading: bookingLoading } = useBooking();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Seat Selection
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome, {userData?.name} ({userData?.gender})
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Seat Legend
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Male Only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-200 dark:bg-pink-800 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Female Only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 dark:bg-yellow-600 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Your Lock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Booked</span>
            </div>
          </div>
        </div>

        {/* Locked Seat Info */}
        {lockedSeat && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Seat {lockedSeat.number} is locked
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confirm your booking before time runs out
                </p>
              </div>
              <CountdownTimer timeRemaining={lockTimeRemaining} />
            </div>
          </div>
        )}

        {/* Seat Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
            Select Your Seat
          </h2>
          <SeatGrid seats={seats} />
        </div>

        {/* Booking Confirmation Modal */}
        <BookingConfirmation />
      </div>
    </div>
  );
}

