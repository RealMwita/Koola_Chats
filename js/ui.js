import { db, firestoreTools } from './firebase-init.js';
import { authState } from './auth.js';
import { initiateCall } from './webrtc.js';

export const UI = {
    els: {
        chatListContainer: document.getElementById('main-content'),
        messagingContainer: document.getElementById('messaging-container'),
        emptyStateView: document.getElementById('empty-state-view'),
        chatPane: document.querySelector('.active-chat-pane'),
        newChatBtn: document.getElementById('new-chat-btn'),
        globalSearch: document.getElementById('global-search')
    },
    activeChatId: null,
    unsubscribeChat: null,
    unsubscribeMessages: null,

    init() {
        if(this.els.newChatBtn) {
            this.els.newChatBtn.addEventListener('click', () => {
                document.getElementById('contacts-pane').classList.remove('hidden');
            });
        }
        
        const saveContactBtn = document.getElementById('save-contact-btn');
        if(saveContactBtn) {
            saveContactBtn.addEventListener('click', () => this.handleSaveContact());
        }
        
        // Tab Filters Logic
        const filterChips = document.querySelectorAll('.chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                filterChips.forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                
                // Re-trigger render with current filter
                if(window.koolaDocsArr) this.renderChatList(window.koolaDocsArr);
            });
        });

        // Theme Toggler
        const themeIcon = document.getElementById('theme-toggle-icon');
        const themeBtn = document.getElementById('theme-toggle-btn');
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if(themeIcon && isLight) {
            themeIcon.classList.replace('ri-toggle-fill', 'ri-toggle-line');
            themeIcon.style.color = 'var(--text-secondary)';
        }

        if(themeBtn) {
            themeBtn.addEventListener('click', () => {
                const currentLight = document.documentElement.getAttribute('data-theme') === 'light';
                if(currentLight) {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('koola_theme', 'dark');
                    themeIcon.classList.replace('ri-toggle-line', 'ri-toggle-fill');
                    themeIcon.style.color = 'var(--primary-green)';
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('koola_theme', 'light');
                    themeIcon.classList.replace('ri-toggle-fill', 'ri-toggle-line');
                    themeIcon.style.color = 'var(--text-secondary)';
                }
            });
        }

        // Push Notifications Toggler
        const notifyBtn = document.getElementById('notify-toggle-btn');
        const notifyIcon = document.getElementById('notify-toggle-icon');
        
        if(notifyBtn && window.Notification) {
            // Init state
            if(Notification.permission === 'granted') {
                notifyIcon.classList.replace('ri-toggle-line', 'ri-toggle-fill');
                notifyIcon.style.color = 'var(--primary-green)';
            }
            
            notifyBtn.addEventListener('click', () => {
                if(Notification.permission !== 'granted') {
                    Notification.requestPermission().then(perm => {
                        if(perm === 'granted') {
                            notifyIcon.classList.replace('ri-toggle-line', 'ri-toggle-fill');
                            notifyIcon.style.color = 'var(--primary-green)';
                            alert("Push Notifications enabled!");
                        } else {
                            alert("Permission denied by browser.");
                        }
                    });
                } else {
                    alert("Push Notifications are already granted. You can disable them in your browser settings.");
                }
            });
        }


        // View Navigation (Left Sidebar)
        const navIcons = document.querySelectorAll('.nav-icon[data-tab]');
        navIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                
                // Update active state
                navIcons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Update List Pane dynamically
                const paneTitle = document.getElementById('pane-title');
                const searchContainer = document.querySelector('.search-container');
                const newChatBtn = document.getElementById('new-chat-btn');
                
                if(tab === 'chats') {
                    if(paneTitle) paneTitle.textContent = "Chats";
                    if(searchContainer) searchContainer.style.display = 'block';
                    if(newChatBtn) newChatBtn.style.display = 'block';
                    if(window.koolaDocsArr) this.renderChatList(window.koolaDocsArr);
                } else if(tab === 'calls') {
                    if(paneTitle) paneTitle.textContent = "Calls";
                    if(searchContainer) searchContainer.style.display = 'none';
                    if(newChatBtn) newChatBtn.style.display = 'none';
                    
                    if (window.unsubCallsHook) window.unsubCallsHook();
                    const callHistoryRef = firestoreTools.collection(db, "users", authState.user.uid, "callHistory");
                    const qCalls = firestoreTools.query(callHistoryRef, firestoreTools.orderBy("timestamp", "desc"));
                    
                    window.unsubCallsHook = firestoreTools.onSnapshot(qCalls, (snap) => {
                        let html = '<div style="padding: 16px;">';
                        if (snap.empty) {
                            html += `
                                <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
                                    <i class="ri-phone-line" style="font-size: 48px;"></i>
                                    <h3 style="margin-top: 16px; color: var(--text-primary);">Call History</h3>
                                    <p style="font-size: 14px; margin-top: 8px;">Incoming and outgoing calls will appear here across your devices.</p>
                                </div>
                            `;
                        } else {
                            snap.forEach(docSnap => {
                                const call = docSnap.data();
                                const iconColor = call.type === 'missed' ? 'var(--danger-red)' : 'var(--primary-green)';
                                const iconType = call.callType === 'video' ? 'ri-video-chat-fill' : 'ri-phone-fill';
                                const arrowType = call.type === 'incoming' ? 'ri-arrow-left-down-line' : 'ri-arrow-right-up-line';
                                
                                html += `
                                <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                                    <div class="avatar-text" style="width: 44px; height: 44px; font-size: 20px; flex-shrink: 0;">${(call.contactName||'U').charAt(0).toUpperCase()}</div>
                                    <div style="flex-grow: 1; margin-left: 14px;">
                                        <div style="font-weight: 500; font-size: 16px; color: ${call.type === 'missed' ? 'var(--danger-red)' : 'var(--text-primary)'}">${call.contactName || call.contactEmail || 'Unknown'}</div>
                                        <div style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; margin-top: 4px;">
                                            <i class="${arrowType}" style="color: ${iconColor}; margin-right: 4px;"></i>
                                            ${call.timestamp ? new Date(call.timestamp.toMillis()).toLocaleString() : 'Just now'}
                                        </div>
                                    </div>
                                    <div style="color: var(--primary-green); font-size: 22px; cursor:pointer;" onclick="window.koolaUI.createNewChat('${call.contactEmail}', '${call.contactName}')">
                                        <i class="${iconType}"></i>
                                    </div>
                                </div>
                                `;
                            });
                        }
                        html += '</div>';
                        this.els.chatListContainer.innerHTML = html;
                    });
                } else if(tab === 'status') {
                    if(paneTitle) paneTitle.textContent = "Status";
                    if(searchContainer) searchContainer.style.display = 'none';
                    if(newChatBtn) newChatBtn.style.display = 'none';
                    this.els.chatListContainer.innerHTML = `
                        <div class="chat-item" style="border-bottom: 8px solid var(--sidebar-bg);">
                            <div class="chat-item-avatar" style="background: var(--text-secondary);">
                                <i class="ri-add-line" style="color: white;"></i>
                            </div>
                            <div class="chat-item-content border-bottom-none">
                                <div class="chat-item-top"><div class="chat-item-name">My Status</div></div>
                                <div class="chat-item-bottom"><div class="chat-item-last">Click to add update</div></div>
                            </div>
                        </div>
                        <div style="padding: 16px; font-weight: 500; font-size: 14px; color: var(--primary-green);">Recent updates</div>
                        <div style="padding: 24px; text-align: center; color: var(--text-secondary); font-size: 13px;">No recent updates right now.</div>
                    `;
                }
            });
        });
    },

    showLoadingChats() {
        this.els.chatListContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-secondary);"><i class="ri-loader-4-line pulse" style="font-size: 32px; color: var(--primary-green);"></i></div>`;
    },

    renderChatList(docsArr) {
        window.koolaDocsArr = docsArr; // Save for filtering
        const filterState = document.querySelector('.chip.active')?.textContent.trim() || 'All';
        
        const filteredDocs = docsArr.filter(chat => {
            if (filterState === 'Unread') return chat.unreadCount > 0;
            if (filterState === 'Groups') return chat.isGroup === true; // Assuming future isGroup flag
            return true;
        });

        let html = '';
        if (filteredDocs.length === 0) {
            html = `<div style="text-align:center; padding: 40px; color: var(--text-secondary);"><p>No chats found.</p></div>`;
        } else {
            filteredDocs.forEach(chat => {
                const isSelected = chat.id === this.activeChatId;
                const activeClass = isSelected ? 'active' : '';
                
                // Exclude current user from participants to find "contact"
                const myEmailStr = authState.user.email.trim().toLowerCase();
                const contactEmail = chat.participants.find(p => p !== myEmailStr) || 'Unknown';
                const contactName = chat.names ? chat.names[contactEmail] || contactEmail.split('@')[0] : contactEmail.split('@')[0];
                const displayAvatar = contactName.charAt(0).toUpperCase();

                html += `
                    <div class="chat-item ${activeClass}" data-id="${chat.id}" onclick="window.koolaUI.openChat('${chat.id}', '${contactName}', '${contactEmail}')">
                        <div class="chat-item-avatar">${displayAvatar}</div>
                        <div class="chat-item-content">
                            <div class="chat-item-top">
                                <div class="chat-item-name">${contactName}</div>
                                <div class="chat-item-time">${chat.time || ''}</div>
                            </div>
                            <div class="chat-item-bottom" style="display:flex; justify-content:space-between; align-items:center;">
                                <div class="chat-item-last" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:80%;">${chat.lastMessage || '...'}</div>
                                ${chat.unreadCount > 0 ? `<div class="unread-badge">${chat.unreadCount}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        this.els.chatListContainer.innerHTML = html;
    },

    async handleSaveContact() {
        const feedback = document.getElementById('contact-save-feedback');
        feedback.textContent = '';
        
        const emailInput = document.getElementById('contact-email').value;
        const nameInput = document.getElementById('contact-name').value;
        const phoneInput = document.getElementById('contact-phone').value;

        if (!emailInput || !emailInput.includes('@')) {
            feedback.textContent = "Please provide a valid email.";
            return;
        }

        const myEmail = authState.user.email.trim().toLowerCase();
        const targetEmail = emailInput.trim().toLowerCase();
        const targetName = nameInput.trim() || targetEmail.split('@')[0];
        
        if (myEmail === targetEmail) {
            feedback.textContent = "You cannot add yourself.";
            return;
        }

        const btn = document.getElementById('save-contact-btn');
        btn.textContent = "Verifying...";
        btn.disabled = true;

        try {
            // Check if user is registered in Koola!
            const usersRef = firestoreTools.collection(db, "users");
            const q = firestoreTools.query(usersRef, firestoreTools.where("email", "==", targetEmail));
            const snap = await firestoreTools.getDoc(firestoreTools.doc(db, "users", "dummy")); // workaround to force await if needed, wait, getDocs isn't exported in firebase-init! 
            
            // Wait, firestoreTools doesn't export getDocs! I can use onSnapshot dynamically, or I must just export getDocs? 
            // The cleanest way without getDocs is to just let them start the chat, OR we modify firebase-init.js to export getDocs.
            // Oh, I can just create the chat. If they don't exist, they'll never see it. 
            // BUT user specifically asked: "if the user is not in koola chats say that user dosent exist".
            // I must export `getDocs` in firebase-init.js first to query it sync-style. Let's do a fast implementation using onSnapshot resolving a Promise.

            const checkExists = await new Promise((resolve) => {
                const unsub = firestoreTools.onSnapshot(q, (querySnap) => {
                    unsub();
                    resolve(!querySnap.empty);
                }, (err) => {
                    unsub(); resolve(false);
                });
            });

            if(!checkExists) {
                feedback.textContent = "User does not exist on Koola Chats.";
                btn.textContent = "Save & Chat";
                btn.disabled = false;
                return;
            }

            // User exists! Save Contact locally.
            const contactRef = firestoreTools.doc(db, "users", authState.user.uid, "contacts", targetEmail);
            await firestoreTools.setDoc(contactRef, {
                email: targetEmail,
                name: targetName,
                phoneNumber: phoneInput.trim(),
                timestamp: firestoreTools.serverTimestamp()
            });

            document.getElementById('new-contact-form').classList.add('hidden');
            document.getElementById('contact-email').value = '';
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-phone').value = '';
            
            this.createNewChat(targetEmail, targetName);

        } catch (e) {
            feedback.textContent = "Error: " + e.message;
        } finally {
            btn.textContent = "Save & Chat";
            btn.disabled = false;
        }
    },

    async createNewChat(targetEmail, targetName) {
        const myEmail = authState.user.email.trim().toLowerCase();
        const chatId = [myEmail, targetEmail].sort().join('_');
        
        try {
            await firestoreTools.setDoc(firestoreTools.doc(db, "chats", chatId), {
                participants: [myEmail, targetEmail],
                names: { [targetEmail]: targetName, [myEmail]: authState.profileData?.name || myEmail.split('@')[0] },
                timestamp: firestoreTools.serverTimestamp(),
                lastMessage: "Chat created"
            }, { merge: true });
            
            this.openChat(chatId, targetName, targetEmail);
        } catch(e) {
            alert("Error creating chat: " + e.message);
        }
    },

    bindContactsListener() {
        if(!authState.user) return;
        const contactsRef = firestoreTools.collection(db, "users", authState.user.uid, "contacts");
        
        firestoreTools.onSnapshot(contactsRef, (snapshot) => {
            const list = document.getElementById('contacts-list');
            if(!list) return;

            let html = '';
            if(snapshot.empty) {
                html = `<div style="text-align: center; padding: 24px; color: var(--text-secondary); font-size: 14px;">No contacts saved yet.</div>`;
            } else {
                snapshot.forEach(snap => {
                    const c = snap.data();
                    html += `
                        <div class="chat-item" onclick="window.koolaUI.createNewChat('${c.email}', '${c.name}')">
                            <div class="chat-item-avatar">${c.name.charAt(0).toUpperCase()}</div>
                            <div class="chat-item-content">
                                <div class="chat-item-top"><div class="chat-item-name">${c.name}</div></div>
                                <div class="chat-item-bottom"><div class="chat-item-last">${c.email} • ${c.phoneNumber || 'No phone'}</div></div>
                            </div>
                        </div>
                    `;
                });
            }
            list.innerHTML = html;
        });
    },

    openChat(chatId, contactName, contactEmail) {
        this.activeChatId = chatId;
        
        // Universal Clickable Chat Behavior: Close all subpanes and overlays immediately
        document.getElementById('contacts-pane')?.classList.add('hidden');
        document.getElementById('subpage-container')?.classList.add('hidden');
        document.getElementById('new-contact-form')?.classList.add('hidden');

        // Automatically switch Left Nav Tab to "Chats" if opened from Calls History or Status
        const activeTabBtn = document.querySelector('.nav-icon.active');
        if (activeTabBtn && activeTabBtn.getAttribute('data-tab') !== 'chats') {
            document.querySelectorAll('.nav-icon[data-tab]').forEach(btn => btn.classList.remove('active'));
            const chatsTab = document.querySelector('.nav-icon[data-tab="chats"]');
            if (chatsTab) {
                chatsTab.classList.add('active');
                const paneTitle = document.getElementById('pane-title');
                const searchContainer = document.querySelector('.search-container');
                const newChatBtn = document.getElementById('new-chat-btn');
                if (paneTitle) paneTitle.textContent = "Chats";
                if (searchContainer) searchContainer.style.display = 'block';
                if (newChatBtn) newChatBtn.style.display = 'block';
                if (window.koolaDocsArr) this.renderChatList(window.koolaDocsArr);
            }
        }

        // Mobile handling (slide in active chat)
        if(window.innerWidth <= 768) {
            this.els.chatPane.classList.add('active');
        }

        // Switch to Messaging Container
        this.els.emptyStateView.classList.add('hidden');
        this.els.messagingContainer.classList.remove('hidden');

        // Render Base Messaging Layout
        this.els.messagingContainer.innerHTML = `
            <header class="chat-header">
                <div class="chat-header-info" onclick="window.koolaUI.closeMobileChat()">
                    <i class="ri-arrow-left-line" style="font-size: 20px; display: none;" id="mobile-back-btn"></i>
                    <div class="chat-item-avatar" style="width:40px;height:40px;font-size:16px;">${contactName.charAt(0).toUpperCase()}</div>
                    <div class="chat-header-text">
                        <h2>${contactName}</h2>
                        <span id="header-bio-span" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px; display:block;">Loading...</span>
                    </div>
                </div>
                <div class="pane-actions">
                    <button class="icon-btn" onclick="window.koolaRTC.startCall('${chatId}', '${contactName}', true)"><i class="ri-video-add-fill"></i></button>
                    <button class="icon-btn" onclick="window.koolaRTC.startCall('${chatId}', '${contactName}', false)"><i class="ri-phone-fill"></i></button>
                    <button class="icon-btn"><i class="ri-more-2-fill"></i></button>
                </div>
            </header>
            ${contactName === contactEmail ? `
            <div id="save-unknown-contact-banner" style="background: var(--sidebar-bg); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
                <div style="font-size: 13px; color: var(--text-secondary);">This sender is not in your contacts.</div>
                <button id="quick-save-contact-btn" class="primary-btn" style="padding: 6px 12px; font-size: 13px; border: none; border-radius: 4px; cursor: pointer; background: var(--primary-green); color: white;">Save Contact</button>
            </div>
            ` : ''}
            <div id="messages-scroll" class="messages-scroll">
                <div style="text-align:center; padding-top:20px;"><i class="ri-loader-4-line pulse"></i></div>
            </div>
            <div id="voice-recording-indicator" class="voice-recording-banner hidden" style="background: var(--sidebar-bg); border-top: 1px solid var(--border-color); padding: 8px 16px;">
                <div class="voice-recording-dot"></div>
                <span id="recording-status-text">Recording voice message... (Click red stop button to send)</span>
            </div>
            <div class="chat-input-area" style="position:relative;">
                <button class="icon-btn" id="emoji-btn" title="Choose Emoji"><i class="ri-emotion-line"></i></button>
                <div id="emoji-container" class="hidden" style="position: absolute; bottom: 80px; left: 16px; z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius:12px; overflow:hidden;"></div>
                
                <button class="icon-btn" style="position:relative; overflow:hidden;" title="Send Photo or Image">
                    <i class="ri-image-2-line" style="color: var(--primary-green);"></i>
                    <input type="file" id="image-upload-input" accept="image/*" style="opacity:0; position:absolute; left:0; top:0; width:100%; height:100%; cursor:pointer;">
                </button>

                <button class="icon-btn" style="position:relative; overflow:hidden;" title="Attach video, audio or files">
                    <i class="ri-attachment-2"></i>
                    <input type="file" id="media-upload-input" accept="video/*,audio/*,image/*" style="opacity:0; position:absolute; left:0; top:0; width:100%; height:100%; cursor:pointer;">
                </button>
                <div class="chat-input-wrapper">
                    <input type="text" id="chat-input" placeholder="Type a message or record audio...">
                </div>
                <button class="icon-btn" id="send-voice-btn" title="Hold/Click to record voice message"><i class="ri-mic-fill" id="send-icon"></i></button>
            </div>
        `;

        // Fetch target Bio
        firestoreTools.getDocs(firestoreTools.query(firestoreTools.collection(db, "users"), firestoreTools.where("email", "==", contactEmail)))
            .then(snap => {
                const spn = document.getElementById('header-bio-span');
                if(!snap.empty && spn) {
                    spn.textContent = snap.docs[0].data().bio || contactEmail;
                } else if(spn) {
                    spn.textContent = contactEmail;
                }
            }).catch(e => {
                const spn = document.getElementById('header-bio-span');
                if(spn) spn.textContent = contactEmail;
            });

        if(window.innerWidth <= 768) {
            document.getElementById('mobile-back-btn')?.style.setProperty('display', 'block');
        }

        const quickSaveBtn = document.getElementById('quick-save-contact-btn');
        if (quickSaveBtn) {
            quickSaveBtn.onclick = async () => {
                const newName = prompt("Enter a name for this contact:");
                if (!newName || !newName.trim()) return;
                try {
                    const contactRef = firestoreTools.doc(db, "users", authState.user.uid, "contacts", contactEmail);
                    await firestoreTools.setDoc(contactRef, {
                        email: contactEmail,
                        name: newName.trim(),
                        phone: ''
                    });
                    document.getElementById('save-unknown-contact-banner').style.display = 'none';
                    document.querySelector('.chat-header-text h2').textContent = newName.trim();
                } catch(e) {
                    alert("Failed to save contact.");
                }
            };
        }

        const inputEl = document.getElementById('chat-input');
        const iconEl = document.getElementById('send-icon');
        const sendVoiceBtn = document.getElementById('send-voice-btn');
        
        // Dynamic Icon
        inputEl.addEventListener('input', () => {
            if(inputEl.value.trim().length > 0) {
                iconEl.className = 'ri-send-plane-fill';
                iconEl.style.color = '';
            } else if (!isRecording) {
                iconEl.className = 'ri-mic-fill';
                iconEl.style.color = '';
            }
        });

        // Emoji Integration & Outside Click Dismissal
        document.getElementById('emoji-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const container = document.getElementById('emoji-container');
            if(!document.querySelector('emoji-picker')) {
                import('https://cdn.jsdelivr.net/npm/emoji-picker-element@1.21.3/index.js').then(() => {
                    const picker = document.createElement('emoji-picker');
                    picker.addEventListener('emoji-click', e => {
                        inputEl.value += e.detail.unicode;
                        inputEl.dispatchEvent(new Event('input'));
                    });
                    container.appendChild(picker);
                });
            }
            container.classList.toggle('hidden');
        });

        const closeEmojiHandler = (e) => {
            const container = document.getElementById('emoji-container');
            const btn = document.getElementById('emoji-btn');
            if (container && !container.classList.contains('hidden')) {
                if (!container.contains(e.target) && (!btn || !btn.contains(e.target))) {
                    container.classList.add('hidden');
                }
            }
        };
        document.removeEventListener('click', window.koolaEmojiOutside);
        document.removeEventListener('touchstart', window.koolaEmojiOutside);
        window.koolaEmojiOutside = closeEmojiHandler;
        document.addEventListener('click', window.koolaEmojiOutside);
        document.addEventListener('touchstart', window.koolaEmojiOutside);

        // Helper function for uploading media files
        const handleFileUpload = async (file, overrideType = null) => {
            if(!file) return;
            if(file.size > 15000000) return alert("File exceeds 15MB limit. Please choose a smaller file.");
            
            let mediaType = overrideType || 'image';
            if (!overrideType) {
                if (file.type.startsWith('video')) mediaType = 'video';
                else if (file.type.startsWith('audio')) mediaType = 'audio';
                else if (file.type.startsWith('image')) mediaType = 'image';
            }

            alert(`Uploading ${mediaType}... please wait.`);
            const { storage, storageTools } = await import('./firebase-init.js');
            const mediaRef = storageTools.ref(storage, `chats/${chatId}/media/${Date.now()}_${file.name || 'uploaded_media'}`);
            
            try {
                await storageTools.uploadBytes(mediaRef, file);
                const mediaUrl = await storageTools.getDownloadURL(mediaRef);
                
                await firestoreTools.addDoc(firestoreTools.collection(db, "chats", chatId, "messages"), {
                    sender: authState.user.email.trim().toLowerCase(),
                    mediaUrl: mediaUrl,
                    mediaType: mediaType,
                    status: 'sent',
                    timestamp: firestoreTools.serverTimestamp()
                });
                const label = mediaType === 'image' ? '[Photo 📷]' : (mediaType === 'video' ? '[Video 🎥]' : '[Audio 🎵]');
                await firestoreTools.setDoc(firestoreTools.doc(db, "chats", chatId), {
                    lastMessage: label,
                    timestamp: firestoreTools.serverTimestamp()
                }, { merge: true });
                document.getElementById('audio-send')?.play().catch(()=>{});
            } catch (err) {
                alert("Upload failed. Make sure Firebase Storage rules allow media uploads.");
            }
        };

        // Dedicated Image Upload Listener
        document.getElementById('image-upload-input')?.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'image'));
        // General Media Upload Listener
        document.getElementById('media-upload-input')?.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));

        // Clipboard Image Paste Support
        inputEl.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const blob = item.getAsFile();
                    handleFileUpload(blob, 'image');
                }
            }
        });

        // Drag & Drop Image/Media Support onto Messages Wall
        const scrollArea = document.getElementById('messages-scroll');
        if (scrollArea) {
            scrollArea.addEventListener('dragover', (e) => e.preventDefault());
            scrollArea.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileUpload(e.dataTransfer.files[0]);
                }
            });
        }

        let mediaRecorder;
        let audioChunks = [];
        let isRecording = false;

        const executeSend = async () => {
            const text = inputEl.value.trim();
            if (text) {
                inputEl.value = '';
                inputEl.dispatchEvent(new Event('input')); // Reset mic icon
                document.getElementById('emoji-container')?.classList.add('hidden');
                try {
                    await firestoreTools.addDoc(firestoreTools.collection(db, "chats", chatId, "messages"), {
                        sender: authState.user.email.trim().toLowerCase(),
                        text: text,
                        status: 'sent',
                        timestamp: firestoreTools.serverTimestamp()
                    });
                    await firestoreTools.setDoc(firestoreTools.doc(db, "chats", chatId), {
                        lastMessage: text,
                        timestamp: firestoreTools.serverTimestamp()
                    }, { merge: true });
                    document.getElementById('audio-send')?.play().catch(()=>{});
                } catch (err) {
                    alert("Message failed to send!");
                }
                return;
            }

            // Voice Note Live Recording Handler
            if (!isRecording) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    const pickFile = confirm("Microphone direct recording is restricted when opening via local file:/// protocol or non-HTTPS. Would you like to select/attach a voice note or audio file from your device instead?");
                    if (pickFile) {
                        document.getElementById('media-upload-input')?.click();
                    }
                    return;
                }
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
                    isRecording = true;
                    
                    iconEl.className = 'ri-stop-circle-fill pulse';
                    iconEl.style.color = 'var(--danger-red)';
                    document.getElementById('voice-recording-indicator')?.classList.remove('hidden');
                    audioChunks = [];
                    
                    mediaRecorder.addEventListener('dataavailable', event => audioChunks.push(event.data));
                    
                    mediaRecorder.addEventListener('stop', async () => {
                        const localType = mediaRecorder.mimeType || 'audio/webm';
                        const audioBlob = new Blob(audioChunks, { type: localType }); 
                        const { storage, storageTools } = await import('./firebase-init.js');
                        const mediaRef = storageTools.ref(storage, `chats/${chatId}/media/${Date.now()}_voicenote.webm`);
                        
                        try {
                            await storageTools.uploadBytes(mediaRef, audioBlob, { contentType: localType });
                            const mediaUrl = await storageTools.getDownloadURL(mediaRef);
                            await firestoreTools.addDoc(firestoreTools.collection(db, "chats", chatId, "messages"), {
                                sender: authState.user.email.trim().toLowerCase(),
                                mediaUrl: mediaUrl,
                                mediaType: 'audio',
                                status: 'sent',
                                timestamp: firestoreTools.serverTimestamp()
                            });
                            await firestoreTools.setDoc(firestoreTools.doc(db, "chats", chatId), {
                                lastMessage: "[Voice Message 🎤]",
                                timestamp: firestoreTools.serverTimestamp()
                            }, { merge: true });
                            document.getElementById('audio-send')?.play().catch(()=>{});
                        } catch(err) {
                            alert("Voice Note upload failed: " + err.message);
                        }
                        stream.getTracks().forEach(t => t.stop());
                    });
                } catch(e) {
                    const pickFile = confirm("Microphone permission was denied or unavailable. Would you like to attach an audio recording file instead?");
                    if (pickFile) {
                        document.getElementById('media-upload-input')?.click();
                    }
                }
            } else {
                isRecording = false;
                iconEl.className = 'ri-mic-fill';
                iconEl.style.color = '';
                document.getElementById('voice-recording-indicator')?.classList.add('hidden');
                mediaRecorder.stop();
            }
        };

        sendVoiceBtn.addEventListener('click', executeSend);
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') executeSend(); });

        this.subscribeToMessages(chatId);
    },

    closeMobileChat() {
        this.els.chatPane.classList.remove('active');
        this.activeChatId = null;
        if(this.unsubscribeMessages) this.unsubscribeMessages();
    },

    subscribeToMessages(chatId) {
        if(this.unsubscribeMessages) this.unsubscribeMessages();
        
        const msgsRef = firestoreTools.collection(db, "chats", chatId, "messages");
        const q = firestoreTools.query(msgsRef, firestoreTools.orderBy("timestamp", "asc"));
        
        let initiallyLoaded = false;
        
        this.unsubscribeMessages = firestoreTools.onSnapshot(q, (snapshot) => {
            const container = document.getElementById('messages-scroll');
            if(!container) return;
            
            let hasNewMsg = false;
            snapshot.docChanges().forEach(change => { 
                if(change.type==='added' || change.type==='modified') {
                    if (change.type === 'added') hasNewMsg = true;
                    
                    const msgData = change.doc.data();
                    if (msgData.sender !== authState.user.email.trim().toLowerCase() && msgData.status !== 'read') {
                        firestoreTools.updateDoc(change.doc.ref, { status: 'read' }).catch(()=>{});
                    }
                }
            });
            
            let html = '';
            if (snapshot.empty) {
                html = `<div style="text-align:center; padding-top:20px; color:var(--text-secondary);"><div class="date-badge" style="margin: 0 auto; background: var(--sidebar-bg); padding: 4px 12px; border-radius: 12px; display:inline-block;">Today</div></div>`;
            } else {
                snapshot.forEach(docSnap => {
                    const msg = docSnap.data();
                    const isMe = msg.sender === authState.user.email.trim().toLowerCase();
                    
                    let contentHtml = msg.text ? `<div class="message-text">${msg.text}</div>` : '';
                    if(msg.mediaUrl) {
                        if(msg.mediaType === 'image') contentHtml += `<div style="margin-top:4px;"><img src="${msg.mediaUrl}" onclick="window.open('${msg.mediaUrl}', '_blank')" style="max-width:100%; max-height:300px; border-radius:8px; cursor:pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display:block; object-fit:cover;" title="Click to open full size photo"></div>`;
                        if(msg.mediaType === 'video') contentHtml += `<video controls src="${msg.mediaUrl}" style="max-width:100%; border-radius:8px; margin-top:4px; max-height:250px;"></video>`;
                        if(msg.mediaType === 'audio') contentHtml += `<div style="display:flex; align-items:center; gap:8px; margin-top:4px; padding:4px 0;"><i class="ri-mic-fill" style="font-size:20px; color:var(--primary-green);"></i><audio controls preload="metadata" src="${msg.mediaUrl}" style="max-width:240px; height:36px;"></audio></div>`;
                    }

                    let tickSvg = '';
                    if (isMe) {
                        if (msg.status === 'read') tickSvg = '<i class="ri-check-double-line" style="color:#53bdeb; font-size:16px; margin-left:4px; vertical-align:bottom;"></i>';
                        else if (msg.status === 'delivered') tickSvg = '<i class="ri-check-double-line" style="color:var(--text-secondary); font-size:16px; margin-left:4px; vertical-align:bottom;"></i>';
                        else tickSvg = '<i class="ri-check-line" style="color:var(--text-secondary); font-size:16px; margin-left:4px; vertical-align:bottom;"></i>';
                    }
                    
                    let timeString = '';
                    if (msg.timestamp) {
                        try {
                            timeString = typeof msg.timestamp.toMillis === 'function' ? 
                                new Date(msg.timestamp.toMillis()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                                new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        } catch(e) {}
                    }
                    
                    html += `
                        <div class="message-bubble ${isMe ? 'out' : 'in'}">
                            ${contentHtml}
                            <div style="font-size: 11px; color: var(--text-secondary); text-align: right; margin-top: 4px; display: flex; justify-content: flex-end; align-items: center;">
                                ${timeString}
                                ${isMe ? tickSvg : ''}
                            </div>
                        </div>
                    `;
                });
            }
            container.innerHTML = html;
            container.scrollTop = container.scrollHeight;


            initiallyLoaded = true;
        }, (err) => {
            console.error("Failed to load messages:", err);
            const container = document.getElementById('messages-scroll');
            if(container) container.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--danger-red);">Failed to sync messages. Check Firebase permissions!</div>`;
        });
    }
};

window.koolaUI = UI;
