import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    deleteUser,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithRedirect,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider
} from "firebase/auth";
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    writeBatch,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);

// إعداد المزودات (Providers)
export const googleProvider = new GoogleAuthProvider();

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.setCustomParameters({
    'display': 'popup'
});

export const linkedinProvider = new OAuthProvider('linkedin.com');
export const twitterProvider = new OAuthProvider('twitter.com');
export const instagramProvider = new OAuthProvider('instagram.com');

// تصدير جميع الدوال للاستخدام بداخل التطبيق
export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    deleteUser,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    signInWithPopup,
    signInWithRedirect,
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    writeBatch,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
};
