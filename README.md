# 🌍 FoodSaver: Food Waste Reduction App

A comprehensive React Native application designed to tackle food waste by keeping track of your pantry items, intelligently suggesting recipes based on what you already own, and offering seamless donations to nearby NGOs using real-time GPS coordinates.

---

## 🌟 Key Features

1. **Smart Inventory Management**: Track your fridge, freezer, and pantry items. Visual indicators and intelligent sorting remind you of items nearing their expiration dates to prevent needless waste.
2. **AI Recipe Generation (Spoonacular API)**: Don't know what to cook? The app scans your current inventory and talks directly to the global **Spoonacular Food API** to recommend a massive variety of real-world recipes utilizing exactly what you already have.
3. **Live Geolocation Donations (OpenStreetMap API)**: Rather than generic data, the Donate tab accesses your phone's GPS coordinates via `expo-location` and pings the global **Overpass API**, scanning a 25km radius to find *real* local charities, NGOs, and food-banks near you down to the decimal.
4. **Cloud Database & Persistence (Firebase)**: All user data (auth, food items, donation logs) are stored directly inside **Firebase Firestore** and **Firebase Authentication**. Your info travels with your account!
5. **Impact Analytics Dashboard**: Track your waste reduced, money saved, and categorical breakdowns visualized via interactive UI charts.

---

## 🛠 Tech Stack

- **Frontend**: React Native, Expo, React Navigation
- **Architecture**: Context API (Global State Management)
- **Backend/Database**: Firebase Authentication & Firestore (NoSQL)
- **Routing**: `@react-navigation/native-stack` & `@react-navigation/bottom-tabs`
- **External REST APIs**: 
  - [Spoonacular Food API](https://spoonacular.com/food-api)
  - [OpenStreetMap Overpass API](https://overpass-api.de/)
- **Location Services**: `expo-location`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI
- Firebase Project configured for standard Web environments.
- Spoonacular API Key

### 1. Installation

Clone this repository and install necessary dependencies:

```bash
npm install
# Since we use expo-location, ensure you clear cache if it was installed over an old build:
npx expo start --clear
```

### 2. Environment Setup

* **Firebase Config:** Verify that your `src/config/firebaseConfig.ts` contains your active Firebase project settings. Ensure you have activated **Email/Password Authentication** and **Firestore** within your Firebase Console.
* **API Config:** Verify your private Keys are set accurately within `src/config/apiConfig.ts`.

### 3. Running Locally

Execute the following command to spin up the Metro bundler:

```bash
npx expo start
```
* Scan the resulting QR code with the Expo Go app on your physical iOS/Android device.
* Press `a` or `i` in the terminal to launch natively on a plugged-in Android Emulator/iOS Simulator.

---

## 📦 Building

To generate a standalone APK binary for Android:

```bash
npx eas-cli build -p android --profile preview
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or fork the repository.

---

*Together, let's end food waste.* 🌿
