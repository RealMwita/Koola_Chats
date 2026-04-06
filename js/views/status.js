function renderStatus() {
    let html = `
        <div class="view-content" style="background-color: var(--background-gray);">
            
            <div class="list-item animate-entry" style="animation-delay: 0.1s; margin-top: 0; background-color: var(--surface-white); padding: 16px;">
                <div class="avatar-container">
                    <img src="https://i.pravatar.cc/150?u=myprofile" class="avatar" alt="My Status" style="width: 54px; height: 54px; padding: 2px; border: 2px solid var(--border-color);">
                    <div style="position: absolute; bottom: 0; right: 0; background-color: var(--primary-blue); color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid var(--surface-white); font-weight: bold;">+</div>
                </div>
                <div class="item-content" style="border-bottom: none; display: flex; justify-content: center; margin-left: 8px;">
                    <div class="item-top">
                        <div class="item-title" style="font-weight: 600; font-size: 17px;">My status</div>
                    </div>
                    <div class="item-bottom">
                        <div class="item-subtitle" style="font-size: 14px; margin-top: 2px;">Tap to add status update</div>
                    </div>
                </div>
            </div>

            <div class="section-header animate-entry" style="animation-delay: 0.15s; padding-bottom: 12px; padding-top: 20px;">Recent Updates</div>
            
            <div style="background-color: var(--surface-white);">
    `;

    MOCK_STATUS.filter(s => !s.viewed).forEach((status, index) => {
        const delay = 0.2 + (index * 0.05);
        html += `
                <div class="list-item animate-entry" style="animation-delay: ${delay}s;">
                    <div class="avatar-container">
                        <img src="${status.avatar}" class="avatar" alt="${status.name}" style="width: 54px; height: 54px; padding: 2px; border: 2.5px solid var(--primary-blue);">
                    </div>
                    <div class="item-content" style="border-bottom: 1px solid var(--border-color); margin-left: 8px;">
                        <div class="item-top"><div class="item-title" style="font-weight: 600; font-size: 17px;">${status.name}</div></div>
                        <div class="item-bottom"><div class="item-subtitle" style="margin-top: 2px;">${status.time}</div></div>
                    </div>
                </div>
        `;
    });

    html += `
            </div>
            <div class="section-header animate-entry" style="animation-delay: 0.25s; padding-bottom: 12px; padding-top: 20px;">Viewed Updates</div>
            <div style="background-color: var(--surface-white);">
    `;

    MOCK_STATUS.filter(s => s.viewed).forEach((status, index) => {
        const delay = 0.3 + (index * 0.05);
        html += `
                <div class="list-item animate-entry" style="animation-delay: ${delay}s;">
                    <div class="avatar-container">
                        <img src="${status.avatar}" class="avatar" alt="${status.name}" style="width: 54px; height: 54px; padding: 2px; border: 2.5px solid var(--text-secondary); filter: grayscale(30%); opacity: 0.9;">
                    </div>
                    <div class="item-content" style="border-bottom: ${index === Object.values(MOCK_STATUS).filter(s => s.viewed).length - 1 ? 'none' : '1px solid var(--border-color)'}; margin-left: 8px;">
                        <div class="item-top"><div class="item-title" style="font-weight: 600; font-size: 17px;">${status.name}</div></div>
                        <div class="item-bottom"><div class="item-subtitle" style="margin-top: 2px;">${status.time}</div></div>
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

window.initStatus = function() {
    const fabBtn = document.getElementById("fab-btn");
    if (fabBtn) {
        const newFab = fabBtn.cloneNode(true);
        fabBtn.parentNode.replaceChild(newFab, fabBtn);
        newFab.addEventListener("click", () => alert("Opening device camera to record status..."));
    }

    const addStatusBtn = document.querySelector(".add-status");
    if (addStatusBtn) {
        addStatusBtn.addEventListener("click", () => alert("Opening status upload screen..."));
    }

    const statusItems = document.querySelectorAll(".status-list .list-item");
    statusItems.forEach(item => {
        item.addEventListener("click", () => {
            const name = item.querySelector('.item-title').textContent;
            const time = item.querySelector('.item-time').textContent;
            const avatarHtml = item.querySelector('.avatar-container').innerHTML;

            const viewerHtml = `
                <div style="height: 100%; display: flex; flex-direction: column; background-color: #000; color: white;">
                    <div style="padding: 16px; flex-grow: 1; display: flex; align-items: center; justify-content: center; position: relative;">
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; display: flex; gap: 4px; padding: 4px 16px;">
                            <div style="flex: 1; background: rgba(255,255,255,0.3); border-radius: 2px;"></div>
                            <div style="flex: 1; background: white; border-radius: 2px;"></div>
                            <div style="flex: 1; background: rgba(255,255,255,0.3); border-radius: 2px;"></div>
                        </div>
                        <div style="text-align: center;">
                            <i class="ri-image-2-fill" style="font-size: 64px; color: #555;"></i>
                            <div style="margin-top: 16px; font-size: 14px; opacity: 0.8;">Mock Status Image for ${name}</div>
                        </div>
                    </div>
                    <div style="text-align: center; padding: 16px; opacity: 0.8;">
                        <i class="ri-arrow-up-s-line" style="font-size: 24px;"></i>
                        <div>Reply</div>
                    </div>
                </div>
            `;
            if (window.openSubpage) window.openSubpage(`${name}'s Status`, viewerHtml);
            
            // Mark as viewed visually if not already
            const indicator = item.querySelector(".status-ring");
            if (indicator && indicator.classList.contains("unviewed")) {
                indicator.classList.remove("unviewed");
                indicator.classList.add("viewed");
            }
        });
    });
};
