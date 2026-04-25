// Inicialización de Firebase. Las credenciales se leen de variables de entorno.
// Copia .env.example a .env.local y rellena los valores, o configúralos en Vercel.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const DATA_MODE = (import.meta.env.VITE_DATA_MODE ?? 'firebase') as 'firebase' | 'mock';
export const IS_MOCK = DATA_MODE === 'mock' || !firebaseConfig.apiKey;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _analytics: Analytics | null = null;

export function getFirebase() {
  if (IS_MOCK) {
    throw new Error('Firebase no inicializado: estás en modo mock. Configura .env.local.');
  }
  if (!_app) {
    _app = initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    // Analytics solo se inicializa en navegador y si está soportado (https + consentimiento).
    isSupported().then((ok) => {
      if (ok && _app && firebaseConfig.measurementId) _analytics = getAnalytics(_app);
    });
  }
  return { app: _app!, auth: _auth!, db: _db!, analytics: _analytics };
}
