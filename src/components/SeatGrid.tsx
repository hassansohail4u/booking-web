"use client";

import { Seat, Gender } from "@/types/booking";
import { useBooking } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";

interface SeatGridProps {
  seats: Seat[];
}

export default function SeatGrid({ seats }: SeatGridProps) {
  const { selectSeat, lockedSeat } = useBooking();
  const { userData } = useAuth();

  function getSeatColor(seat: Seat): string {
    if (seat.status === "booked") {
      return "bg-gray-400 dark:bg-gray-600 cursor-not-allowed";
    }
    if (seat.status === "locked") {
      if (lockedSeat?.id === seat.id) {
        return "bg-yellow-400 dark:bg-yellow-600 hover:bg-yellow-500 dark:hover:bg-yellow-500 cursor-pointer";
      }
      return "bg-orange-300 dark:bg-orange-700 cursor-not-allowed opacity-60";
    }
    if (seat.gender === "male") {
      return "bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 cursor-pointer";
    }
    if (seat.gender === "female") {
      return "bg-pink-200 dark:bg-pink-800 hover:bg-pink-300 dark:hover:bg-pink-700 cursor-pointer";
    }
    return "bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 cursor-pointer";
  }

  function getSeatLabel(seat: Seat): string {
    if (seat.status === "booked") return "Booked";
    if (seat.status === "locked") {
      if (lockedSeat?.id === seat.id) return "Your Lock";
      return "Locked";
    }
    if (seat.gender === "male") return "Male Only";
    if (seat.gender === "female") return "Female Only";
    return "Available";
  }

  async function handleSeatClick(seat: Seat) {
    if (seat.status === "available" && userData) {
      await selectSeat(seat);
    }
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  return (
    <div className="space-y-2">
      {Object.entries(seatsByRow)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([row, rowSeats]) => (
          <div key={row} className="flex gap-2 justify-center">
            {rowSeats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                disabled={seat.status !== "available"}
                className={`${getSeatColor(seat)} w-16 h-16 rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all transform hover:scale-105 disabled:transform-none disabled:hover:scale-100`}
                title={getSeatLabel(seat)}
              >
                <span className="text-xs">{seat.number}</span>
                {seat.gender && (
                  <span className="text-[10px] opacity-75">
                    {seat.gender === "male" ? "♂" : "♀"}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
    </div>
  );
}

