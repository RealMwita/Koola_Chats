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
            this.els.newChatBtn.addEventListener('click', () => this.handleNewChat());
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
                    this.els.chatListContainer.innerHTML = `
                        <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
                            <i class="ri-phone-line" style="font-size: 48px;"></i>
                            <h3 style="margin-top: 16px; color: var(--text-primary);">Call History</h3>
                            <p style="font-size: 14px; margin-top: 8px;">Incoming and outgoing calls will appear here across your devices.</p>
                        </div>
                    `;
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
            if (filterState === 'Unread') return chat.unread > 0;
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
                            <div class="chat-item-bottom">
                                <div class="chat-item-last">${chat.lastMessage || '...'}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        this.els.chatListContainer.innerHTML = html;
    },

    async handleNewChat() {
        const input = prompt("Enter the precise email of the registered user you want to chat with:");
        if (!input || !input.includes('@')) return;
        
        const myEmail = authState.user.email.trim().toLowerCase();
        const targetEmail = input.trim().toLowerCase();
        if (myEmail === targetEmail) return alert("You cannot chat with yourself.");

        const chatId = [myEmail, targetEmail].sort().join('_');
        
        try {
            await firestoreTools.setDoc(firestoreTools.doc(db, "chats", chatId), {
                participants: [myEmail, targetEmail],
                timestamp: firestoreTools.serverTimestamp(),
                lastMessage: "Chat started"
            }, { merge: true });
            
            this.openChat(chatId, targetEmail.split('@')[0], targetEmail);
        } catch(e) {
            alert("Error creating chat: " + e.message);
        }
    },

    openChat(chatId, contactName, contactEmail) {
        this.activeChatId = chatId;
        
        // Mobile handling (slide in)
        if(window.innerWidth <= 768) {
            this.els.chatPane.classList.add('active');
        }

        // Switch purely to Messaging Container
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
                        <span>${contactEmail}</span>
                    </div>
                </div>
                <div class="pane-actions">
                    <button class="icon-btn" onclick="window.koolaRTC.startCall('${chatId}', '${contactName}', true)"><i class="ri-video-add-fill"></i></button>
                    <button class="icon-btn" onclick="window.koolaRTC.startCall('${chatId}', '${contactName}', false)"><i class="ri-phone-fill"></i></button>
                    <button class="icon-btn"><i class="ri-more-2-fill"></i></button>
                </div>
            </header>
            <div id="messages-scroll" class="messages-scroll">
                <div style="text-align:center; padding-top:20px;"><i class="ri-loader-4-line pulse"></i></div>
            </div>
            <div class="chat-input-area">
                <button class="icon-btn"><i class="ri-emotion-line"></i></button>
                <div class="chat-input-wrapper">
                    <input type="text" id="chat-input" placeholder="Type a message...">
                </div>
                <button class="icon-btn" id="send-btn"><i class="ri-send-plane-fill"></i></button>
            </div>
        `;

        if(window.innerWidth <= 768) {
            document.getElementById('mobile-back-btn').style.display = 'block';
        }

        // Attach Send Listener
        const sendBtn = document.getElementById('send-btn');
        const inputEl = document.getElementById('chat-input');
        
        const sendMessage = async () => {
            const text = inputEl.value.trim();
            if (!text) return;
            inputEl.value = '';
            
            await firestoreTools.addDoc(firestoreTools.collection(db, "chats", chatId, "messages"), {
                sender: authState.user.email.trim().toLowerCase(),
                text: text,
                timestamp: firestoreTools.serverTimestamp()
            });
            await firestoreTools.setDoc(firestoreTools.doc(db, "chats", chatId), {
                lastMessage: text,
                timestamp: firestoreTools.serverTimestamp()
            }, { merge: true });
        };
        
        sendBtn.addEventListener('click', sendMessage);
        inputEl.addEventListener('keydown', (e) => { if(e.key === 'Enter') sendMessage(); });

        this.subscribeToMessages(chatId);
        
        // Re-render Chat List to show active highlight
        // (Handled automatically by the global chat listener emitting updates, but we can force it)
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
        
        this.unsubscribeMessages = firestoreTools.onSnapshot(q, (snapshot) => {
            const container = document.getElementById('messages-scroll');
            if(!container) return;
            
            let html = '';
            if (snapshot.empty) {
                html = `<div style="text-align:center; padding-top:20px; color:var(--text-secondary);"><div class="date-badge" style="margin: 0 auto;">Today</div></div>`;
            } else {
                snapshot.forEach(docSnap => {
                    const msg = docSnap.data();
                    const isMe = msg.sender === authState.user.email.trim().toLowerCase();
                    html += `
                        <div class="message-bubble ${isMe ? 'out' : 'in'}">
                            <div class="message-text">${msg.text}</div>
                        </div>
                    `;
                });
            }
            container.innerHTML = html;
            container.scrollTop = container.scrollHeight;
        });
    }
};

window.koolaUI = UI;
