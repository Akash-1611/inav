# Creating App Assets

The build is failing because the assets folder is empty. You need to create the following image files:

## Required Assets

### 1. App Icon (icon.png)
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Location:** `frontend/assets/icon.png`
- **Requirements:**
  - Square image
  - No transparency
  - Should represent your app

### 2. Splash Screen (splash.png)
- **Size:** 1242x2436 pixels (or 2048x2732 for better quality)
- **Format:** PNG
- **Location:** `frontend/assets/splash.png`
- **Requirements:**
  - Portrait orientation
  - Should contain your app logo/name
  - Background color: #1E3A8A (or your brand color)

### 3. Adaptive Icon (for Android)
- Uses the same icon.png file
- Android will automatically create adaptive icon from it

## Quick Solution: Generate Assets Online

1. **Use an online tool:**
   - https://www.appicon.co/
   - https://www.makeappicon.com/
   - https://icon.kitchen/

2. **Or create manually:**
   - Create a 1024x1024 PNG image
   - Save as `icon.png` in `frontend/assets/`
   - For splash, create 1242x2436 PNG with your logo centered

## Temporary Workaround

If you want to build without assets (not recommended for production):

1. Create simple placeholder images:
   - Solid color 1024x1024 PNG for icon
   - Solid color 1242x2436 PNG for splash

2. Or use Expo's default assets by removing asset references from app.json (not recommended)

## After Creating Assets

1. Place files in `frontend/assets/` folder:
   ```
   frontend/assets/
   ├── icon.png (1024x1024)
   └── splash.png (1242x2436)
   ```

2. Run build again:
   ```bash
   eas build --platform android --profile preview
   ```

## Recommended Tools

- **Figma** - Design your icon
- **Canva** - Quick icon creation
- **Photoshop/GIMP** - Professional editing
- **Online generators** - Fast placeholder creation

