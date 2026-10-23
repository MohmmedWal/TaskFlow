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
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCBTYky3dwmoz1xk6nwHJ6wieZhE45FDA4",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "taskflow-16b4a.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "taskflow-16b4a",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "taskflow-16b4a.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "891903123781",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:891903123781:web:cc9d9226fe368d5f7f5e2c",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SKGC8XHJFT"
};

const app = initializeApp(firebaseConfig);

let analyticsInstance = null;
if (typeof window !== "undefined") {
    try {
        analyticsInstance = getAnalytics(app);
    } catch (error) {
        console.warn("Firebase Analytics could not be initialized:", error);
    }
}
export const analytics = analyticsInstance;
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
