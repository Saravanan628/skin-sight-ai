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
```
### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
     ```bash
      npm run dev
      ```
      The application will start locally, usually at http://localhost:3000

## Deployment to Firebase App Hosting

This application is configured for easy deployment to **Firebase App Hosting**. Follow these steps to deploy your application.

### 1. Install and Log in to Firebase CLI
If you haven't already, install the Firebase Command Line Interface and log in.

```bash
npm install -g firebase-tools
firebase login
```
### 2. Initialize Firebase in Your Project
If you haven't yet connected your local project to Firebase, run the `init` command.

```bash
firebase init
```
-Select Firestore and Hosting.
-Choose "Use an existing project" and select your Firebase project.
-Accept default Firestore rules (firestore.rules).
-Set your public directory (e.g., out or build for Next.js static export).
-Skip GitHub continuous deployment if you want to deploy manually.

### 3. Deploy Your Application
After initialization and rules deployment, you can deploy the entire application with a single command:

```bash
firebase deploy
```
After deployment, the Firebase CLI will provide the live URL of your SkinSight AI application.

### 📸 Screenshots

- **Main Page:**  
![Main Page](./public/screenshots/main%20page.png)

- **Analysis Result:**  
![Analysis Result](./public/screenshots/analysis%20result.png)

- **Medicine Suggestion:**  
![Medicine Suggestion](./public/screenshots/medicine%20suggestion.png)

- **Yoga Suggestion:**  
![Yoga Suggestion](./public/screenshots/yoga%20suggestion.png)

