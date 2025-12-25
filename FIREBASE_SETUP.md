# Firebase Setup Guide

## Step-by-Step Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Click **Save**

### 3. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (for development)
4. Choose a location for your database
5. Click **Enable**

### 4. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 5. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 6. Firestore Security Rules

Go to **Firestore Database** > **Rules** and update:

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

Click **Publish** to save the rules.

### 7. Firestore Indexes (Optional)

If you encounter index errors, Firebase will provide a link to create the required indexes. Click the link and create them.

### 8. Test Your Setup

1. Run `npm run dev`
2. Try signing up a new user
3. Check Firebase Console to see if user appears in Authentication
4. Check Firestore to see if data is being created

## Database Structure

The app will automatically create:

```
firestore/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── email: string
│       ├── name: string
│       └── gender: "male" | "female"
├── trips/
│   └── default-trip/
│       └── seats/
│           └── {seatId}/
│               ├── number: string
│               ├── row: number
│               ├── column: number
│               ├── gender: "male" | "female" | null
│               ├── status: "available" | "locked" | "booked"
│               ├── lockedBy: string (userId)
│               ├── lockedUntil: number (timestamp)
│               └── bookedBy: string (userId)
└── bookings/
    └── {bookingId}/
        ├── id: string
        ├── userId: string
        ├── seatId: string
        ├── tripId: string
        ├── createdAt: number
        └── confirmedAt: number
```

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set in `.env.local`
- Restart your development server after adding environment variables

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Make sure you're authenticated

### "Index required"
- Click the link in the error message to create the required index
- Wait for the index to build (may take a few minutes)

