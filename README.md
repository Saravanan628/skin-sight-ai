# SkinSight AI - AI-Powered Dermatology Assistant

SkinSight AI is a modern, AI-driven web application designed to help users analyze potential skin conditions. By uploading images of skin lesions or irregularities, users receive preliminary AI-based assessments, providing insights into their skin health. While the app offers guidance, professional medical consultation is recommended for definitive diagnoses.

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)  
- **Language:** [TypeScript](https://www.typescriptlang.org/)  
- **UI:** [React](https://react.dev/)  
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)  
- **Hosting:** [Firebase Hosting](https://firebase.google.com/docs/hosting)  
- **Image Processing:** [OpenCV](https://opencv.org/)  
- **Machine Learning:** [PyTorch](https://pytorch.org/), [TensorFlow](https://www.tensorflow.org/)  

## Features

### For Users
- **Image Upload:** Users can upload images of skin lesions or irregularities.  
- **AI Analysis:** The system analyzes the images to detect possible skin conditions.  
- **Preliminary Diagnosis:** Provides potential conditions with confidence scores.  
- **Responsive Interface:** User-friendly UI built with Next.js and Tailwind CSS.  


## Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 14 or later recommended)  
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)  
- [Firebase CLI](https://firebase.google.com/docs/cli)

### Firebase Configuration

1. **Create a new Firebase project** in the [Firebase Console](https://console.firebase.google.com/).

2. In your project, go to **Project settings** > **General**.

3. Under "Your apps", create a new **Web app**.

4. Copy the `firebaseConfig` object provided.

5. Create a new file named `.env.local` in the root of the SkinSight AI project.

6. Add the configuration values to your `.env.local` file, prefixing each key with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
```
7. **Enable Firestore Database:**  
   - Go to **Firestore Database** and click **Create database**.  
   - Start in **production mode** (default security rules deny all access).  
   - Firestore rules can be deployed later using:

```bash
firebase deploy --only firestore


