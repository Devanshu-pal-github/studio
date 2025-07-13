
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCE1_xvtHxqu43NdkPSBMBD5N51LmwSQkI",
  authDomain: "projectcompas-gdg.firebaseapp.com",
  projectId: "projectcompas-gdg",
  storageBucket: "projectcompas-gdg.appspot.com",
  messagingSenderId: "342236161917",
  appId: "1:342236161917:web:b84e84a666baa7b9ebce14",
  measurementId: "G-54QMMFJ03Q"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Conditionally initialize Analytics only on the client side
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { auth, db, analytics };
