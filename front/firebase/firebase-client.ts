import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: `${process.env.PROJECT_ID}.firebaseapp.com`,
  databaseURL: `DATABASE_NAME{process.env.REGION}.firebaseio.com`,
  projectId: process.env.PROJECT_ID,
  storageBucket: `${process.env.PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.MESSAGEING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.G_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
