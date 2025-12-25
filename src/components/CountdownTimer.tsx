"use client";

interface CountdownTimerProps {
  timeRemaining: number; // in milliseconds
}

export default function CountdownTimer({ timeRemaining }: CountdownTimerProps) {
  const seconds = Math.ceil(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const isWarning = seconds <= 30;

  return (
    <div
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-mono text-lg font-bold ${
        isWarning
          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
      }`}
    >
      <span className="text-2xl">
        {String(minutes).padStart(2, "0")}:{String(remainingSeconds).padStart(2, "0")}
      </span>
    </div>
  );
}

