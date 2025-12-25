export type Gender = "male" | "female";

export type SeatStatus = "available" | "locked" | "booked";

export interface Seat {
  id: string;
  number: string;
  row: number;
  column: number;
  gender: Gender | null; // null means unisex/available for any gender
  status: SeatStatus;
  lockedBy?: string; // userId who locked it
  lockedUntil?: number; // timestamp
  bookedBy?: string; // userId who booked it
}

export interface User {
  id: string;
  email: string;
  name: string;
  gender: Gender;
}

export interface Booking {
  id: string;
  userId: string;
  seatId: string;
  tripId: string;
  createdAt: number;
  confirmedAt: number;
}

