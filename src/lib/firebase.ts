// Firebase клиент для сайта (чтение Firestore на клиенте).
// Конфигурация из env (см. .env.example). Окружение dev/prod выбирается
// переменной NEXT_PUBLIC_ENV (default dev).

import {initializeApp, getApps, FirebaseApp} from 'firebase/app';
import {getFirestore, Firestore} from 'firebase/firestore';

const env = process.env.NEXT_PUBLIC_ENV ?? 'dev';
const isProd = env === 'prod';

const firebaseConfig = {
  apiKey: isProd
    ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY_PROD ?? ''
    : process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: isProd
    ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PROD ?? ''
    : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: isProd
    ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_PROD ?? ''
    : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: isProd
    ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_PROD ?? ''
    : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: isProd
    ? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_PROD ?? ''
    : process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: isProd
    ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID_PROD ?? ''
    : process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}