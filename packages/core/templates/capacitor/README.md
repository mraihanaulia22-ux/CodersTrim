# __CT_PROJECT_NAME__

Universal web-to-mobile hybrid container built with React 19, Tailwind CSS v4, and Capacitor 7.

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run in browser (Web Dev)
```bash
npm run dev
```

### 3. Build web bundle & Sync to Native Platforms
```bash
# 1. Build the web dist/ bundle FIRST
npm run build

# 2. Add Android or iOS native platform (one-time setup)
npx cap add android
npx cap add ios

# 3. Sync changes to native projects
npx cap sync

# 4. Open in Android Studio or Xcode
npx cap open android
npx cap open ios
```
