import { db, auth, authTools, firestoreTools } from './firebase-init.js';

export const authState = {
    user: null,
    profileData: null
};

const authListeners = [];

export function onAuthChange(callback) {
    authListeners.push(callback);
}

function notifyListeners() {
    authListeners.forEach(cb => cb(authState.user, authState.profileData));
}

if (window.koolaFIREBASE_ACTIVE) {
    authTools.onAuthStateChanged(auth, async (user) => {
        if (user) {
            authState.user = user;
            await syncUserProfile(user, user.displayName);
        } else {
            authState.user = null;
            authState.profileData = null;
            document.getElementById('auth-overlay')?.classList.remove('hidden');
            document.getElementById('app-container')?.classList.add('hidden');
        }
        notifyListeners();
    });
}

export function showAuthError(message) {
    const banner = document.getElementById('auth-error-banner');
    const textEl = document.getElementById('auth-error-text');
    if (banner && textEl) {
        textEl.textContent = message;
        banner.classList.remove('hidden');
        setTimeout(() => {
            banner.classList.add('hidden');
        }, 5000);
    } else {
        alert(message);
    }
}

export function hideAuthError() {
    const banner = document.getElementById('auth-error-banner');
    if (banner) banner.classList.add('hidden');
}

function startLoading() {
    hideAuthError();
    document.getElementById('auth-loader')?.classList.remove('hidden');
    document.getElementById('signin-form')?.classList.add('hidden');
    document.getElementById('register-form')?.classList.add('hidden');
}

function stopLoading(returnToTab = 'signin') {
    document.getElementById('auth-loader')?.classList.add('hidden');
    if (returnToTab === 'signin') {
        document.getElementById('signin-form')?.classList.remove('hidden');
        document.getElementById('register-form')?.classList.add('hidden');
    } else {
        document.getElementById('register-form')?.classList.remove('hidden');
        document.getElementById('signin-form')?.classList.add('hidden');
    }
}

async function syncUserProfile(user, customName) {
    const userRef = firestoreTools.doc(db, "users", user.uid);
    const userDoc = await firestoreTools.getDoc(userRef);
    const formattedEmail = user.email ? user.email.trim().toLowerCase() : "";
    
    if (!userDoc.exists()) {
        const username = customName || user.displayName || formattedEmail.split('@')[0];
        const profilePayload = {
            uid: user.uid,
            email: formattedEmail,
            phoneNumber: "",
            name: username,
            displayName: username,
            bio: "Available",
            lastLogin: firestoreTools.serverTimestamp()
        };
        await firestoreTools.setDoc(userRef, profilePayload);
        authState.profileData = profilePayload;
    } else {
        const existingData = userDoc.data();
        const updatedPayload = { lastLogin: firestoreTools.serverTimestamp() };
        
        if (customName && (!existingData.name || existingData.name === formattedEmail.split('@')[0])) {
            updatedPayload.name = customName;
            updatedPayload.displayName = customName;
            existingData.name = customName;
            existingData.displayName = customName;
        }
        await firestoreTools.updateDoc(userRef, updatedPayload);
        authState.profileData = existingData;
    }
}

export async function loginUser(email, password, rememberMe = true) {
    if (!window.koolaFIREBASE_ACTIVE) return showAuthError("Firebase is not configured.");
    if (!email || !password) return showAuthError("Please enter your email and password.");

    const formattedEmail = email.trim().toLowerCase();
    startLoading();
    try {
        await authTools.signInWithEmailAndPassword(auth, formattedEmail, password);
        document.getElementById('auth-overlay')?.classList.add('hidden');
    } catch (err) {
        stopLoading('signin');
        let msg = err.message;
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
            msg = "Invalid email address or password. Please try again.";
        } else if (err.code === 'auth/too-many-requests') {
            msg = "Too many failed attempts. Please wait a moment and try again.";
        }
        showAuthError(msg);
    }
}

export async function registerUser(name, email, password) {
    if (!window.koolaFIREBASE_ACTIVE) return showAuthError("Firebase is not configured.");
    if (!name || !name.trim()) return showAuthError("Please enter your full name.");
    if (!email || !password || password.length < 6) return showAuthError("Password must be at least 6 characters.");

    const formattedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    startLoading();
    try {
        const userCredential = await authTools.createUserWithEmailAndPassword(auth, formattedEmail, password);
        const user = userCredential.user;
        
        // Set Firebase Auth Profile Name
        if (authTools.updateProfile && user) {
            await authTools.updateProfile(user, { displayName: cleanName }).catch(() => {});
        }
        
        // Sync custom profile name directly
        await syncUserProfile(user, cleanName);
        
        document.getElementById('auth-overlay')?.classList.add('hidden');
    } catch (err) {
        stopLoading('register');
        let msg = err.message;
        if (err.code === 'auth/email-already-in-use') {
            msg = "This email is already registered. Please sign in instead.";
        } else if (err.code === 'auth/invalid-email') {
            msg = "Please provide a valid email address.";
        } else if (err.code === 'auth/weak-password') {
            msg = "Your password is too weak. Please choose a stronger password.";
        }
        showAuthError(msg);
    }
}

// Backward compatibility helper if needed
export async function loginOrRegister(email, password) {
    return loginUser(email, password);
}

export async function logout() {
    if (window.koolaFIREBASE_ACTIVE) {
        await authTools.signOut(auth);
    }
}
