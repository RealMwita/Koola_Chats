import { db, firestoreTools } from './firebase-init.js';
import { loginUser, registerUser, logout, onAuthChange, authState } from './auth.js';
import { UI } from './ui.js';
import './webrtc.js';

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Initial Splash Screen Teardown
    setTimeout(() => {
        document.getElementById('splash-screen')?.classList.add('hidden');
    }, 1500);

    // 2. Initialize UI Hooks
    UI.init();

    // 3. Bind Professional Auth Modal Controls
    const tabSignin = document.getElementById('tab-signin-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    const signinForm = document.getElementById('signin-form');
    const registerForm = document.getElementById('register-form');
    const authErrorBanner = document.getElementById('auth-error-banner');

    if (tabSignin && tabRegister) {
        tabSignin.addEventListener('click', () => {
            tabSignin.classList.add('active');
            tabRegister.classList.remove('active');
            signinForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
            if (authErrorBanner) authErrorBanner.classList.add('hidden');
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabSignin.classList.remove('active');
            registerForm?.classList.remove('hidden');
            signinForm?.classList.add('hidden');
            if (authErrorBanner) authErrorBanner.classList.add('hidden');
        });
    }

    // Password Eye Toggles
    const toggleSigninPass = document.getElementById('toggle-signin-pass');
    const signinPassInput = document.getElementById('signin-password');
    if (toggleSigninPass && signinPassInput) {
        toggleSigninPass.addEventListener('click', () => {
            const isPass = signinPassInput.type === 'password';
            signinPassInput.type = isPass ? 'text' : 'password';
            toggleSigninPass.innerHTML = isPass ? '<i class="ri-eye-off-line"></i>' : '<i class="ri-eye-line"></i>';
        });
    }

    const toggleRegPass = document.getElementById('toggle-reg-pass');
    const regPassInput = document.getElementById('reg-password');
    if (toggleRegPass && regPassInput) {
        toggleRegPass.addEventListener('click', () => {
            const isPass = regPassInput.type === 'password';
            regPassInput.type = isPass ? 'text' : 'password';
            toggleRegPass.innerHTML = isPass ? '<i class="ri-eye-off-line"></i>' : '<i class="ri-eye-line"></i>';
        });
    }

    // Sign In Submit & Enter Key
    const signinSubmitBtn = document.getElementById('signin-submit-btn');
    const executeSignin = () => {
        const email = document.getElementById('signin-email')?.value;
        const pass = document.getElementById('signin-password')?.value;
        const remember = document.getElementById('signin-remember')?.checked;
        loginUser(email, pass, remember);
    };
    if (signinSubmitBtn) signinSubmitBtn.addEventListener('click', executeSignin);
    document.getElementById('signin-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') executeSignin(); });

    // Register Submit & Enter Key
    const regSubmitBtn = document.getElementById('register-submit-btn');
    const executeRegister = () => {
        const name = document.getElementById('reg-name')?.value;
        const email = document.getElementById('reg-email')?.value;
        const pass = document.getElementById('reg-password')?.value;
        const confirmPass = document.getElementById('reg-confirm-password')?.value;

        if (pass !== confirmPass) {
            const textEl = document.getElementById('auth-error-text');
            if (authErrorBanner && textEl) {
                textEl.textContent = "Passwords do not match. Please check and try again.";
                authErrorBanner.classList.remove('hidden');
            } else {
                alert("Passwords do not match.");
            }
            return;
        }
        registerUser(name, email, pass);
    };
    if (regSubmitBtn) regSubmitBtn.addEventListener('click', executeRegister);
    document.getElementById('reg-confirm-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') executeRegister(); });

    // Forgot password handler
    document.getElementById('forgot-pass-link')?.addEventListener('click', () => {
        const email = document.getElementById('signin-email')?.value.trim();
        if (!email) {
            alert("Please enter your email address in the box above first to reset your password.");
        } else {
            alert(`A password reset link would be sent to ${email}. Check your inbox!`);
        }
    });
    
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
            
            // Request Notification Permissions
            if (window.Notification && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
            
            // Set Avatars and Settings Profile Data
            const avatarTxt = document.getElementById('my-avatar-placeholder');
            const setAvatar = document.getElementById('settings-avatar');
            const setName = document.getElementById('settings-name');
            const setEmail = document.getElementById('settings-email');
            
            const setBio = document.getElementById('settings-bio');
            const saveBioBtn = document.getElementById('save-bio-btn');
            
            const firstLetter = profileData.name.charAt(0).toUpperCase();

            if(avatarTxt) avatarTxt.textContent = firstLetter;
            if(setAvatar) setAvatar.textContent = firstLetter;
            if(setName) setName.textContent = profileData.name;
            if(setEmail) setEmail.textContent = profileData.email;
            if(setBio) setBio.value = profileData.bio || '';
            
            if(saveBioBtn) {
                saveBioBtn.onclick = async () => {
                    const bioText = setBio.value.trim();
                    try {
                        const { firestoreTools } = await import('./firebase-init.js');
                        await firestoreTools.updateDoc(firestoreTools.doc(db, "users", user.uid), {
                            bio: bioText
                        });
                        alert("About status updated!");
                    } catch(e) {
                        alert("Failed to update status.");
                    }
                };
            }

            // Custom Sounds Initialization
            const msgInput = document.getElementById('custom-message-sound');
            const callInput = document.getElementById('custom-call-sound');
            const audioRec = document.getElementById('audio-receive');
            const audioRing = document.getElementById('audio-ringtone');

            if(localStorage.getItem('customMsgSound') && audioRec) {
                audioRec.src = localStorage.getItem('customMsgSound');
            }
            if(localStorage.getItem('customCallSound') && audioRing) {
                audioRing.src = localStorage.getItem('customCallSound');
            }

            if(msgInput) {
                msgInput.addEventListener('change', e => {
                    const file = e.target.files[0];
                    if(!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        localStorage.setItem('customMsgSound', reader.result);
                        if(audioRec) audioRec.src = reader.result;
                        alert("Message sound updated successfully!");
                    };
                    reader.readAsDataURL(file);
                });
            }
            if(callInput) {
                callInput.addEventListener('change', e => {
                    const file = e.target.files[0];
                    if(!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        localStorage.setItem('customCallSound', reader.result);
                        if(audioRing) audioRing.src = reader.result;
                        alert("Call ringtone updated successfully!");
                    };
                    reader.readAsDataURL(file);
                });
            }

            // Start global chat listener
            
            if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }

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
                
                // Delivery, Unread Badge, and Background Push Engine
                docsArr.forEach(chat => {
                    const msgRef = firestoreTools.collection(db, "chats", chat.id, "messages");
                    
                    if (!window.koolaUnsubMap) window.koolaUnsubMap = {};
                    if (!window.koolaUnsubMap[chat.id]) {
                        const unreadq = firestoreTools.query(msgRef, firestoreTools.where("status", "in", ["sent", "delivered"]));
                        window.koolaUnsubMap[chat.id] = firestoreTools.onSnapshot(unreadq, snap => {
                            let unreads = 0;
                            let newlyArrived = false;
                            
                            snap.forEach(docSnap => {
                                const val = docSnap.data();
                                if (val.sender !== formattedEmail) {
                                    unreads++;
                                    if (val.status === 'sent') {
                                        newlyArrived = true;
                                        firestoreTools.updateDoc(docSnap.ref, { status: 'delivered' }).catch(()=>{});
                                    }
                                }
                            });
                            
                            // Attach count to our global model
                            const matchedChat = window.koolaDocsArr?.find(c => c.id === chat.id);
                            if (matchedChat) matchedChat.unreadCount = unreads;
                            
                            if (newlyArrived) {
                                document.getElementById('audio-receive')?.play().catch(()=>{});
                                if (window.Notification && Notification.permission === 'granted' && document.hidden) {
                                    new Notification(`Koola Message`, { body: 'You have new unread messages' });
                                }
                            }
                            
                            if (window.koolaUI && window.koolaDocsArr) {
                                clearTimeout(window.koolaRenderThrottle);
                                window.koolaRenderThrottle = setTimeout(() => {
                                    const activeTab = document.querySelector('.nav-icon.active')?.getAttribute('data-tab');
                                    if (activeTab === 'chats' || !activeTab) {
                                        window.koolaUI.renderChatList(window.koolaDocsArr);
                                    }
                                }, 300);
                            }
                        });
                    }
                });

                window.koolaDocsArr = docsArr;
                // Seed initial load before unread map boots up
                const currentTab = document.querySelector('.nav-icon.active')?.getAttribute('data-tab');
                if (currentTab === 'chats' || !currentTab) {
                    UI.renderChatList(docsArr);
                }
                
                // Broadcast chats arrays to WebRTC engine if needed to attach listeners
                if(window.koolaRTC && window.koolaRTC.attachGlobalCallListeners) {
                    window.koolaRTC.attachGlobalCallListeners(docsArr);
                }
            });
            
            // Hook Native Contacts Subsystem
            UI.bindContactsListener();
            
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
