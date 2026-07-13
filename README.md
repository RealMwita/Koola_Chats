<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="Koola Chats Logo" width="80" style="filter: hue-rotate(140deg);">
  <h1>💬 Koola Chats Web</h1>
  <p><strong>A Modern, Real-Time, End-to-End Encrypted Messaging & HD Calling Web Application</strong></p>

  [![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-039BE5?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
  [![WebRTC](https://img.shields.io/badge/WebRTC-HD%20Audio%20%2F%20Video-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![CSS3](https://img.shields.io/badge/CSS3-Glassmorphic%20UI-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
</div>

---

## 🌐 Access It Online (Live Demo)

You can access and test **Koola Chats** instantly from any desktop or mobile web browser via our official live cloud deployment:

* **Official Web App Link**: [https://koola-chats.web.app](https://koolachats.netlify.app)

> [!TIP]
> **Mobile & Desktop Sync**: Open the live link on both your laptop and smartphone. Sign in to your account to experience real-time message syncing, instant voice notes, and HD video/audio calls across devices!

---

## ✨ Key Features & Highlights

### 🔒 1. Professional Split-Screen Authentication
* **Sleek Onboarding UI**: Glassmorphic split-screen card featuring vibrant brand highlights on desktop and a clean stacked card on mobile.
* **Instant Tab Switching**: Seamlessly toggle between **Sign In** and **Create Account** without page reloads.
* **Password Inspection Controls**: Interactive eye toggle buttons (`ri-eye-line` / `ri-eye-off-line`) to verify passwords while typing.
* **Smart Error Banners**: Animated, shake-effect notification banners alert users to incorrect credentials, mismatched passwords, or duplicate registrations.
* **Automatic Profile Sync**: Custom names (`John Doe`) are instantly saved to Firebase Auth and Firestore `/users/{uid}` so contacts see your real name.

### 💬 2. Real-Time Messaging & Universal Clickable Navigation
* **Instant Cloud Sync**: Powered by Firebase Firestore (`onSnapshot`), every message, status tick (`✓`, `✓✓`), and contact addition updates in real-time.
* **Universal Chat Navigation**: Click any contact card, recent chat item, or call history log (`Calls History` tab) from anywhere in the app to immediately dismiss sub-panels and open the active conversation while auto-focusing the `Chats` sidebar tab.

### 📸 3. Multi-Media Sharing (Photos, Videos, & Audio)
* **Dedicated Photo Button (`ri-image-2-line`)**: Prominently placed in the chat input bar specifically for choosing and sending photos (`image/*`).
* **Clipboard Image Paste (`Ctrl + V`)**: Copy any screenshot (`Win + Shift + S` or `Cmd + Shift + 4`) and press **Ctrl+V** inside the message box to upload and send the image instantly!
* **Drag-and-Drop Media Wall**: Drag image files directly from your desktop folder and drop them onto the chat window (`#messages-scroll`) to send immediately.
* **Clickable Full-Size Photo Modal**: Photos inside chat bubbles display cleanly with smooth border radius and drop-shadows. Clicking any photo opens it full-size (`window.open(url, '_blank')`).
* **HD Video Sharing**: Attach videos (`video/*`) that render with native HTML5 playback controls right inside the chat bubble.

### 🎙️ 4. Live Voice Messaging & Fallback Audio Attachments
* **Live Microphone Recording (`ri-mic-fill`)**: Click the microphone icon to record crisp `.webm` audio notes. Displays a real-time pulsing indicator banner right above the input (`🔴 Recording voice message... Click stop button to send`).
* **Audio Player Bubbles**: Voice notes and attached `.mp3` / `.wav` files render with integrated `<audio controls preload="metadata">` bars and custom microphone icons.
* **Intelligent File Fallback**: If running in restricted browser environments (`file:///` protocol without HTTPS), the microphone button smartly offers to pick/attach an audio file from your device instead of throwing permission errors.

### 😊 5. Auto-Dismissing Emoji Picker
* **Interactive Emoji Engine**: Built with `emoji-picker-element` for smooth category browsing and instant emoji insertion.
* **Outside Touch/Click Dismissal**: Clicking or tapping anywhere outside the emoji container instantly closes the picker so your chat window stays clean and unobstructed.

### 📞 6. HD Audio & Video Calls (Peer-to-Peer WebRTC)
* **One-Click Video / Audio Calling**: Initiate peer-to-peer real-time calls using the video (`ri-video-add-fill`) or telephone (`ri-phone-fill`) buttons in the chat header.
* **Ringtone & Sound Effects**: Built-in sound effects engine for outgoing message pops, incoming tri-tone alerts, and natural marimba call ringtones (`audio-ringtone`).

---

## 🚀 Step-by-Step User Guide (How to Use)

### Step 1: Getting Started (Registration & Sign In)
1. Open the **Live Demo URL** (`https://koola-chats.web.app`) or launch `index.html` locally on your device.
2. Click the **Create Account** tab if you are a new user.
3. Enter your **Full Name** (e.g., `Alex Smith`), your **Email Address**, and a **Password** (min. 6 characters).
4. Click **Create Account**. You will be securely logged in and your display name will appear on the left sidebar.

### Step 2: Saving Contacts & Starting a Chat
1. In the middle **Chats** list pane, click the **New Chat icon** (`ri-chat-new-line` at the top right of the pane header).
2. Click the green **`+ New contact`** button.
3. Enter your friend's **Email Address** (must match the email they registered with on Koola Chats) and a **Contact Name**.
4. Click **Save & Chat**. The conversation window will instantly slide open!
5. *Tip*: If someone not in your contacts sends you a message, a green **Save Contact** banner automatically appears at the top of their chat window allowing you to save them with one click.

### Step 3: Sending Messages, Photos, Emojis, & Voice Notes
* **Text Messages**: Type your message in the bottom input box (`Type a message or record audio...`) and press **Enter** or click the send arrow (`ri-send-plane-fill`).
* **Send a Photo**:
  * **Option A**: Click the green **Photo icon** (`ri-image-2-line`) inside the input bar and select your picture.
  * **Option B**: Copy an image to your clipboard and press **`Ctrl + V`** inside the text box!
  * **Option C**: Drag and drop an image file directly onto the message bubbles area.
  * Click on any sent picture in the chat to open it full size!
* **Send a Voice Note**:
  * Click the microphone icon (`ri-mic-fill`) on the right side of the text bar.
  * Speak your message into your microphone while the red banner indicates `🔴 Recording voice message...`.
  * Click the red **Stop / Send icon** (`ri-stop-circle-fill`) to instantly upload and send your voice recording!
* **Insert Emojis**:
  * Click the smiley face icon (`ri-emotion-line`) on the left side of the text box to open the emoji picker.
  * Click any emoji to insert it into your message. Click anywhere outside the emoji picker (or start typing) to auto-close the picker!

### Step 4: Making Video & Audio Calls
1. Open the chat conversation of the person you want to call.
2. At the top right of the chat header, click:
   * **Video Icon (`ri-video-add-fill`)** to start a real-time **HD Video Call**.
   * **Phone Icon (`ri-phone-fill`)** to start a voice-only **Audio Call**.
3. *Note on Camera/Microphone Permissions*: WebRTC requires microphone and camera access. If prompted by your browser, click **Allow**.

---

## 💻 How to Run Locally on Your PC (For Developers)

You can clone and run **Koola Chats** directly on your Windows, Mac, or Linux machine in two ways:

### Method A: Direct Double-Click (Zero Setup)
1. Clone or download this repository to your computer:
   ```bash
   git clone https://github.com/your-username/koola-chats.git
   cd koola-chats
   ```
2. Navigate to the `Koola Chats` folder (`or root folder`) and double-click `index.html`.
3. The app will open in your default web browser (Chrome, Edge, Firefox, or Safari).
   * *Note*: Because of browser file system restrictions (`file:///` protocol), live microphone recording (`MediaRecorder`) and camera WebRTC calls might be blocked. For full audio/video recording capabilities, use **Method B**.

### Method B: Local HTTP Dev Server (Recommended for Voice & Video Testing)
To enable full camera/microphone permissions and test WebRTC calls locally, serve the project using any simple local HTTP server:

#### Option 1: Using Node.js (`npx serve`)
```bash
# Run from inside the Koola Chats directory or root directory
npx serve .
```
Open your browser to **`http://localhost:3000`**.

#### Option 2: Using Python
```bash
# Python 3.x
python -m http.server 8080
```
Open your browser to **`http://localhost:8080`**.

#### Option 3: VS Code Live Server Extension
Right-click on `index.html` inside Visual Studio Code and select **"Open with Live Server"**.

---

## 🛠️ Project Structure & Architecture

```text
Koola Chats/
├── index.html                # Single-Page Application (SPA) entry point & split modal layout
├── css/
│   └── styles.css            # Complete design system (Dark mode, glassmorphism, responsive grid)
├── js/
│   ├── firebase-init.js      # Firebase SDK config (Auth, Firestore, Storage) & dynamic exports
│   ├── auth.js               # User registration, login, logout, & profile synchronization logic
│   ├── ui.js                 # DOM engine: Chat list rendering, media uploads, voice notes, emoji picker
│   ├── app.js                # Core app initialization, tab binding, error banners, and event delegation
│   └── webrtc.js             # Peer-to-peer WebRTC video/audio call signaling and stream management
└── README.md                 # Project documentation & step-by-step user instructions
```

---

## 🌍 How to Deploy Your Own Cloud Instance (Firebase Hosting)

If you want to host your own customized copy of **Koola Chats** online for free:

1. Install the Firebase Command Line Tools (`firebase-tools`):
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to your Google / Firebase Account:
   ```bash
   firebase login
   ```
3. Initialize Firebase Hosting in your project folder:
   ```bash
   firebase init hosting
   ```
   * Select your existing Firebase project or create a new one.
   * When asked **"What do you want to use as your public directory?"**, enter `.` (or `Koola Chats`).
   * When asked **"Configure as a single-page app (rewrite all urls to /index.html)?"**, select **Yes (`y`)**.
4. Deploy your app live to Google Cloud CDN:
   ```bash
   firebase deploy
   ```
5. Your custom URL (`https://your-project-id.web.app`) will be generated instantly!

---

<div align="center">
  <p>Made with ❤️ using <strong>Vanilla JavaScript</strong> & <strong>Firebase</strong></p>
</div>
