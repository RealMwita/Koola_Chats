import { db, auth, authTools, firestoreTools } from './firebase-init.js';

export const authState = {
    user: null,
    profileData: null
};

// Listeners array for notifying other modules when auth state changes
const authListeners = [];

export function onAuthChange(callback) {
    authListeners.push(callback);
}

function notifyListeners() {
    authListeners.forEach(cb => cb(authState.user, authState.profileData));
}

// Global Auth Observer
if (window.koolaFIREBASE_ACTIVE) {
    authTools.onAuthStateChanged(auth, async (user) => {
        if (user) {
            authState.user = user;
            await syncUserProfile(user);
        } else {
            authState.user = null;
            authState.profileData = null;
            document.getElementById('auth-overlay').classList.remove('hidden');
        }
        notifyListeners();
    });
}

function stopLoading() {
    document.getElementById('auth-loader').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

function startLoading() {
    document.getElementById('auth-loader').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
}

async function syncUserProfile(user) {
    const userRef = firestoreTools.doc(db, "users", user.uid);
    const userDoc = await firestoreTools.getDoc(userRef);
    if (!userDoc.exists()) {
        const username = user.email.split('@')[0];
        const profilePayload = {
            uid: user.uid,
            email: user.email,
            name: username,
            displayName: username, // For searchable profile names
            bio: "Available",
            lastLogin: firestoreTools.serverTimestamp()
        };
        await firestoreTools.setDoc(userRef, profilePayload);
        authState.profileData = profilePayload;
    } else {
        await firestoreTools.updateDoc(userRef, { lastLogin: firestoreTools.serverTimestamp() });
        authState.profileData = userDoc.data();
    }
}

export async function loginOrRegister(email, password) {
    if (!window.koolaFIREBASE_ACTIVE) return alert("Firebase not configured.");
    if (!email || !password || password.length < 6) return alert("Invalid credentials (min 6 chars)");

    startLoading();
    try {
        // Try sign in
        await authTools.signInWithEmailAndPassword(auth, email, password);
        document.getElementById('auth-overlay').classList.add('hidden');
    } catch(err) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            // Attempt Registration if user not found
            try {
                await authTools.createUserWithEmailAndPassword(auth, email, password);
                document.getElementById('auth-overlay').classList.add('hidden');
            } catch(regErr) {
                alert("Auth Error: " + regErr.message);
            }
        } else {
            alert("Login Error: " + err.message);
        }
    } finally {
        stopLoading();
    }
}

export async function logout() {
    if (window.koolaFIREBASE_ACTIVE) {
        await authTools.signOut(auth);
    }
}
