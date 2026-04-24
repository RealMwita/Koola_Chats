import { db, firestoreTools } from './firebase-init.js';
import { authState } from './auth.js';

const STUN_SERVERS = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }]
};

class WebRTCManager {
    constructor() {
        this.pc = null;
        this.localStream = null;
        this.remoteStream = null;
        this.currentCallId = null;
        this.currentChatId = null;
        this.isCaller = false;
        
        this.unsubCallDoc = null;
        this.unsubIce = null;
        this.callTimeout = null;

        this.listenersAttached = new Set();
    }

    async getMedia(videoEnabled) {
        try {
            return await navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true });
        } catch(err) {
            alert(`Microphone/Camera permission denied. Details: ${err.message}`);
            return null;
        }
    }

    attachGlobalCallListeners(chatsArr) {
        chatsArr.forEach(chat => {
            if (this.listenersAttached.has(chat.id)) return;
            this.listenersAttached.add(chat.id);

            const callsRef = firestoreTools.collection(db, "chats", chat.id, "calls");
            firestoreTools.onSnapshot(callsRef, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    const data = change.doc.data();
                    const callId = change.doc.id;

                    // Incoming Call Ringing detection
                    if (change.type === "added" && data.offer && data.status === 'ringing') {
                        if (data.caller !== authState.user.email) {
                            if (!this.pc) {
                                this.showIncomingCallRing(chat.id, callId, data);
                                if (window.Notification && Notification.permission === 'granted') {
                                    if (document.hidden) {
                                        new Notification("Incoming Call", { body: `Incoming ${data.type} call from ${data.caller.split('@')[0]}` });
                                    }
                                }
                            }
                        }
                    }

                    // For the Caller: Listen for Ringing, Answer, Reject, or Timeout
                    if (change.type === "modified" && this.isCaller && this.currentCallId === callId) {
                        const statTxt = document.getElementById('call-status-text');
                        
                        if (data.status === 'ringing') {
                            const ringback = document.getElementById('audio-ringback');
                            if (ringback) ringback.play().catch(()=>{});
                            if (statTxt) statTxt.textContent = "Ringing...";
                        }
                        
                        if (data.status === 'answered' && data.answer && !this.pc.currentRemoteDescription) {
                            if(this.callTimeout) clearTimeout(this.callTimeout);
                            this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                            if(statTxt) statTxt.textContent = "Connected";
                            
                            const ringback = document.getElementById('audio-ringback');
                            if (ringback) { ringback.pause(); ringback.currentTime = 0; }
                        }
                        if (data.status === 'rejected') {
                            if(statTxt) statTxt.textContent = "Declined";
                            setTimeout(() => this.teardown(true), 1000);
                        }
                    }

                    // For both: Teardown if other ends
                    if (change.type === "modified" || change.type === "removed") {
                        if (data.status === 'ended' && this.currentCallId === callId) {
                            const statTxt = document.getElementById('call-status-text');
                            if(statTxt) statTxt.textContent = "Call Ended";
                            setTimeout(() => this.teardown(false), 1000); 
                        }
                    }
                });
            });
        });
    }

    async startCall(chatId, contactName, videoEnabled) {
        if (this.pc) return alert("You are already in a call.");
        
        this.localStream = await this.getMedia(videoEnabled);
        if (!this.localStream) return;

        this.isCaller = true;
        this.currentChatId = chatId;
        
        this.pc = new RTCPeerConnection(STUN_SERVERS);
        this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));

        this.mountCallUI(videoEnabled, contactName, 'Calling...');

        const callDocsRef = firestoreTools.collection(db, "chats", chatId, "calls");
        const callDocRef = firestoreTools.doc(callDocsRef);
        this.currentCallId = callDocRef.id;

        const myEmail = authState.user.email.trim().toLowerCase();
        const receiverEmail = chatId.split('_').find(e => e !== myEmail);
        
        try {
            const myCallHistory = firestoreTools.collection(db, "users", authState.user.uid, "callHistory");
            firestoreTools.addDoc(myCallHistory, {
                type: 'outgoing', callType: videoEnabled ? 'video' : 'audio', 
                contactEmail: receiverEmail, contactName: contactName,
                timestamp: firestoreTools.serverTimestamp()
            });
        } catch(e) {}

        // Collect Caller ICE candidates
        const callerCandidates = firestoreTools.collection(callDocRef, "callerCandidates");
        this.pc.onicecandidate = (event) => {
            if (event.candidate) firestoreTools.addDoc(callerCandidates, event.candidate.toJSON());
        };

        // Disconnect handler
        this.pc.oniceconnectionstatechange = () => {
            if (this.pc && (this.pc.iceConnectionState === "disconnected" || this.pc.iceConnectionState === "failed")) {
                this.teardown(true);
            }
        };

        const offerDesc = await this.pc.createOffer();
        await this.pc.setLocalDescription(offerDesc);

        await firestoreTools.setDoc(callDocRef, {
            offer: { type: offerDesc.type, sdp: offerDesc.sdp },
            caller: authState.user.email,
            type: videoEnabled ? 'video' : 'audio',
            status: 'ringing',
            timestamp: firestoreTools.serverTimestamp()
        });

        // Timeout Ringing after 30 seconds
        this.callTimeout = setTimeout(async () => {
            alert("No answer.");
            await firestoreTools.updateDoc(callDocRef, { status: 'missed' });
            this.teardown(false);
        }, 30000);

        // Listen for Callee ICE candidates
        const calleeCandidates = firestoreTools.collection(callDocRef, "calleeCandidates");
        this.unsubIce = firestoreTools.onSnapshot(calleeCandidates, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") this.pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            });
        });
    }

    showIncomingCallRing(chatId, callId, data) {
        const ringtone = document.getElementById('audio-ringtone');
        if(ringtone) ringtone.play().catch(()=>{});

        const ringUI = document.createElement("div");
        ringUI.className = "full-overlay";
        ringUI.id = "ringing-ui";
        ringUI.innerHTML = `
            <div style="text-align:center; color: white;">
                <div style="font-size: 24px; margin-bottom: 20px;">Incoming ${data.type} Call</div>
                <div style="font-size: 32px; font-weight: bold; margin-bottom: 60px;">${data.caller.split('@')[0]}</div>
                <div style="display: flex; gap: 40px; justify-content: center;">
                    <button id="reject-btn" class="round-btn" style="background: var(--danger-red); width: 70px; height: 70px; border-radius: 50%; color: white; border: none; font-size: 32px; cursor: pointer;"><i class="ri-phone-fill" style="transform: rotate(135deg);"></i></button>
                    <button id="accept-btn" class="round-btn pulse" style="background: var(--primary-green); width: 70px; height: 70px; border-radius: 50%; color: white; border: none; font-size: 32px; cursor: pointer;"><i class="ri-phone-fill"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(ringUI);

        // Auto remove ring UI if caller hangs up before answer
        const checkRef = firestoreTools.doc(db, "chats", chatId, "calls", callId);
        const tempUnsub = firestoreTools.onSnapshot(checkRef, snap => {
            const currentStatus = snap.data()?.status;
            if(currentStatus === 'ended' || currentStatus === 'missed') {
                if(document.getElementById("ringing-ui")) document.getElementById("ringing-ui").remove();
                tempUnsub();
            }
        });

        document.getElementById("reject-btn").onclick = async () => {
            ringUI.remove();
            tempUnsub();
            await firestoreTools.updateDoc(firestoreTools.doc(db, "chats", chatId, "calls", callId), { status: 'rejected' });
        };

        document.getElementById("accept-btn").onclick = async () => {
            ringUI.remove();
            tempUnsub();
            this.answerCall(chatId, callId, data);
        };
    }

    async answerCall(chatId, callId, data) {
        this.isCaller = false;
        this.currentChatId = chatId;
        this.currentCallId = callId;

        try {
            const myCallHistory = firestoreTools.collection(db, "users", authState.user.uid, "callHistory");
            firestoreTools.addDoc(myCallHistory, {
                type: 'incoming', callType: data.type, 
                contactEmail: data.caller, contactName: data.caller.split('@')[0],
                timestamp: firestoreTools.serverTimestamp()
            });
        } catch(e) {}

        const videoEnabled = data.type === 'video';
        this.localStream = await this.getMedia(videoEnabled);
        if (!this.localStream) {
            await firestoreTools.updateDoc(firestoreTools.doc(db, "chats", chatId, "calls", callId), { status: 'rejected' });
            return;
        }

        this.pc = new RTCPeerConnection(STUN_SERVERS);
        this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));

        this.mountCallUI(videoEnabled, data.caller.split('@')[0], 'Connected');

        const callDocRef = firestoreTools.doc(db, "chats", chatId, "calls", callId);
        
        // Callee Candidates
        const calleeCandidates = firestoreTools.collection(callDocRef, "calleeCandidates");
        this.pc.onicecandidate = (event) => {
            if (event.candidate) firestoreTools.addDoc(calleeCandidates, event.candidate.toJSON());
        };

        this.pc.oniceconnectionstatechange = () => {
            if (this.pc && (this.pc.iceConnectionState === "disconnected" || this.pc.iceConnectionState === "failed")) {
                this.teardown(true);
            }
        };

        await this.pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answerDesc = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answerDesc);

        await firestoreTools.updateDoc(callDocRef, {
            answer: { type: answerDesc.type, sdp: answerDesc.sdp },
            status: 'answered'
        });

        // Listen for Caller ICE
        const callerCandidates = firestoreTools.collection(callDocRef, "callerCandidates");
        this.unsubIce = firestoreTools.onSnapshot(callerCandidates, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") this.pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            });
        });
    }

    mountCallUI(videoEnabled, name, statusTxt) {
        const ui = document.createElement("div");
        ui.className = "full-overlay";
        ui.id = "active-call-overlay";
        ui.style.zIndex = "4000";
        ui.innerHTML = `
            <div style="flex-grow:1; width: 100%; height: 100%; position: relative; background: #000;">
                <video id="remote-video-stream" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                <video id="local-video-stream" autoplay muted playsinline style="width: 15vw; height: 20vh; position: absolute; bottom: 120px; right: 20px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></video>
                
                <div style="position: absolute; top: 40px; width: 100%; text-align: center; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                    <h2 style="font-weight: 500;">${name}</h2>
                    <div id="call-status-text" style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${statusTxt}</div>
                </div>

                <div style="padding: 24px; position: absolute; bottom: calc(40px + env(safe-area-inset-bottom)); width: 100%; display: flex; justify-content: center; gap: 32px;">
                    <button class="round-btn" style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; color: white; border: none; border-radius: 50%; cursor: pointer;">
                        <i class="ri-mic-off-fill" style="font-size: 28px;"></i>
                    </button>
                    <button id="end-active-call-btn" class="round-btn" style="background: var(--danger-red); width: 60px; height: 60px; color: white; border: none; border-radius: 50%; cursor: pointer;">
                        <i class="ri-phone-fill" style="font-size: 28px; transform: rotate(135deg);"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(ui);

        setTimeout(() => {
            const locVid = document.getElementById('local-video-stream');
            if(locVid && this.localStream) locVid.srcObject = this.localStream;
            
            this.remoteStream = new MediaStream();
            const remVid = document.getElementById('remote-video-stream');
            if(remVid) remVid.srcObject = this.remoteStream;

            this.pc.ontrack = (event) => {
                this.remoteStream.addTrack(event.track);
                const remVidCheck = document.getElementById('remote-video-stream');
                if(remVidCheck && remVidCheck.srcObject !== this.remoteStream) {
                    remVidCheck.srcObject = this.remoteStream;
                }
            };

            document.getElementById('end-active-call-btn').onclick = () => this.teardown(true);
        }, 100);
    }

    async teardown(tellServer = false) {
        if(this.callTimeout) clearTimeout(this.callTimeout);
        if(this.unsubIce) this.unsubIce();
        if(this.unsubCallDoc) this.unsubCallDoc();
        
        const ringtone = document.getElementById('audio-ringtone');
        if(ringtone) {
            ringtone.pause();
            ringtone.currentTime = 0;
        }

        const ringback = document.getElementById('audio-ringback');
        if(ringback) {
            ringback.pause();
            ringback.currentTime = 0;
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }

        const ui = document.getElementById("active-call-overlay");
        if(ui) ui.remove();

        if (tellServer && this.currentChatId && this.currentCallId) {
            try {
                await firestoreTools.updateDoc(firestoreTools.doc(db, "chats", this.currentChatId, "calls", this.currentCallId), {
                    status: 'ended'
                });
            } catch(e) {}
        }
        
        this.currentCallId = null;
        this.currentChatId = null;
    }
}

window.koolaRTC = new WebRTCManager();
export const initiateCall = window.koolaRTC.startCall.bind(window.koolaRTC);
