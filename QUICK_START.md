# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Create **Firestore Database** (test mode)
4. Copy your Firebase config

### Step 3: Add Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Step 4: Set Firestore Security Rules

Go to Firestore → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /trips/{tripId} {
      allow read: if request.auth != null;
      match /seats/{seatId} {
        allow read: if request.auth != null;
        allow update: if request.auth != null && 
          (request.resource.data.lockedBy == request.auth.uid || 
           resource.data.lockedBy == request.auth.uid);
      }
    }
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}
```

### Step 5: Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 User Flow

1. **Sign Up/Login** - Create account with email, password, name, and gender
2. **Select Seat** - View available seats and click to select
3. **Lock Seat** - Seat is locked for 2 minutes (others see it as locked)
4. **Confirm Booking** - Click confirm within the time limit
5. **View Confirmation** - See booking details

## 🎯 Features Implemented

✅ User authentication (Firebase Auth)  
✅ Real-time seat status updates (Firestore)  
✅ Temporary seat locking (2 minutes)  
✅ Gender-based seat rules  
✅ Countdown timer  
✅ Booking confirmation  
✅ Responsive UI with dark mode  

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Firebase** - Authentication & Firestore
- **Tailwind CSS** - Styling
- **React Context** - State management

## 📁 Key Files

- `src/app/page.tsx` - Login/Signup page
- `src/app/seat-selection/page.tsx` - Seat selection interface
- `src/app/confirmation/page.tsx` - Booking confirmation
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/contexts/BookingContext.tsx` - Booking & seat management
- `src/components/SeatGrid.tsx` - Seat visualization
- `src/components/CountdownTimer.tsx` - Lock timer

## 🐛 Troubleshooting

**"Firebase configuration not found"**
- Check `.env.local` exists and has all variables
- Restart dev server after adding env vars

**"Permission denied"**
- Check Firestore security rules
- Ensure user is authenticated

**Seats not showing**
- Check Firestore console for data
- Seats are auto-created on first load

## 📚 Next Steps

- Customize seat layout (rows/columns)
- Add multiple trips/routes
- Implement payment integration
- Add booking history page
- Email notifications

