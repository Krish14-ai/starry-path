# 📦 Installation Guide — Orbit (Starry Path)

This guide covers **three ways** to run the app. Pick the one that fits you.

---

## 📋 Table of Contents

1. [Option A — Run the Web App Locally (Recommended)](#option-a--run-the-web-app-locally-recommended)
2. [Option B — Install the Pre-Built APK on Android](#option-b--install-the-pre-built-apk-on-android)
3. [Option C — Build the Android APK from Source](#option-c--build-the-android-apk-from-source)
4. [Troubleshooting](#troubleshooting)

---

## Option A — Run the Web App Locally (Recommended)

> ✅ **Best for:** Testing the full app on your PC/Mac, no Android device needed.

### Prerequisites

| Tool | Minimum Version | Download |
|------|----------------|----------|
| **Node.js** | v18 or higher | https://nodejs.org |
| **npm** | v9 or higher | Included with Node.js |

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Krish14-ai/starry-path.git
cd starry-path

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

4. Open your browser and go to: **http://localhost:5000**

> **Note:** The app uses in-memory storage by default — no database setup needed. Data resets when the server restarts. This is fine for testing.

---

## Option B — Install the Pre-Built APK on Android

> ✅ **Best for:** Quickly installing the app on your Android phone without building anything.

> ⚠️ **Important:** The Android app (TWA) loads from a hosted web server. If the server is offline, the app will show a blank/error screen. Use Option A to run locally instead.

### Steps

1. **Download the APK** from the repository:
   - File: `android-twa/app-release-signed.apk`

2. **Transfer it to your Android phone** (USB, Google Drive, WhatsApp, email — any method works)

3. **Enable installing from unknown sources** on your phone:
   - Go to **Settings → Security** (or **Settings → Apps → Special app access → Install unknown apps**)
   - Allow your file manager or browser to install apps

4. **Open the APK file** on your phone and tap **Install**

5. Look for **"StarryPath"** in your app drawer and launch it

> **Minimum Android version:** Android 5.0 (API level 21) or higher

---

## Option C — Build the Android APK from Source

> ✅ **Best for:** Developers who want to modify the app or point it to a different server URL.

### Prerequisites

| Tool | Required Version | Download |
|------|-----------------|----------|
| **Node.js** | v18+ | https://nodejs.org |
| **Java JDK** | **17** (not 11, not 8) | https://adoptium.net — download **Temurin JDK 17** |
| **Android SDK** | API 36 | Install via [Android Studio](https://developer.android.com/studio) |

> ⚠️ **Java 17 is required.** Android Gradle Plugin 8.x will reject Java 11 or older.

---

### Step 1 — Set up Java

After installing JDK 17, set the environment variables:

**Windows (PowerShell — run once, then restart your terminal):**
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17.x.x", "User")
$current = [System.Environment]::GetEnvironmentVariable("Path", "User")
[System.Environment]::SetEnvironmentVariable("Path", "$current;C:\Program Files\Java\jdk-17.x.x\bin", "User")
```

Replace `jdk-17.x.x` with your actual installed folder name.

**Mac/Linux:**
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)   # macOS
export PATH="$JAVA_HOME/bin:$PATH"
```

**Verify:**
```bash
java -version
# Expected: java version "17.x.x"
```

---

### Step 2 — Set up Android SDK

1. Install **Android Studio** from https://developer.android.com/studio
2. Open Android Studio → **SDK Manager**
3. Install:
   - **Android SDK Platform 35 or 36**
   - **Android SDK Build-Tools 35**
4. Note your SDK path:
   - **Windows:** `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - **Mac:** `~/Library/Android/sdk`
   - **Linux:** `~/Android/Sdk`

**Add ADB to PATH (Windows):**
```powershell
$current = [System.Environment]::GetEnvironmentVariable("Path", "User")
[System.Environment]::SetEnvironmentVariable("Path", "$current;C:\Users\<YourUsername>\AppData\Local\Android\Sdk\platform-tools", "User")
```

---

### Step 3 — Configure the SDK path

Create or edit the file `android-twa/local.properties`:

**Windows:**
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**Mac/Linux:**
```properties
sdk.dir=/Users/yourname/Library/Android/sdk
```

> ⚠️ **Do not commit `local.properties` to Git** — it's already in `.gitignore` and contains your machine-specific path.

---

### Step 4 — Build the APK

```bash
cd android-twa

# Windows
.\gradlew assembleRelease

# Mac/Linux
./gradlew assembleRelease
```

The build takes **2–5 minutes** on first run (downloads SDK components automatically).

**Output APK location:**
```
android-twa/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

### Step 5 — Install on device via ADB (optional)

Connect your Android phone via USB with **USB Debugging enabled** (Settings → Developer Options), then:

```bash
adb devices                                      # confirm your device is listed
adb install android-twa/app-release-signed.apk   # install the signed APK
```

---

## 🌐 Pointing the App to a Different Server

The Android TWA app loads from a hosted URL. If the default server is offline, deploy your own copy of the web app and update these two files:

**`android-twa/twa-manifest.json`:**
```json
"host": "your-new-domain.example.com",
"startUrl": "/",
"fullScopeUrl": "https://your-new-domain.example.com/"
```

**`android-twa/app/build.gradle`:**
```groovy
hostName: 'your-new-domain.example.com',
```

Then rebuild the APK (Step 4 above).

**Free hosting options:**
- [Render](https://render.com) — connect GitHub, auto-deploy
- [Railway](https://railway.app) — simple Node.js hosting
- [Replit](https://replit.com) — import from GitHub and deploy

---

## 🔧 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `JAVA_HOME is not set` | Java not on PATH | Set `JAVA_HOME` and add `jdk\bin` to PATH, then open a new terminal |
| `Android Gradle plugin requires Java 17` | Wrong Java version active | Install JDK 17 from https://adoptium.net and set `JAVA_HOME` to it |
| `SDK location not found` | `local.properties` missing or has wrong path | Create `android-twa/local.properties` with your `sdk.dir` path |
| `adb: not recognized` | ADB not on PATH | Add `Android\Sdk\platform-tools` to your PATH |
| `This app isn't live yet` (in Android app) | Hosted server is offline | Run locally with `npm run dev` and open http://localhost:5000 |
| `npm run dev` fails on Windows | `NODE_ENV=` not supported natively | Run `npm install` — `cross-env` is already in devDependencies |
| `fatal: couldn't find remote ref <branch>` | Branch not pushed to remote | Run `git push <remote> <branch>` to publish it |

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `android-twa/app-release-signed.apk` | Pre-built signed APK — ready to install |
| `android-twa/twa-manifest.json` | TWA config (host URL, colors, app name) |
| `android-twa/local.properties` | Your local Android SDK path (**do not commit**) |
| `android-twa/app/build.gradle` | Android build configuration |
| `package.json` | Web app npm scripts |
| `README.md` | Project overview |

---

*Installation guide for the Orbit / Starry Path project. Last updated: October 2026.*
