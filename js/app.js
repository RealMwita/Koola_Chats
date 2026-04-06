import { db, firestoreTools } from './firebase-init.js';
import { loginOrRegister, logout, onAuthChange, authState } from './auth.js';
import { UI } from './ui.js';
// WebRTC will be imported within UI or globally.
import './webrtc.js';

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Initial Splash Screen Teardown
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
    }, 1500);

    // 2. Initialize UI Hooks
    UI.init();

    // 3. Bind Auth Modal Login Button
    const authSubmit = document.getElementById('auth-submit-btn');
    if (authSubmit) {
        authSubmit.addEventListener('click', () => {
            const email = document.getElementById('auth-email').value;
            const pass = document.getElementById('auth-password').value;
            loginOrRegister(email, pass);
        });
    }
    
    // 4. Bind Sidebar Settings and Logout
    const profileBtn = document.getElementById('profile-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            const out = confirm("Log out of Koola Web?");
            if(out) logout();
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            document.getElementById('subpage-container').classList.remove('hidden');
        });
    }

    // 5. Auth State Observer Hook
    onAuthChange((user, profileData) => {
        if (user && profileData) {
            // User Logged In successfully
            document.getElementById('app-container').classList.remove('hidden');
            
            // Set Avatars and Settings Profile Data
            const avatarTxt = document.getElementById('my-avatar-placeholder');
            const setAvatar = document.getElementById('settings-avatar');
            const setName = document.getElementById('settings-name');
            const setEmail = document.getElementById('settings-email');
            
            const firstLetter = profileData.name.charAt(0).toUpperCase();

            if(avatarTxt) avatarTxt.textContent = firstLetter;
            if(setAvatar) setAvatar.textContent = firstLetter;
            if(setName) setName.textContent = profileData.name;
            if(setEmail) setEmail.textContent = profileData.email;

            // Start global chat listener
            UI.showLoadingChats();
            const formattedEmail = user.email.trim().toLowerCase();
            const chatsRef = firestoreTools.collection(db, "chats");
            const q = firestoreTools.query(chatsRef, firestoreTools.where("participants", "array-contains", formattedEmail));
            
            if(UI.unsubscribeChat) UI.unsubscribeChat();
            UI.unsubscribeChat = firestoreTools.onSnapshot(q, (snapshot) => {
                const docsArr = [];
                snapshot.forEach(docSnap => { docsArr.push({ id: docSnap.id, ...docSnap.data() }); });
                
                // Purely local bypass of compound indexing
                docsArr.sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
                    const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
                    return timeB - timeA;
                });
                
                UI.renderChatList(docsArr);
                
                // Broadcast chats arrays to WebRTC engine if needed to attach listeners
                if(window.koolaRTC && window.koolaRTC.attachGlobalCallListeners) {
                    window.koolaRTC.attachGlobalCallListeners(docsArr);
                }
            });
            
        } else {
            // User Logged Out
            document.getElementById('app-container').classList.add('hidden');
            if(UI.unsubscribeChat) UI.unsubscribeChat();
            UI.activeChatId = null;
            UI.els.emptyStateView.classList.remove('hidden');
            UI.els.messagingContainer.classList.add('hidden');
        }
    });

});
