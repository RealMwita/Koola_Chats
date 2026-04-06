// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyAPe-5mhJPcVxVJa70UfMJ8X2yO-BuKNao",
    authDomain: "koola-chats.firebaseapp.com",
    projectId: "koola-chats",
    storageBucket: "koola-chats.firebasestorage.app",
    messagingSenderId: "431438483019",
    appId: "1:431438483019:web:7195b755aadff7629407ce",
    measurementId: "G-PCNG63LGJP"
};

let app, db;

try {
    // Only attempt if the user has replaced the dummy 'YOUR_API_KEY'
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        window.koolaFIREBASE_ACTIVE = true;
        console.log("Firebase initialized successfully.");
    } else {
        window.koolaFIREBASE_ACTIVE = false;
        console.log("Firebase is skipping initialization (Waiting for real credentials). Using localized fallback.");
    }
} catch (e) {
    console.warn("Firebase initialization failed.", e);
    window.koolaFIREBASE_ACTIVE = false;
}

// Map exports to the window object so Vanilla JS views can use them without being strict ES Modules.
window.koolaDb = db;
window.koolaFirestore = {
    collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc, getDoc
};
