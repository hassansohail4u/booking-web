"use client";

import { useBooking } from "@/contexts/BookingContext";
import CountdownTimer from "./CountdownTimer";

export default function BookingConfirmation() {
  const { lockedSeat, lockTimeRemaining, confirmBooking, cancelLock } = useBooking();

  if (!lockedSeat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Confirm Your Booking
        </h2>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Seat Number</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {lockedSeat.number}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Time Remaining:
            </p>
            <div className="flex justify-center">
              <CountdownTimer timeRemaining={lockTimeRemaining} />
            </div>
            <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
              Please confirm within the time limit
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={confirmBooking}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            Confirm Booking
          </button>
          <button
            onClick={cancelLock}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

