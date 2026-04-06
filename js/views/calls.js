function renderCalls() {
    let html = `
        <div class="view-content" style="background-color: var(--background-gray);">
            <div class="action-cards animate-entry" style="animation-delay: 0.1s">
                <div class="card-item create-link">
                    <div class="icon-circle">
                        <i class="ri-links-line"></i>
                    </div>
                    <div class="card-info">
                        <div class="card-title">Create call link</div>
                        <div class="card-desc">Share a link for your Koola call</div>
                    </div>
                </div>
                
                <div class="card-item favorites" style="margin-left: 0;">
                    <div class="icon-circle">
                        <i class="ri-star-fill"></i>
                    </div>
                    <div class="card-info">
                        <div class="card-title">Favorites</div>
                        <div class="card-desc">Quick access to frequent contacts</div>
                    </div>
                </div>
            </div>

            <div class="section-header animate-entry" style="animation-delay: 0.15s">Recent Calls</div>
            <div class="call-list" style="background-color: var(--surface-white); border-radius: 20px; overflow: hidden; margin: 0 16px;">
    `;

    MOCK_CALLS.forEach((call, index) => {
        const delay = 0.2 + (index * 0.05);

        let callSubtitle = '';
        if (call.type === 'missed') {
            callSubtitle = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--danger-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
        } else if (call.type === 'incoming') {
            callSubtitle = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><polyline points="16 2 16 8 22 8"></polyline><line x1="23" y1="1" x2="16" y2="8"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
        } else if (call.type === 'outgoing') {
            callSubtitle = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><polyline points="23 7 23 1 17 1"></polyline><line x1="16" y1="8" x2="23" y2="1"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
        }

        const callTypeIcon = call.callType === 'video' ? `<i class="ri-video-chat-fill call-type"></i>` : `<i class="ri-phone-fill call-type"></i>`;

        html += `
                <div class="list-item animate-entry" style="animation-delay: ${delay}s; padding: 16px;">
                    <div class="avatar-container">
                        <img src="${call.avatar}" class="avatar" alt="${call.name}" style="width: 48px; height: 48px;">
                    </div>
                    <div class="item-content" style="border-bottom: ${index === MOCK_CALLS.length - 1 ? 'none' : '1px solid var(--border-color)'};">
                        <div class="item-top">
                            <div class="item-title" style="font-weight: 500; ${call.type === 'missed' ? 'color: var(--danger-red);' : ''}">${call.name}</div>
                        </div>
                        <div class="item-bottom">
                            <div class="item-subtitle">
                                ${callSubtitle} <span style="margin-left: 4px;">${call.time}</span>
                            </div>
                        </div>
                    </div>
                    <div class="call-action" style="margin-left: 16px; display: flex; align-items: center;">
                        ${callTypeIcon}
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

window.initCalls = function() {
    const fabBtn = document.getElementById("fab-btn");
    if (fabBtn) {
        const newFab = fabBtn.cloneNode(true);
        fabBtn.parentNode.replaceChild(newFab, fabBtn);
        newFab.addEventListener("click", () => alert("Select a contact to start a new call"));
    }

    const createLinkCard = document.querySelector(".card-item.create-link");
    if (createLinkCard) {
        createLinkCard.addEventListener("click", () => alert("Mock logic: Generated call link 'koola.chat/call/xkcd-mock-123'"));
    }

    const favoritesCard = document.querySelector(".card-item.favorites");
    if (favoritesCard) {
        favoritesCard.addEventListener("click", () => alert("Opening Favorites list..."));
    }

    const callItems = document.querySelectorAll(".call-list .list-item");
    callItems.forEach(item => {
        item.addEventListener("click", () => {
            const name = item.querySelector('.item-title').textContent;
            if (window.openSubpage) {
                window.openSubpage(`Call Info: ${name}`, `<div style="padding: 24px; text-align: center; color: var(--text-secondary);">Call history details for ${name} will appear here.</div>`);
            }
        });

        const iconAction = item.querySelector('.call-action');
        if (iconAction) {
            iconAction.addEventListener("click", (e) => {
                e.stopPropagation();
                const name = item.querySelector('.item-title').textContent;
                const isVideo = iconAction.querySelector('.ri-video-chat-fill') !== null;
                alert(`Initiating mock ${isVideo ? 'video' : 'audio'} call to ${name}...`);
            });
        }
    });
};
