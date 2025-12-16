# Building APK for Android

## Option 1: EAS Build (Recommended for Expo SDK 54)

EAS Build is the modern way to build Expo apps. It's free for open-source projects and provides cloud-based builds.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

```bash
cd frontend
eas build:configure
```

This will create an `eas.json` file with build configurations.

### Step 4: Build APK

```bash
# Build APK (downloadable file)
eas build --platform android --profile preview

# Or build AAB (for Play Store)
eas build --platform android --profile production
```

### Step 5: Download APK

After the build completes, you'll get a link to download the APK. You can also download it using:

```bash
eas build:list
eas build:download [BUILD_ID]
```

---

## Option 2: Local Build with Expo (Legacy)

If you prefer local builds, you can use the legacy method:

### Prerequisites

1. Install Android Studio
2. Set up Android SDK
3. Set JAVA_HOME environment variable

### Build Command

```bash
cd frontend
npx expo build:android -t apk
```

**Note:** This method is deprecated and may not work with Expo SDK 54.

---

## Option 3: Development Build APK

For development/testing purposes:

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Configure

```bash
cd frontend
eas build:configure
```

### Step 3: Build Development APK

```bash
eas build --platform android --profile development
```

---

## Quick Start (EAS Build)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Navigate to frontend
cd frontend

# 4. Configure (first time only)
eas build:configure

# 5. Build APK
eas build --platform android --profile preview
```

---

## EAS Build Profiles

You can customize build profiles in `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

---

## Troubleshooting

### Issue: "EAS CLI not found"
**Solution:** Install globally: `npm install -g eas-cli`

### Issue: "Not logged in"
**Solution:** Run `eas login` and create an Expo account if needed

### Issue: "Build failed"
**Solution:** Check the build logs in Expo dashboard or run with `--verbose` flag

### Issue: "App.json configuration error"
**Solution:** Ensure `app.json` has proper Android configuration

---

## Notes

- **APK vs AAB:** APK is for direct installation, AAB is for Google Play Store
- **Build Time:** First build takes ~15-20 minutes, subsequent builds are faster
- **Free Tier:** EAS Build offers free builds for open-source projects
- **Size:** APK size will be around 30-50 MB depending on dependencies

---

## Alternative: Expo Go (For Testing)

For quick testing without building APK:

```bash
cd frontend
npx expo start
```

Then scan QR code with Expo Go app on Android device.

