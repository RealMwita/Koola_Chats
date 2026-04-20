// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc, getDoc, getDocs, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAPe-5mhJPcVxVJa70UfMJ8X2yO-BuKNao",
    authDomain: "koola-chats.firebaseapp.com",
    projectId: "koola-chats",
    storageBucket: "koola-chats.firebasestorage.app",
    messagingSenderId: "431438483019",
    appId: "1:431438483019:web:7195b755aadff7629407ce",
    measurementId: "G-PCNG63LGJP"
};

let app, db, auth, storage;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);
        window.koolaFIREBASE_ACTIVE = true;
    } else {
        window.koolaFIREBASE_ACTIVE = false;
    }
} catch (e) {
    console.warn("Firebase initialization failed.", e);
    window.koolaFIREBASE_ACTIVE = false;
}

export { db, auth, storage };
export const firestoreTools = { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc, getDoc, getDocs, updateDoc, where };
export const authTools = { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile };
export const storageTools = { ref, uploadBytes, getDownloadURL };
