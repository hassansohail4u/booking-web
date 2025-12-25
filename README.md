# Seat Booking System with Temporary Lock

A Next.js application with Firebase integration for booking seats with temporary lock functionality and gender-based rules.

## Features

- 🔐 User Authentication (Login/Signup)
- 🪑 Real-time Seat Selection
- ⏱️ Temporary Seat Locking (2 minutes)
- 👥 Gender-based Seat Rules
- ⏰ Countdown Timer
- ✅ Booking Confirmation
- 🔄 Real-time Updates

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication** with Email/Password provider
4. Create a **Firestore Database** (start in test mode for development)
5. Get your Firebase configuration from Project Settings > General > Your apps

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trips and seats - read for all authenticated users, write with restrictions
    match /trips/{tripId} {
      allow read: if request.auth != null;
      match /seats/{seatId} {
        allow read: if request.auth != null;
        allow update: if request.auth != null && 
          (request.resource.data.lockedBy == request.auth.uid || 
           resource.data.lockedBy == request.auth.uid);
      }
    }
    
    // Bookings - users can read their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx               # Home/Login page
│   │   ├── seat-selection/        # Seat selection page
│   │   ├── confirmation/          # Booking confirmation page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── LoginForm.tsx          # Authentication form
│   │   ├── SeatGrid.tsx           # Seat selection grid
│   │   ├── CountdownTimer.tsx     # Lock countdown timer
│   │   └── BookingConfirmation.tsx # Booking confirmation modal
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Authentication context
│   │   └── BookingContext.tsx     # Booking state management
│   ├── lib/
│   │   └── firebase.ts            # Firebase configuration
│   └── types/
│       └── booking.ts             # TypeScript types
├── public/                        # Static assets
├── next.config.mjs                # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

## How It Works

1. **User Authentication**: Users sign up/login with email, password, name, and gender
2. **Seat Selection**: Users see all seats with their current status (available, locked, booked)
3. **Gender Rules**: Seats can be gender-specific (male/female) or unisex
4. **Temporary Lock**: When a user selects a seat, it's locked for 2 minutes
5. **Real-time Updates**: Other users see locked seats in real-time
6. **Countdown Timer**: User sees remaining time to confirm booking
7. **Booking Confirmation**: User confirms within time limit or lock expires
8. **Final Confirmation**: Success screen with booking details

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

