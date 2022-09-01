import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

// TODO: Replace the following with your app's Firebase project configuration
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.MESSAGEING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.NEXT_PUBLIC_G_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

export const functions = getFunctions(app);
// const store = process.env.NODE_ENV !== "development" ? app : undefined;
export const db = getFirestore(app);

if (process.env.NODE_ENV === "development") {
  // connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
