document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.getElementById("main-content");
    const headerTitle = document.getElementById("header-title");
    const messagingContainer = document.getElementById("messaging-container");
    const subpageContainer = document.getElementById("subpage-container");
    const headerIcon = document.getElementById("header-icon");
    const searchBtn = document.getElementById("header-search-btn");
    const fabBtn = document.getElementById("fab-btn");
    const navItems = document.querySelectorAll(".nav-item");
    const moreBtn = document.querySelector(".more-btn");
    const headerDropdown = document.getElementById("header-dropdown");

    function updateDropdownContent(options) {
        if (!headerDropdown) return;
        headerDropdown.innerHTML = '';
        if (options.length === 0) {
            if (moreBtn) moreBtn.classList.add("hidden");
            return;
        } else {
            if (moreBtn) moreBtn.classList.remove("hidden");
        }
        
        options.forEach(opt => {
            const div = document.createElement("div");
            div.className = "dropdown-item";
            div.textContent = opt;
            div.addEventListener("click", () => {
                headerDropdown.classList.add("hidden");
                alert(`${opt} clicked!`);
            });
            headerDropdown.appendChild(div);
        });
    }

    function renderView(tab) {
        if (tab === "chats") {
            mainContent.innerHTML = renderChats();
            attachChatListeners();
            if (typeof initChats === 'function') initChats();
            headerTitle.textContent = "Chats";
            headerIcon.className = "ri-message-3-fill app-logo";
            searchBtn.classList.remove("hidden");
            fabBtn.innerHTML = '<i class="ri-message-2-fill"></i>';
            fabBtn.style.display = "flex";
            updateDropdownContent(["New group", "New broadcast", "Linked devices", "Starred messages", "Settings"]);
        } else if (tab === "calls") {
            mainContent.innerHTML = renderCalls();
            if (typeof initCalls === 'function') initCalls();
            headerTitle.textContent = "Calls";
            headerIcon.className = "ri-phone-fill app-logo";
            searchBtn.classList.remove("hidden");
            fabBtn.innerHTML = '<i class="ri-phone-fill"></i>';
            fabBtn.style.display = "flex";
            updateDropdownContent(["Clear call log", "Settings"]);
        } else if (tab === "status") {
            mainContent.innerHTML = renderStatus();
            if (typeof initStatus === 'function') initStatus();
            headerTitle.textContent = "Status";
            headerIcon.className = "ri-donut-chart-fill app-logo";
            searchBtn.classList.add("hidden");
            fabBtn.innerHTML = '<i class="ri-camera-fill"></i>';
            fabBtn.style.display = "flex";
            updateDropdownContent(["Status privacy", "Settings"]);
        } else if (tab === "settings") {
            mainContent.innerHTML = renderSettings();
            if (typeof initSettings === 'function') initSettings();
            headerTitle.textContent = "Settings";
            headerIcon.className = "ri-settings-3-fill app-logo";
            searchBtn.classList.add("hidden");
            fabBtn.style.display = "none";
            updateDropdownContent([]); // Hide more-btn completely for settings
        }
        
        mainContent.scrollTop = 0;
    }

    function openChat(chatId, chatName, chatAvatar, chatInitials) {
        messagingContainer.innerHTML = renderMessaging(chatId, chatName, chatAvatar, chatInitials);
        messagingContainer.classList.add("active");
        
        const closeBtn = document.getElementById("close-chat-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                if (window.koolaCurrentChatUnsub) {
                    window.koolaCurrentChatUnsub();
                    window.koolaCurrentChatUnsub = null;
                }
                messagingContainer.classList.remove("active");
                setTimeout(() => { messagingContainer.innerHTML = ''; }, 300);
            });
        }

        const msgsArea = document.querySelector(".messages-area");

        if (window.koolaFIREBASE_ACTIVE && msgsArea) {
            const { collection, onSnapshot, query, orderBy } = window.koolaFirestore;
            msgsArea.innerHTML = `<div style="text-align:center; padding: 20px;"><i class="ri-loader-4-line pulse" style="font-size: 24px;"></i></div>`;
            
            const msgsRef = collection(window.koolaDb, "chats", chatId, "messages");
            const q = query(msgsRef, orderBy("timestamp", "asc"));
            
            window.koolaCurrentChatUnsub = onSnapshot(q, (snapshot) => {
                msgsArea.innerHTML = '';
                const currentUser = localStorage.getItem('koola_user');
                snapshot.forEach(docSnap => {
                    const msg = docSnap.data();
                    const isMe = msg.sender === currentUser;
                    const bubble = document.createElement("div");
                    bubble.className = "message-bubble " + (isMe ? "me" : "them");
                    bubble.style.marginBottom = "4px";
                    
                    let contentHtml = '';
                    if (msg.image) {
                        contentHtml += `<img src="${msg.image}" style="max-width: 100%; border-radius: 8px; margin-bottom: 4px;" alt="Attached Image">`;
                    }
                    if (msg.audio) {
                        contentHtml += `<audio controls src="${msg.audio}" style="width: 220px; max-width: 100%; margin-bottom: 4px; height: 40px; outline: none; border-radius: 20px;"></audio>`;
                    }
                    if (msg.text) {
                        contentHtml += `<div class="message-text">${msg.text}</div>`;
                    }
                    
                    let tickColor = "var(--text-secondary)";
                    let tickIcon = "ri-check-line";
                    if (msg.status === "delivered") {
                        tickIcon = "ri-check-double-line";
                    } else if (msg.status === "read") {
                        tickIcon = "ri-check-double-line";
                        tickColor = "var(--primary-blue)";
                    }
                    
                    const timeObj = msg.timestamp ? msg.timestamp.toDate() : null;
                    const timeStr = window.formatTimeAgo ? window.formatTimeAgo(timeObj) : 'Just now';
                    const exactTimeMillis = timeObj ? timeObj.getTime() : 0;
                    
                    // Trigger read receipt since we are looking at this message!
                    if (!isMe && msg.status !== "read" && msg.timestamp && document.visibilityState === "visible") {
                        const { doc, updateDoc } = window.koolaFirestore;
                        updateDoc(doc(window.koolaDb, "chats", chatId, "messages", docSnap.id), {
                            status: "read"
                        }).catch(()=>{});
                    }
                    
                    bubble.innerHTML = `${contentHtml}<div class="message-time" data-time="${exactTimeMillis}">${timeStr} ${isMe ? `<i class="${tickIcon} read-receipt" style="font-size: 14px; margin-left: 4px; color: ${tickColor};"></i>` : ''}</div>`;
                    msgsArea.appendChild(bubble);
                });
                msgsArea.scrollTop = msgsArea.scrollHeight;
            });
        }

        const chatInput = document.getElementById("chat-input-field");
        const sendBtn = document.getElementById("send-msg-btn");
        const sendBtnIcon = document.querySelector("#send-msg-btn i");
        
        let mediaRecorder;
        let audioChunks = [];
        let isRecording = false;

        async function handleSend() {
            if (sendBtnIcon && sendBtnIcon.classList.contains("ri-mic-fill")) {
                if (!isRecording) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        mediaRecorder.start();
                        isRecording = true;
                        
                        chatInput.placeholder = "Recording... tap right icon to stop";
                        chatInput.disabled = true;
                        sendBtnIcon.className = "ri-stop-circle-line";
                        sendBtnIcon.style.color = "var(--danger-red)";
                        
                        mediaRecorder.addEventListener("dataavailable", event => {
                            audioChunks.push(event.data);
                        });
                        
                        mediaRecorder.addEventListener("stop", () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                            audioChunks = [];
                            isRecording = false;
                            
                            chatInput.placeholder = "Type a message";
                            chatInput.disabled = false;
                            sendBtnIcon.className = "ri-mic-fill";
                            sendBtnIcon.style.color = "";
                            
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                if (window.koolaFIREBASE_ACTIVE) {
                                    const { collection, addDoc, serverTimestamp, doc, setDoc } = window.koolaFirestore;
                                    addDoc(collection(window.koolaDb, "chats", chatId, "messages"), {
                                        sender: localStorage.getItem('koola_user'),
                                        audio: e.target.result,
                                        status: "sent",
                                        timestamp: serverTimestamp()
                                    });
                                    setDoc(doc(window.koolaDb, "chats", chatId), {
                                        lastMessage: "🎤 Audio message",
                                        timestamp: serverTimestamp()
                                    }, { merge: true });
                                }
                            };
                            reader.readAsDataURL(audioBlob);
                        });
                    } catch(err) {
                        alert("Microphone access denied: " + err.message);
                    }
                } else {
                    // Stop recording action
                    mediaRecorder.stop();
                    mediaRecorder.stream.getTracks().forEach(t => t.stop());
                }
                return;
            }

            if (!chatInput || chatInput.value.trim().length === 0) return;
            const text = chatInput.value.trim();
            chatInput.value = '';
            if (sendBtnIcon) sendBtnIcon.className = "ri-mic-fill";
            
            if (window.koolaFIREBASE_ACTIVE) {
                const { collection, addDoc, serverTimestamp, doc, setDoc } = window.koolaFirestore;
                addDoc(collection(window.koolaDb, "chats", chatId, "messages"), {
                    sender: localStorage.getItem('koola_user'),
                    text: text,
                    status: "sent",
                    timestamp: serverTimestamp()
                });
                setDoc(doc(window.koolaDb, "chats", chatId), {
                    lastMessage: text,
                    timestamp: serverTimestamp()
                }, { merge: true });
            } else {
                if (!window.MOCK_MESSAGES) window.MOCK_MESSAGES = {};
                if (!window.MOCK_MESSAGES[chatId]) window.MOCK_MESSAGES[chatId] = [];
                
                window.MOCK_MESSAGES[chatId].push({
                    id: Date.now(), sender: "me", text: text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                });
                
                if (msgsArea) {
                    const bubble = document.createElement("div");
                    bubble.className = "message-bubble me animate-entry";
                    bubble.innerHTML = `<div class="message-text">${text}</div><div class="message-time">Just now <i class="ri-check-double-line read-receipt" style="font-size: 12px; margin-left: 4px;"></i></div>`;
                    msgsArea.appendChild(bubble);
                    msgsArea.scrollTop = msgsArea.scrollHeight;
                }
            }
        }
        
        if (sendBtn) {
            sendBtn.addEventListener("click", handleSend);
        }

        if (chatInput && sendBtnIcon) {
            chatInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") handleSend();
            });
            
            chatInput.addEventListener("input", (e) => {
                if (e.target.value.trim().length > 0) {
                    sendBtnIcon.className = "ri-send-plane-fill";
                } else {
                    sendBtnIcon.className = "ri-mic-fill";
                }
            });
        }

        // Media Upload Handlers
        const fileBtn = document.getElementById("attach-file-btn");
        const cameraBtn = document.getElementById("attach-camera-btn");
        const fileInput = document.getElementById("hidden-file-input");
        const cameraInput = document.getElementById("hidden-camera-input");

        if (fileBtn && fileInput) fileBtn.addEventListener("click", () => fileInput.click());
        if (cameraBtn && cameraInput) cameraBtn.addEventListener("click", () => cameraInput.click());

        function handleMediaUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result;
                if (window.koolaFIREBASE_ACTIVE) {
                    const { collection, addDoc, serverTimestamp, doc, setDoc } = window.koolaFirestore;
                    addDoc(collection(window.koolaDb, "chats", chatId, "messages"), {
                        sender: localStorage.getItem('koola_user'),
                        text: "📷 Image attached",
                        image: base64Data,
                        timestamp: serverTimestamp()
                    });
                    setDoc(doc(window.koolaDb, "chats", chatId), {
                        lastMessage: "📷 Photo",
                        timestamp: serverTimestamp()
                    }, { merge: true });
                }
            };
            reader.readAsDataURL(file);
        }

        if (fileInput) fileInput.addEventListener("change", handleMediaUpload);
        if (cameraInput) cameraInput.addEventListener("change", handleMediaUpload);

        // WebRTC Call Handlers
        const videoBtn = document.getElementById("video-call-btn");
        const audioBtn = document.getElementById("audio-call-btn");

        async function initiateCall(videoEnabled) {
            if (!window.koolaFIREBASE_ACTIVE) return alert("Firebase required for calls.");
            const { collection, doc, setDoc, addDoc, onSnapshot } = window.koolaFirestore;

            let localStream;
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true });
            } catch(err) {
                return alert("Camera/Microphone access denied: " + err.message);
            }

            const servers = {
                iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }]
            };
            const pc = new RTCPeerConnection(servers);
            
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            const callUI = document.createElement("div");
            callUI.style.position = "absolute"; callUI.style.top = "0"; callUI.style.left = "0"; callUI.style.width = "100%"; callUI.style.height = "100%"; callUI.style.backgroundColor = "#0b141a"; callUI.style.zIndex = "3000"; callUI.style.display = "flex"; callUI.style.flexDirection = "column";
            
            callUI.innerHTML = `
                <div style="flex-grow:1; width: 100%; position: relative;">
                    <video id="remote-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>
                    <video id="local-video" autoplay muted playsinline style="width: 120px; height: 160px; position: absolute; bottom: 120px; right: 20px; border-radius: 12px; object-fit: cover;"></video>
                    <div style="padding: 24px; position: absolute; bottom: 40px; width: 100%; display: flex; justify-content: center;">
                        <button id="end-call-btn" class="round-btn" style="background: var(--danger-red); width: 60px; height: 60px; color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i class="ri-phone-fill" style="font-size: 28px; transform: rotate(135deg);"></i></button>
                    </div>
                    <div id="calling-text" style="position: absolute; top: 100px; width: 100%; text-align: center; color: white; font-size: 20px;">Calling...</div>
                </div>
            `;
            document.body.appendChild(callUI);
            document.getElementById('local-video').srcObject = localStream;
            
            const remoteVideo = document.getElementById('remote-video');
            const remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
            
            pc.ontrack = (event) => {
                document.getElementById('calling-text').style.display = 'none';
                event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
            };

            const callDocRef = doc(collection(window.koolaDb, "chats", chatId, "calls"));
            const callerCandidates = collection(callDocRef, "callerCandidates");
            const calleeCandidates = collection(callDocRef, "calleeCandidates");

            pc.onicecandidate = (event) => {
                if (event.candidate) addDoc(callerCandidates, event.candidate.toJSON());
            };

            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);

            const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
            await setDoc(callDocRef, { offer, caller: localStorage.getItem('koola_user'), type: videoEnabled ? 'video' : 'audio' });

            const unsub = onSnapshot(callDocRef, (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.answer) {
                    const answerDescription = new RTCSessionDescription(data.answer);
                    pc.setRemoteDescription(answerDescription);
                }
            });

            const unsubIce = onSnapshot(calleeCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.addIceCandidate(candidate);
                    }
                });
            });

            document.getElementById('end-call-btn').onclick = () => {
                localStream.getTracks().forEach(t => t.stop());
                pc.close();
                if(unsub) unsub();
                if(unsubIce) unsubIce();
                callUI.remove();
            };
        }

        if (videoBtn) videoBtn.addEventListener("click", () => initiateCall(true));
        if (audioBtn) audioBtn.addEventListener("click", () => initiateCall(false));
    }

    window.openSubpage = function(title, contentHtml) {
        let html = `
            <header class="chat-header">
                <button class="icon-btn back-btn" id="close-subpage-btn" style="margin-right: 8px;">
                    <i class="ri-arrow-left-line"></i>
                </button>
                <div class="chat-header-info">
                    <div class="chat-header-text">
                        <div class="chat-name">${title}</div>
                    </div>
                </div>
            </header>
            <div class="messages-area" style="background-color: var(--background-gray); padding: 0;">
                ${contentHtml}
            </div>
        `;
        subpageContainer.innerHTML = html;
        subpageContainer.classList.add("active");

        const closeBtn = document.getElementById("close-subpage-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                subpageContainer.classList.remove("active");
                setTimeout(() => { subpageContainer.innerHTML = ''; }, 300);
            });
        }
    };

    function attachChatListeners() {
        const chats = document.querySelectorAll(".chat-list .list-item");
        chats.forEach(chat => {
            chat.addEventListener("click", () => {
                const id = chat.getAttribute("data-id");
                if (id) openChat(id);
            });
        });
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            
            const tab = item.getAttribute("data-tab");
            renderView(tab);
        });
    });

    // Global Header Actions
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
             alert((headerTitle.textContent || "Search") + " search activated!");
        });
    }
    if (moreBtn && headerDropdown) {
        moreBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            headerDropdown.classList.toggle("hidden");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!moreBtn.contains(e.target) && !headerDropdown.contains(e.target)) {
                headerDropdown.classList.add("hidden");
            }
        });
    }

    const splashScreen = document.getElementById('splash-screen');
    const onboardingContainer = document.getElementById('onboarding-container');

    function renderWelcomeScreen() {
        onboardingContainer.innerHTML = `
            <div class="onboarding-screen">
                <div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="width: 200px; height: 200px; background: rgba(16, 116, 207, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                        <i class="ri-team-fill" style="font-size: 80px; color: var(--primary-blue);"></i>
                    </div>
                    <div class="onboarding-header">Welcome to Koola Chats</div>
                    <div class="onboarding-desc">Read our Privacy Policy. Tap "Agree & continue" to accept the Terms of Service.</div>
                </div>
                <button class="onboarding-btn" id="agree-btn">Agree and continue</button>
            </div>
        `;
        document.getElementById('agree-btn').addEventListener('click', renderPhoneScreen);
    }

    function renderPhoneScreen() {
        onboardingContainer.innerHTML = `
            <div class="onboarding-screen">
                <div class="onboarding-header">Enter your phone number</div>
                <div class="onboarding-desc">Koola Chats will need to verify your phone number.</div>
                
                <div id="country-selector-btn" class="phone-input-group" style="justify-content: space-between; cursor: pointer;">
                    <div id="selected-country-name" style="font-size: 16px; color: var(--text-primary); font-weight: 500;">United States</div>
                    <i class="ri-arrow-down-s-fill" style="color: var(--primary-blue); font-size: 20px;"></i>
                </div>
                
                <div class="phone-input-group">
                    <div id="selected-country-code" class="phone-code">+1</div>
                    <input type="tel" class="phone-number-field" placeholder="phone number" id="phone-input" autofocus>
                </div>
                
                <button class="onboarding-btn" id="next-btn" style="margin-top: auto; opacity: 0.5;">Next</button>
            </div>
        `;
        
        const phoneInput = document.getElementById('phone-input');
        const nextBtn = document.getElementById('next-btn');
        const countryBtn = document.getElementById('country-selector-btn');
        const countryNameEl = document.getElementById('selected-country-name');
        const countryCodeEl = document.getElementById('selected-country-code');

        const COUNTRIES = [
            { name: "Australia", code: "+61" }, { name: "Brazil", code: "+55" }, { name: "Canada", code: "+1" },
            { name: "China", code: "+86" }, { name: "France", code: "+33" }, { name: "Germany", code: "+49" },
            { name: "India", code: "+91" }, { name: "Italy", code: "+39" }, { name: "Japan", code: "+81" },
            { name: "Kenya", code: "+254" }, { name: "Mexico", code: "+52" }, { name: "Nigeria", code: "+234" },
            { name: "South Africa", code: "+27" }, { name: "Spain", code: "+34" }, { name: "Tanzania", code: "+255" },
            { name: "Uganda", code: "+256" }, { name: "United Kingdom", code: "+44" }, { name: "United States", code: "+1" },
        ];

        countryBtn.addEventListener('click', () => {
            let listHtml = '<div style="background: var(--surface-white);">';
            COUNTRIES.forEach(c => {
                listHtml += `
                    <div class="country-list-item" data-name="${c.name}" data-code="${c.code}" style="padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; cursor: pointer;">
                        <span style="font-size: 16px; color: var(--text-primary); font-weight: 500;">${c.name}</span>
                        <span style="font-size: 16px; color: var(--text-secondary);">${c.code}</span>
                    </div>
                `;
            });
            listHtml += '</div>';

            if (window.openSubpage) {
                window.openSubpage("Choose a country", listHtml);
                setTimeout(() => {
                    const items = document.querySelectorAll(".country-list-item");
                    items.forEach(item => {
                        item.addEventListener('click', () => {
                            countryNameEl.textContent = item.getAttribute('data-name');
                            countryCodeEl.textContent = item.getAttribute('data-code');
                            document.getElementById("close-subpage-btn").click();
                        });
                    });
                }, 50);
            }
        });
        
        phoneInput.addEventListener('input', (e) => {
            // Allow numbers, +, and spaces, strictly resembling WhatsApp input style
            e.target.value = e.target.value.replace(/[^\d\+\s\-]/g, '');
            const digitCount = e.target.value.replace(/\D/g, '').length;
            if (digitCount >= 7 && digitCount <= 15) {
                nextBtn.style.opacity = "1";
            } else {
                nextBtn.style.opacity = "0.5";
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const digitCount = phoneInput.value.replace(/\D/g, '').length;
            if (digitCount < 7 || digitCount > 15) {
                alert("Please enter a valid phone number.");
                return;
            }
            
            // FUTURE: Real Firebase OTP integration hook goes here
            const fullPhoneNumber = countryCodeEl.textContent + phoneInput.value.replace(/\D/g, '');
            const phoneNumber = fullPhoneNumber;
            const loadingOverlay = document.createElement("div");
            loadingOverlay.className = "loading-spinner-overlay";
            loadingOverlay.innerHTML = `<i class="ri-loader-4-line pulse" style="font-size: 40px; color: var(--primary-blue);"></i><div style="margin-top: 16px; color: var(--text-secondary); font-weight: 500;">Connecting...</div>`;
            onboardingContainer.appendChild(loadingOverlay);
            
            setTimeout(() => {
                loadingOverlay.innerHTML = `<i class="ri-loader-4-line pulse" style="font-size: 40px; color: var(--primary-blue);"></i><div style="margin-top: 16px; color: var(--text-secondary); font-weight: 500;">Verifying...</div>`;
                setTimeout(() => {
                    if (window.koolaFIREBASE_ACTIVE) {
                        const { doc, setDoc, serverTimestamp } = window.koolaFirestore;
                        setDoc(doc(window.koolaDb, "users", phoneNumber), {
                            phoneNumber: phoneNumber,
                            lastLogin: serverTimestamp()
                        }, { merge: true }).then(() => {
                            renderProfileSetupScreen(phoneNumber);
                        }).catch(e => {
                            alert("Firebase Error: " + e.message);
                            loadingOverlay.remove();
                        });
                    } else {
                        renderProfileSetupScreen(phoneNumber);
                    }
                }, 1500);
            }, 1000);
        });
        
        // Time Ago Logic
        if (!window.koolaTimeInterval) {
            window.formatTimeAgo = function(dateObj) {
                if (!dateObj) return 'Just now';
                const seconds = Math.floor((new Date() - dateObj) / 1000);
                if (seconds < 60) return 'Just now';
                const minutes = Math.floor(seconds / 60);
                if (minutes < 60) return minutes + 'm ago';
                const hours = Math.floor(minutes / 60);
                if (hours < 24) return hours + 'h ago';
                const days = Math.floor(hours / 24);
                if (days < 7) return days + 'd ago';
                return dateObj.toLocaleDateString();
            };

            window.koolaTimeInterval = setInterval(() => {
                document.querySelectorAll('.message-time[data-time]').forEach(el => {
                    const timeRaw = el.getAttribute('data-time');
                    if (timeRaw && timeRaw !== "0") {
                        const dateObj = new Date(parseInt(timeRaw, 10));
                        let tickHtml = "";
                        const icon = el.querySelector('i');
                        if (icon) tickHtml = ' ' + icon.outerHTML;
                        el.innerHTML = window.formatTimeAgo(dateObj) + tickHtml;
                    }
                });
            }, 60000);
        }
    }

    // WebRTC Callee (Answering) Global Logic
    window.answerCall = async function(chatId, callId, callData, contactName) {
        const { collection, doc, updateDoc, addDoc, onSnapshot } = window.koolaFirestore;
        const videoEnabled = callData.type === 'video';

        const ringUI = document.createElement("div");
        ringUI.style.position = "absolute"; ringUI.style.top = "0"; ringUI.style.left = "0"; ringUI.style.width = "100%"; ringUI.style.height = "100%"; ringUI.style.backgroundColor = "#0b141a"; ringUI.style.zIndex = "3000"; ringUI.style.display = "flex"; ringUI.style.flexDirection = "column"; ringUI.style.alignItems = "center"; ringUI.style.justifyContent = "center"; ringUI.style.color = "white";
        ringUI.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 40px;">Incoming ${videoEnabled ? 'Video' : 'Voice'} Call</div>
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 80px;">${contactName}</div>
            <div style="display: flex; gap: 40px;">
                <button id="reject-call-btn" class="round-btn" style="background: var(--danger-red); width: 70px; height: 70px; border-radius: 50%; color: white; border: none; font-size: 32px;"><i class="ri-phone-fill" style="transform: rotate(135deg);"></i></button>
                <button id="accept-call-btn" class="round-btn pulse" style="background: var(--primary-green); width: 70px; height: 70px; border-radius: 50%; color: white; border: none; font-size: 32px;"><i class="ri-phone-fill"></i></button>
            </div>
        `;
        document.body.appendChild(ringUI);

        document.getElementById("reject-call-btn").onclick = () => ringUI.remove();
        document.getElementById("accept-call-btn").onclick = async () => {
            ringUI.remove();
            let localStream;
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true });
            } catch(e) { return alert("Camera/Microphone required to answer."); }

            const servers = { iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };
            const pc = new RTCPeerConnection(servers);
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            const callUI = document.createElement("div");
            callUI.style.position = "absolute"; callUI.style.top = "0"; callUI.style.left = "0"; callUI.style.width = "100%"; callUI.style.height = "100%"; callUI.style.backgroundColor = "#0b141a"; callUI.style.zIndex = "3000"; callUI.style.display = "flex"; callUI.style.flexDirection = "column";
            callUI.innerHTML = `
                <div style="flex-grow:1; width: 100%; position: relative;">
                    <video id="remote-video-ans" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; background: #000;"></video>
                    <video id="local-video-ans" autoplay muted playsinline style="width: 120px; height: 160px; position: absolute; bottom: 120px; right: 20px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></video>
                    <div style="padding: 24px; position: absolute; bottom: 40px; width: 100%; display: flex; justify-content: center;">
                        <button id="active-end-call-btn" class="round-btn" style="background: var(--danger-red); width: 60px; height: 60px; color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i class="ri-phone-fill" style="transform: rotate(135deg); font-size: 28px;"></i></button>
                    </div>
                </div>
            `;
            document.body.appendChild(callUI);
            document.getElementById('local-video-ans').srcObject = localStream;
            
            const remoteVideo = document.getElementById('remote-video-ans');
            const remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
            
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
            };

            const callDocRef = doc(window.koolaDb, "chats", chatId, "calls", callId);
            const callerCandidates = collection(callDocRef, "callerCandidates");
            const calleeCandidates = collection(callDocRef, "calleeCandidates");

            pc.onicecandidate = (event) => {
                if (event.candidate) addDoc(calleeCandidates, event.candidate.toJSON());
            };

            const offerDescription = new RTCSessionDescription(callData.offer);
            await pc.setRemoteDescription(offerDescription);

            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);

            const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
            await updateDoc(callDocRef, { answer });

            const unsubIce = onSnapshot(callerCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.addIceCandidate(candidate);
                    }
                });
            });

            document.getElementById('active-end-call-btn').onclick = () => {
                localStream.getTracks().forEach(t => t.stop());
                pc.close();
                if(unsubIce) unsubIce();
                callUI.remove();
            };
        };
    };

    function renderProfileSetupScreen(phoneNumber) {
        onboardingContainer.innerHTML = `
            <div class="onboarding-screen">
                <div class="onboarding-header">Profile info</div>
                <div class="onboarding-desc">Please provide your name and an optional profile photo.</div>
                
                <div id="profile-avatar-container" style="margin: 32px auto; width: 100px; height: 100px; background: var(--background-gray); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; overflow: hidden; border: 2px solid var(--border-color);">
                    <i id="profile-avatar-icon" class="ri-camera-fill" style="font-size: 36px; color: var(--text-secondary);"></i>
                    <img id="profile-avatar-preview" src="" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                    <div style="position: absolute; bottom: 0; right: 0; background: var(--primary-blue); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: white; z-index: 2;">
                        <i class="ri-add-line"></i>
                    </div>
                </div>
                <input type="file" id="profile-avatar-input" accept="image/*" style="display:none;">
                
                <div class="phone-input-group" style="margin-top: 16px;">
                    <input type="text" class="phone-number-field" placeholder="Type your name here" id="profile-name-input" autofocus style="width: 100%;">
                </div>
                
                <button class="onboarding-btn" id="finish-btn" style="margin-top: auto; opacity: 0.5;">Next</button>
            </div>
        `;
        
        const nameInput = document.getElementById('profile-name-input');
        const finishBtn = document.getElementById('finish-btn');
        const avatarContainer = document.getElementById('profile-avatar-container');
        const avatarInput = document.getElementById('profile-avatar-input');
        const avatarPreview = document.getElementById('profile-avatar-preview');
        const avatarIcon = document.getElementById('profile-avatar-icon');
        
        let profileAvatarBase64 = "";

        avatarContainer.addEventListener('click', () => avatarInput.click());

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                profileAvatarBase64 = ev.target.result;
                avatarPreview.src = profileAvatarBase64;
                avatarPreview.style.display = "block";
                avatarIcon.style.display = "none";
            };
            reader.readAsDataURL(file);
        });
        
        nameInput.addEventListener('input', (e) => {
            if (e.target.value.trim().length > 0) {
                finishBtn.style.opacity = "1";
            } else {
                finishBtn.style.opacity = "0.5";
            }
        });
        
        finishBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name.length === 0) return;
            
            const loadingOverlay = document.createElement("div");
            loadingOverlay.className = "loading-spinner-overlay";
            loadingOverlay.innerHTML = `<i class="ri-loader-4-line pulse" style="font-size: 40px; color: var(--primary-blue);"></i><div style="margin-top: 16px; color: var(--text-secondary); font-weight: 500;">Initializing...</div>`;
            onboardingContainer.appendChild(loadingOverlay);
            
            if (window.koolaFIREBASE_ACTIVE) {
                const { doc, setDoc } = window.koolaFirestore;
                setDoc(doc(window.koolaDb, "users", phoneNumber), {
                    name: name,
                    avatar: profileAvatarBase64,
                    bio: "Hey there! I am using Koola Chats."
                }, { merge: true }).then(() => {
                    localStorage.setItem('koola_user', phoneNumber);
                    localStorage.setItem('koola_name', name);
                    if(profileAvatarBase64) localStorage.setItem('koola_avatar', profileAvatarBase64);
                    localStorage.setItem('koola_bio', "Hey there! I am using Koola Chats.");
                    onboardingContainer.classList.add('hidden');
                    renderView("chats");
                }).catch(e => {
                    alert("Firebase Profile Error: " + e.message);
                    loadingOverlay.remove();
                });
            } else {
                localStorage.setItem('koola_user', phoneNumber);
                localStorage.setItem('koola_name', name);
                if(profileAvatarBase64) localStorage.setItem('koola_avatar', profileAvatarBase64);
                localStorage.setItem('koola_bio', "Hey there! I am using Koola Chats.");
                onboardingContainer.classList.add('hidden');
                renderView("chats");
            }
        });
    }

    // App Boot Sequence
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        
        // DEVELOPMENT: Force onboarding by clearing cache
        localStorage.removeItem('koola_user');
        
        if (localStorage.getItem('koola_user')) {
            renderView("chats");
        } else {
            onboardingContainer.classList.remove('hidden');
            renderWelcomeScreen();
        }
    }, 2000);
    
});
