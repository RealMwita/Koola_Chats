function renderSettings() {
    const settingsItems = [
        { icon: "ri-key-line", title: "Account", desc: "Security notifications, change number", color: "#1074CF" },
        { icon: "ri-lock-2-line", title: "Privacy", desc: "Block contacts, disappearing messages", color: "#1074CF" },
        { icon: "ri-chat-1-line", title: "Chats", desc: "Theme, wallpapers, chat history", color: "#25D366" },
        { icon: "ri-notification-3-line", title: "Notifications", desc: "Message, group & call tones", color: "#EA0038" },
        { icon: "ri-database-2-line", title: "Storage and data", desc: "Network usage, auto-download", color: "#F88A31" },
        { icon: "ri-global-line", title: "App language", desc: "English (device's language)", color: "#667781" },
        { icon: "ri-question-line", title: "Help", desc: "Help center, contact us, privacy policy", color: "#1074CF" },
    ];

    let html = `
        <div class="view-content" style="background-color: var(--background-gray);">
            
            <!-- Profile Overview -->
            <div id="profile-edit-btn" class="list-item animate-entry" style="animation-delay: 0.1s; padding: 20px 16px; margin-bottom: 24px; background-color: var(--surface-white); border-bottom: 1px solid var(--border-color); cursor: pointer;">
                <div class="avatar-container" style="margin-right: 20px;">
                    <img src="${localStorage.getItem('koola_avatar') || 'https://i.pravatar.cc/150?u=myprofile'}" class="avatar" alt="My Profile" style="width: 68px; height: 68px; object-fit: cover;">
                </div>
                <div class="item-content" style="border-bottom: none; display: flex; justify-content: center;">
                    <div class="item-top">
                        <div class="item-title" style="font-size: 20px; font-weight: 500;">${localStorage.getItem('koola_name') || 'My Profile'}</div>
                    </div>
                    <div class="item-bottom" style="margin-top: 4px;">
                        <div class="item-subtitle" style="font-size: 15px;">${localStorage.getItem('koola_bio') || 'Hey there! I am using Koola Chats.'}</div>
                    </div>
                </div>
                <div style="padding: 8px; border-radius: 50%; background-color: var(--background-gray); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--primary-blue);">
                    <i class="ri-qr-code-line" style="font-size: 20px;"></i>
                </div>
            </div>

            <!-- Settings List -->
            <div style="background-color: var(--surface-white); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
    `;

    settingsItems.forEach((item, index) => {
        const delay = 0.15 + (index * 0.05);
        html += `
                <div class="list-item animate-entry" style="animation-delay: ${delay}s; padding: 12px 16px;">
                    <div style="margin-right: 20px; color: ${item.color}; flex-shrink: 0; width: 40px; text-align: center;">
                        <i class="${item.icon}" style="font-size: 24px;"></i>
                    </div>
                    <div class="item-content" style="border-bottom: ${index === settingsItems.length - 1 ? 'none' : '1px solid var(--border-color)'}; padding-bottom: 12px; margin-bottom: -12px;">
                        <div class="item-top">
                            <div class="item-title" style="font-weight: 500; font-size: 16px; color: var(--text-primary);">${item.title}</div>
                        </div>
                        <div class="item-bottom" style="margin-top: 2px;">
                            <div class="item-subtitle" style="font-size: 14px; color: var(--text-secondary);">${item.desc}</div>
                        </div>
                    </div>
                </div>
        `;
    });

    html += `
            </div>
            
            <div class="animate-entry" style="animation-delay: ${0.15 + (settingsItems.length * 0.05)}s; text-align: center; padding: 32px 24px;">
                <div style="font-size: 13px; color: var(--text-secondary); font-weight: 500; letter-spacing: 0.5px;">from</div>
                <div style="font-weight: 600; font-size: 16px; color: var(--text-primary); display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 4px;">
                    <i class="ri-infinity-line" style="color: var(--primary-blue); font-size: 20px;"></i> Antigravity
                </div>
            </div>
        </div>
    `;
    
    return html;
}

