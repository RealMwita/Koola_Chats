function renderChats() {
    let html = `
        <div class="view-content">
            <div class="search-container animate-entry" style="animation-delay: 0.1s">
                <div class="search-input-wrapper">
                    <i class="ri-search-line"></i>
                    <input type="text" placeholder="Search chats...">
                </div>
            </div>
            <div class="chat-list">
    `;

    MOCK_CHATS.forEach((chat, index) => {
        const delay = 0.1 + (index * 0.05);
        
        let avatarHtml = '';
        if (chat.avatar) {
            avatarHtml = `<img src="${chat.avatar}" class="avatar" alt="${chat.name}">`;
        } else {
            avatarHtml = `<div class="avatar-text">${chat.initials}</div>`;
        }

        const onlineHtml = chat.isOnline ? `<div class="online-indicator"></div>` : '';

        let badgeHtml = '';
        if (chat.unread > 0) {
            badgeHtml = `<div class="unread-badge">${chat.unread}</div>`;
        } else if (chat.readStatus === 'read') {
            badgeHtml = `<i class="ri-check-double-line read-receipt"></i>`;
        } else if (chat.readStatus === 'missed_call') {
            badgeHtml = ``; 
        }

        let subtitlePrefix = '';
        if (chat.readStatus === 'missed_call') {
            subtitlePrefix = `<i class="ri-close-circle-line" style="color: var(--danger-red); font-size: 16px; margin-right: 4px;"></i>`;
        } else if (chat.type === 'image') {
            subtitlePrefix = `<i class="ri-image-2-fill" style="color: var(--text-secondary); font-size: 16px; margin-right: 4px;"></i>`;
        }

        html += `
            <div class="list-item animate-entry" data-id="${chat.id}" style="animation-delay: ${delay}s">
                <div class="avatar-container">
                    ${avatarHtml}
                    ${onlineHtml}
                </div>
                <div class="item-content">
                    <div class="item-top">
                        <div class="item-title">${chat.name}</div>
                        <div class="item-time ${chat.unread > 0 ? 'recent' : ''}">${chat.time}</div>
                    </div>
                    <div class="item-bottom">
                        <div class="item-subtitle">
                            ${subtitlePrefix} ${chat.lastMessage}
                        </div>
                        ${badgeHtml}
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;
    return html;
}

window.initChats = function() {
    const searchInput = document.querySelector(".search-input-wrapper input");
    const chatList = document.querySelector(".chat-list");
    const fabBtn = document.getElementById("fab-btn");

    if (fabBtn) {
        // Clear previous listeners to avoid duplicates on tab switch
        const newFab = fabBtn.cloneNode(true);
        fabBtn.parentNode.replaceChild(newFab, fabBtn);
        newFab.addEventListener("click", async () => {
            let contactPhone = null;
            let contactName = "Unknown";

            // Try true Native Contacts API (Supported on modern Android PWAs/WebViews)
            if ('contacts' in navigator) {
                try {
                    const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
                    if (contacts.length > 0 && contacts[0].tel && contacts[0].tel.length > 0) {
                        contactPhone = contacts[0].tel[0].replace(/[^\d\+]/g, '');
                        contactName = (contacts[0].name && contacts[0].name.length > 0) ? contacts[0].name[0] : contactPhone;
                    } else if (contacts.length > 0) {
                        alert("Selected contact does not have a phone number.");
                        return;
                    } else {
                        return; // User cancelled
                    }
                } catch (ex) {
                    console.warn("Contact Picker restricted. Fallback initiated.", ex);
                }
            }

            // Fallback for iOS/Desktop testing
            if (!contactPhone) {
                const input = prompt("Enter the phone number of the person you want to chat with:");
                if (!input) return;
                contactPhone = input.replace(/[^\d\+]/g, '');
                contactName = contactPhone;
            }

            if (contactPhone && contactPhone.length >= 7) {
                const myPhone = localStorage.getItem('koola_user');
                const chatId = [myPhone, contactPhone].sort().join('_');
                
                if (window.koolaFIREBASE_ACTIVE) {
                    const { doc, setDoc, serverTimestamp } = window.koolaFirestore;
                    setDoc(doc(window.koolaDb, "chats", chatId), {
                        participants: [myPhone, contactPhone],
                        timestamp: serverTimestamp(),
                        lastMessage: "Chat started by " + localStorage.getItem('koola_name')
                    }, { merge: true }).then(() => {
                        if (window.openChat) window.openChat(chatId, contactName, null, contactName.charAt(0));
                    });
                } else {
                    if (window.openChat) window.openChat(chatId, contactName, null, contactName.charAt(0));
                }
            }
        });
    }

    if (window.koolaFIREBASE_ACTIVE) {
        const currentUser = localStorage.getItem('koola_user');
        const { collection, onSnapshot, query, where, orderBy } = window.koolaFirestore;
        
        if (chatList) {
            chatList.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-secondary);"><i class="ri-loader-4-line pulse" style="font-size: 32px; color: var(--primary-blue);"></i><br><br>Loading live chats...</div>`;
            
            try {
                const chatsRef = collection(window.koolaDb, "chats");
                const q = query(chatsRef, where("participants", "array-contains", currentUser), orderBy("timestamp", "desc"));
                
                onSnapshot(q, (snapshot) => {
                    let html = '';
                    if (snapshot.empty) {
                        html = `<div class="empty-state"><i class="ri-chat-3-line" style="font-size: 48px; color: var(--text-secondary);"></i><p>No active chats found on Firebase.</p></div>`;
                    } else {
                        snapshot.forEach((docSnap, index) => {
                            const chat = docSnap.data();
                            chat.id = docSnap.id;
                            
                            let avatarHtml = chat.avatar ? `<img src="${chat.avatar}" class="avatar" alt="Avatar">` : `<div class="avatar-text">${chat.name ? chat.name.charAt(0) : '#'}</div>`;
                            let badgeHtml = chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : '';
                            
                            html += `
                                <div class="list-item animate-entry" data-id="${chat.id}" style="animation-delay: 0s">
                                    <div class="avatar-container">${avatarHtml}</div>
                                    <div class="item-content">
                                        <div class="item-top">
                                            <div class="item-title">${chat.name || 'Unknown'}</div>
                                            <div class="item-time">${chat.time || ''}</div>
                                        </div>
                                        <div class="item-bottom">
                                            <div class="item-subtitle">${chat.lastMessage || '...'}</div>
                                            ${badgeHtml}
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                    }
                    chatList.innerHTML = html;
                    
                    const chats = document.querySelectorAll(".chat-list .list-item");
                    chats.forEach(chat => {
                        chat.addEventListener("click", () => {
                            const id = chat.getAttribute("data-id");
                            const nameEl = chat.querySelector(".item-title");
                            const name = nameEl ? nameEl.textContent : "Unknown";
                            const avatarEl = chat.querySelector(".avatar-container img");
                            const avatar = avatarEl ? avatarEl.getAttribute("src") : null;
                            const initialsEl = chat.querySelector(".avatar-text");
                            const initials = initialsEl ? initialsEl.textContent : "#";
                            
                            if (id && window.openChat) window.openChat(id, name, avatar, initials);
                        });
                    });
                }, (error) => {
                    console.error("Firestore listener error:", error);
                    chatList.innerHTML = `<div class="empty-state" style="color: var(--danger-red)"><i class="ri-error-warning-line"></i><div>Database Error. Check Console.</div></div>`;
                });
            } catch (err) {
                console.error("Firestore error setup:", err);
            }
        }
    }

    if (searchInput && chatList && !window.koolaFIREBASE_ACTIVE) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = MOCK_CHATS.filter(c => c.name.toLowerCase().includes(term) || (c.lastMessage && c.lastMessage.toLowerCase().includes(term)));
            
            let html = '';
            if (filtered.length === 0) {
                html = `<div class="empty-state"><i class="ri-search-line"></i><div>No chats found</div></div>`;
            } else {
                filtered.forEach((chat, index) => {
                    const delay = Math.min(0.1 + (index * 0.05), 0.3); // cap delay
                    let avatarHtml = chat.avatar ? `<img src="${chat.avatar}" class="avatar" alt="${chat.name}">` : `<div class="avatar-text">${chat.initials}</div>`;
                    const onlineHtml = chat.isOnline ? `<div class="online-indicator"></div>` : '';
                    let badgeHtml = '';
                    if (chat.unread > 0) badgeHtml = `<div class="unread-badge">${chat.unread}</div>`;
                    else if (chat.readStatus === 'read') badgeHtml = `<i class="ri-check-double-line read-receipt"></i>`;
                    let subtitlePrefix = '';
                    if (chat.readStatus === 'missed_call') subtitlePrefix = `<i class="ri-close-circle-line" style="color: var(--danger-red); font-size: 16px; margin-right: 4px;"></i>`;
                    else if (chat.type === 'image') subtitlePrefix = `<i class="ri-image-2-fill" style="color: var(--text-secondary); font-size: 16px; margin-right: 4px;"></i>`;
                    
                    html += `
                        <div class="list-item" data-id="${chat.id}" style="animation: fadeIn 0.3s ease-out forwards; animation-delay: 0s">
                            <div class="avatar-container">${avatarHtml}${onlineHtml}</div>
                            <div class="item-content">
                                <div class="item-top">
                                    <div class="item-title">${chat.name}</div>
                                    <div class="item-time ${chat.unread > 0 ? 'recent' : ''}">${chat.time}</div>
                                </div>
                                <div class="item-bottom">
                                    <div class="item-subtitle">${subtitlePrefix} ${chat.lastMessage}</div>
                                    ${badgeHtml}
                                </div>
                            </div>
                        </div>`;
                });
            }
            chatList.innerHTML = html;
            
            // Reattach listeners to newly created elements
            const chats = document.querySelectorAll(".chat-list .list-item");
            chats.forEach(chat => {
                chat.addEventListener("click", () => {
                    const id = chat.getAttribute("data-id");
                    if (id && window.openChat) window.openChat(id);
                });
            });
        });
    }
};
