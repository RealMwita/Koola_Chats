function renderMessaging(chatId, chatName = "Unknown", chatAvatar = null, chatInitials = "#") {
    let avatarHtml = chatAvatar 
        ? `<img src="${chatAvatar}" class="avatar" alt="${chatName}" style="width: 40px; height: 40px;">`
        : `<div class="avatar-text" style="width: 40px; height: 40px; font-size: 16px;">${chatInitials}</div>`;

    let html = `
        <!-- Chat Header -->
        <header class="chat-header">
            <button class="icon-btn back-btn" id="close-chat-btn" style="margin-right: 8px;">
                <i class="ri-arrow-left-line"></i>
            </button>
            <div class="chat-header-info">
                ${avatarHtml}
                <div class="chat-header-text">
                    <div class="chat-name">${chatName}</div>
                    <div class="chat-status">tap here for contact info</div>
                </div>
            </div>
            <div class="header-actions">
                <button class="icon-btn" id="video-call-btn"><i class="ri-video-add-fill"></i></button>
                <button class="icon-btn" id="audio-call-btn"><i class="ri-phone-fill"></i></button>
                <button class="icon-btn"><i class="ri-more-2-fill"></i></button>
            </div>
        </header>

        <!-- Message History Area -->
        <div class="messages-area">
            <div class="date-badge">TODAY</div>
    `;

    if (!window.koolaFIREBASE_ACTIVE) {
        const messages = window.MOCK_MESSAGES && window.MOCK_MESSAGES[chatId] ? window.MOCK_MESSAGES[chatId] : [];
        messages.forEach((msg, index) => {
            const isMe = msg.sender === 'me';
            html += `
                <div class="message-bubble ${isMe ? 'me' : 'them'} animate-entry" style="animation-delay: ${0.1 + (index * 0.05)}s;">
                    ${msg.name ? `<div class="sender-name">${msg.name}</div>` : ''}
                    <div class="message-text">${msg.text}</div>
                    <div class="message-time">
                        ${msg.time}
                        ${isMe ? `<i class="ri-check-double-line read-receipt" style="font-size: 12px; margin-left: 4px;"></i>` : ''}
                    </div>
                </div>
            `;
        });
    }

    html += `
        </div>

        <!-- Bottom Input Area -->
        <div class="chat-input-area">
            <button class="icon-btn text-icon"><i class="ri-add-line"></i></button>
            <div class="input-wrapper" style="flex-grow: 1; display: flex; align-items: center; background-color: var(--surface-white); border-radius: 20px; padding: 4px 8px; border: 1px solid var(--border-color);">
                <input type="text" placeholder="Type a message" id="chat-input-field" style="flex-grow: 1; border: none; outline: none; background: transparent; padding: 8px; font-size: 15px;">
                <button class="icon-btn text-icon inside" id="attach-file-btn" style="color: var(--text-secondary);"><i class="ri-file-copy-2-line"></i></button>
                <button class="icon-btn text-icon inside" id="attach-camera-btn" style="color: var(--text-secondary);"><i class="ri-camera-fill"></i></button>
                <input type="file" id="hidden-file-input" accept="image/*,video/*" style="display:none;">
                <input type="file" id="hidden-camera-input" accept="image/*,video/*" capture="environment" style="display:none;">
            </div>
            <button class="round-btn primary-bg" id="send-msg-btn" style="width: 44px; height: 44px; border-radius: 50%; background-color: var(--primary-blue); color: white; border: none; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-left: 8px;">
                <i class="ri-mic-fill"></i>
            </button>
        </div>
    `;

    return html;
}
