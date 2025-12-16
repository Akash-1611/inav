# Troubleshooting Expo Go QR Code Error

## Issue: "Something went wrong" when scanning QR code

This error typically occurs due to:
1. **Expo SDK 54 compatibility** - May require updated Expo Go app
2. **Network connectivity issues**
3. **Missing dependencies or configuration**

## Solutions (Try in order)

### Solution 1: Update Expo Go App
**Most Important:** Ensure your Expo Go app is updated to the latest version:
- **iOS:** Update from App Store
- **Android:** Update from Google Play Store

Expo SDK 54 requires Expo Go version 3.x or higher.

### Solution 2: Use Tunnel Mode
Tunnel mode helps bypass network/firewall issues:

```bash
cd frontend
npx expo start --tunnel
```

This will:
- Create a tunnel connection
- Generate a new QR code
- Work even if devices are on different networks

### Solution 3: Clear Cache and Restart
Clear Metro bundler cache:

```bash
cd frontend
npx expo start --clear
```

### Solution 4: Check Network Connection
1. Ensure your computer and phone are on the **same Wi-Fi network**
2. Check firewall settings - allow Expo on port 19000, 19001, 19002
3. Try disabling VPN if active

### Solution 5: Use Development Build (If Expo Go doesn't support SDK 54)
If Expo Go still doesn't work, you may need a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Create development build
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

### Solution 6: Check Console for Errors
When you run `npx expo start`, check the terminal for:
- Red error messages
- Missing module warnings
- Network errors

### Solution 7: Verify Dependencies
Ensure all dependencies are installed:

```bash
cd frontend
rm -rf node_modules
npm install
```

### Solution 8: Alternative - Use Simulator/Emulator
Instead of physical device:
- **iOS:** Press `i` in Expo terminal to open iOS simulator
- **Android:** Press `a` in Expo terminal to open Android emulator

## Quick Test Commands

```bash
# Start with tunnel (recommended)
npx expo start --tunnel

# Start with clear cache
npx expo start --clear

# Check Expo version
npx expo --version

# Check if Metro bundler is running
curl http://localhost:8081/status
```

## Common Error Messages

### "Unable to resolve module"
- **Fix:** Clear cache and reinstall: `rm -rf node_modules && npm install && npx expo start --clear`

### "Network request failed"
- **Fix:** Use tunnel mode or check firewall settings

### "Expo Go version mismatch"
- **Fix:** Update Expo Go app to latest version

### "SDK version not supported"
- **Fix:** Either update Expo Go or use development build

## Still Not Working?

1. Check Expo Go app version matches SDK 54
2. Try on a different device
3. Check Expo status page for known issues
4. Consider using Expo SDK 51 (more stable with Expo Go) if urgent

## Contact
If issues persist, check:
- [Expo Forums](https://forums.expo.dev/)
- [Expo GitHub Issues](https://github.com/expo/expo/issues)
- [Expo Discord](https://chat.expo.dev/)

