# 📸 Memora – AI-Powered Image Captioning  
** Making memories visible, making Images accessible **

Memora is a **React Native app** that gives photos a voice. It automatically generates captions for images using AI, making them more accessible — especially for visually impaired users. Think of it as your personal photo storyteller that works in the background and never forgets to caption a moment.

---

## ✨ Features  

- **Automatic Captions** – Capture or import a photo, and Memora creates AI-powered captions instantly.  
- **Gallery View** – Browse all your images alongside their captions.  
- **Background Processing** – New images are auto-processed at intervals you choose (hourly/daily/weekly).  
- **Customizable Settings** – Control connectivity, background fetch frequency, and AI options.  
- **Privacy First** – Captions are stored as metadata; your images never leave your device unless you enable cloud sync.  
- **Optional Google Sync** – Sign in with Google and sync captions to Google Photos metadata.(TBC)  

---

## 🛠️ Tech Stack  

- **Framework:** React Native (with Expo)  
- **AI:** OpenAI Vision API (GPT-4)  
- **State Management:** Redux Toolkit + Redux Persist  
- **Navigation:** React Navigation  
- **Background Tasks:** expo-background-fetch  
- **Storage:** Local with metadata; optional Google Photos API sync  
- **Type Safety:** TypeScript  

---

## 🚀 Getting Started  

### Prerequisites  
- Node.js 18+  
- Expo CLI → `npm install -g @expo/cli`  
- OpenAI API key (required)  
- (Optional) Firebase project + Google Photos API for cloud sync  (For now : its not needed)

### Installation  
```bash
# Clone repo  
git clone https://github.com/ReservedSnow673/Memora.git  

# Enter project  
cd memora  

# Install dependencies  
npm install