window.initSettings = function() {
    const profileEditBtn = document.getElementById("profile-edit-btn");
    if (profileEditBtn) {
        profileEditBtn.addEventListener("click", () => {
            const currentName = localStorage.getItem('koola_name') || 'My Profile';
            const currentBio = localStorage.getItem('koola_bio') || 'Hey there! I am using Koola Chats.';
            const currentAvatar = localStorage.getItem('koola_avatar') || 'https://i.pravatar.cc/150?u=myprofile';
            
            const html = `
                <div style="padding: 24px; color: var(--text-primary); display: flex; flex-direction: column; align-items: center;">
                    <div id="edit-avatar-container" style="width: 140px; height: 140px; background: var(--background-gray); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; overflow: hidden; margin-bottom: 32px; border: 3px solid var(--primary-blue);">
                        <img id="edit-avatar-preview" src="${currentAvatar}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.5); padding: 8px 0; text-align: center; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px;">
                            <i class="ri-camera-fill" style="margin-right: 4px;"></i> Edit
                        </div>
                    </div>
                    <input type="file" id="edit-avatar-input" accept="image/*" style="display:none;">
                    
                    <div style="width: 100%; background: var(--surface-white); border-radius: 12px; border: 1px solid var(--border-color); padding: 16px; margin-bottom: 16px;">
                        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Name</div>
                        <input type="text" id="edit-name-input" value="${currentName}" style="width: 100%; border: none; outline: none; background: transparent; font-size: 16px; color: var(--text-primary);">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">This is not your username or pin. This name will be visible to your Koola Chats contacts.</div>
                    </div>

                    <div style="width: 100%; background: var(--surface-white); border-radius: 12px; border: 1px solid var(--border-color); padding: 16px; margin-bottom: 32px;">
                        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">About</div>
                        <input type="text" id="edit-bio-input" value="${currentBio}" style="width: 100%; border: none; outline: none; background: transparent; font-size: 16px; color: var(--text-primary);">
                    </div>

                    <button id="save-profile-btn" class="round-btn" style="width: 100%; padding: 14px; border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 500; cursor: pointer; transition: background 0.3s, opacity 0.3s; background-color: var(--text-secondary); opacity: 0.5;">Save Changes</button>
                </div>
            `;
            
            if (window.openSubpage) {
                window.openSubpage("Profile", html);
                setTimeout(() => {
                    let newAvatarBase64 = currentAvatar;
                    const container = document.getElementById("edit-avatar-container");
                    const fileInput = document.getElementById("edit-avatar-input");
                    const preview = document.getElementById("edit-avatar-preview");
                    const saveBtn = document.getElementById("save-profile-btn");
                    const nameInput = document.getElementById("edit-name-input");
                    const bioInput = document.getElementById("edit-bio-input");

                    const checkChanges = () => {
                        const newName = nameInput.value.trim();
                        const newBio = bioInput.value.trim();
                        if (newName !== currentName || newBio !== currentBio || newAvatarBase64 !== currentAvatar) {
                            if (saveBtn) {
                                saveBtn.style.backgroundColor = 'var(--primary-blue)';
                                saveBtn.style.opacity = '1';
                            }
                        } else {
                            if (saveBtn) {
                                saveBtn.style.backgroundColor = 'var(--text-secondary)';
                                saveBtn.style.opacity = '0.5';
                            }
                        }
                    };

                    if(nameInput) nameInput.addEventListener("input", checkChanges);
                    if(bioInput) bioInput.addEventListener("input", checkChanges);

                    if(container) container.addEventListener("click", () => fileInput.click());
                    if(fileInput) fileInput.addEventListener("change", (e) => {
                        const file = e.target.files[0];
                        if(!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            newAvatarBase64 = ev.target.result;
                            preview.src = newAvatarBase64;
                            checkChanges();
                        };
                        reader.readAsDataURL(file);
                    });

                    if(saveBtn) saveBtn.addEventListener("click", () => {
                        const newName = nameInput.value.trim();
                        const newBio = bioInput.value.trim();
                        if(newName.length === 0) return;
                        if(newName === currentName && newBio === currentBio && newAvatarBase64 === currentAvatar) return;
                        
                        saveBtn.textContent = "Saving...";
                        
                        const phoneNumber = localStorage.getItem('koola_user');
                        const saveLocal = () => {
                            localStorage.setItem('koola_name', newName);
                            localStorage.setItem('koola_bio', newBio);
                            localStorage.setItem('koola_avatar', newAvatarBase64);
                            document.getElementById("close-subpage-btn").click();
                            setTimeout(() => document.querySelector(".nav-item[data-tab='settings']").click(), 350);
                        };

                        if(window.koolaFIREBASE_ACTIVE && phoneNumber) {
                            const { doc, setDoc } = window.koolaFirestore;
                            setDoc(doc(window.koolaDb, "users", phoneNumber), {
                                name: newName,
                                bio: newBio,
                                avatar: newAvatarBase64
                            }, {merge: true}).then(saveLocal).catch(()=>saveLocal());
                        } else {
                            saveLocal();
                        }
                    });
                }, 50);
            }
        });
    }

    const listItems = document.querySelectorAll(".settings-list .list-item");
    
    listItems.forEach(item => {
        item.addEventListener("click", () => {
            const titleEl = item.querySelector('.item-title');
            if (!titleEl) return;
            const title = titleEl.textContent;
            
            let description = item.querySelector('.item-subtitle')?.textContent || "";
            
            let html = '';
            let onMounted = null;

            if (title === "Chats") {
                const isDark = document.body.classList.contains("dark-mode");
                html = `
                    <div style="padding: 24px; color: var(--text-primary);">
                        <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Chats Settings</div>
                        <div style="font-size: 15px; color: var(--text-secondary); margin-bottom: 24px;">
                            Configure your display preferences and chat history.
                        </div>
                        
                        <div style="background: var(--surface-white); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
                            <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                                <span>Dark Mode</span>
                                <div id="theme-toggle" class="toggle-switch ${isDark ? 'on' : ''}">
                                    <div class="knob"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                onMounted = () => {
                    const toggle = document.getElementById("theme-toggle");
                    if (toggle) {
                        toggle.addEventListener("click", () => {
                            const willBeDark = toggle.classList.toggle("on");
                            if (willBeDark) {
                                document.body.classList.add("dark-mode");
                            } else {
                                document.body.classList.remove("dark-mode");
                            }
                        });
                    }
                };
            } else if (title === "Account") {
                html = `
                    <div style="padding: 24px; color: var(--text-primary);">
                        <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Account Settings</div>
                        <div style="font-size: 15px; color: var(--text-secondary); margin-bottom: 24px;">
                            Manage your registration and security.
                        </div>
                        <button id="logout-btn" style="width: 100%; padding: 14px; background-color: var(--danger-red); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: var(--shadow-sm);">
                            Log Out
                        </button>
                    </div>
                `;
                onMounted = () => {
                    const logoutBtn = document.getElementById("logout-btn");
                    if (logoutBtn) {
                        logoutBtn.addEventListener("click", () => {
                            localStorage.removeItem('koola_user');
                            window.location.reload();
                        });
                    }
                };
            } else {
                html = `
                    <div style="padding: 24px; color: var(--text-primary);">
                        <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${title} Settings</div>
                        <div style="font-size: 15px; color: var(--text-secondary); margin-bottom: 24px;">
                            Configure your ${title.toLowerCase()} preferences. (${description})
                        </div>
                        
                        <div style="background: var(--surface-white); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden;">
                            <div style="padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                <span>Enable feature</span>
                                <div class="toggle-switch on"><div class="knob"></div></div>
                            </div>
                            <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                                <span>Advanced options</span>
                                <i class="ri-arrow-right-s-line" style="color: var(--text-secondary);"></i>
                            </div>
                        </div>
                        <div style="margin-top: 32px; text-align: center; color: var(--text-secondary); font-size: 13px;">
                            Mock feature. Changes made here aren't saved.
                        </div>
                    </div>
                `;
            }
            
            if (window.openSubpage) {
                window.openSubpage(title, html);
                if (onMounted) setTimeout(onMounted, 50);
            }
        });
    });

    const qrIcon = document.querySelector(".qr-icon");
    if (qrIcon) {
        qrIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            alert("Displaying your Koola Chats QR Code...");
        });
    }
};
