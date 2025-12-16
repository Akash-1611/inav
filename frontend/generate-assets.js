const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate icon (1024x1024)
async function generateIcon() {
  const svgIcon = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E3A8A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#grad)"/>
      <circle cx="512" cy="400" r="120" fill="white" opacity="0.9"/>
      <rect x="412" y="480" width="200" height="140" rx="10" fill="white" opacity="0.9"/>
      <rect x="432" y="500" width="160" height="20" rx="5" fill="#1E3A8A"/>
      <rect x="432" y="540" width="120" height="20" rx="5" fill="#1E3A8A" opacity="0.7"/>
      <rect x="432" y="580" width="140" height="20" rx="5" fill="#1E3A8A" opacity="0.7"/>
      <text x="512" y="700" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">Payment</text>
    </svg>
  `;

  await sharp(Buffer.from(svgIcon))
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

  console.log('✅ Generated icon.png (1024x1024)');
}

// Generate splash screen (1242x2436)
async function generateSplash() {
  const svgSplash = `
    <svg width="1242" height="2436" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSplash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E3A8A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1242" height="2436" fill="url(#gradSplash)"/>
      <circle cx="621" cy="1000" r="200" fill="white" opacity="0.9"/>
      <rect x="421" y="1100" width="400" height="280" rx="20" fill="white" opacity="0.9"/>
      <rect x="461" y="1140" width="320" height="40" rx="10" fill="#1E3A8A"/>
      <rect x="461" y="1200" width="240" height="40" rx="10" fill="#1E3A8A" opacity="0.7"/>
      <rect x="461" y="1260" width="280" height="40" rx="10" fill="#1E3A8A" opacity="0.7"/>
      <text x="621" y="1500" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">Payment Collection</text>
      <text x="621" y="1650" font-family="Arial, sans-serif" font-size="60" fill="white" text-anchor="middle" opacity="0.9">App</text>
    </svg>
  `;

  await sharp(Buffer.from(svgSplash))
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));

  console.log('✅ Generated splash.png (1242x2436)');
}

// Generate adaptive icon (same as icon for now)
async function generateAdaptiveIcon() {
  const svgIcon = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E3A8A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#grad)"/>
      <circle cx="512" cy="400" r="120" fill="white" opacity="0.9"/>
      <rect x="412" y="480" width="200" height="140" rx="10" fill="white" opacity="0.9"/>
      <rect x="432" y="500" width="160" height="20" rx="5" fill="#1E3A8A"/>
      <rect x="432" y="540" width="120" height="20" rx="5" fill="#1E3A8A" opacity="0.7"/>
      <rect x="432" y="580" width="140" height="20" rx="5" fill="#1E3A8A" opacity="0.7"/>
      <text x="512" y="700" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">Payment</text>
    </svg>
  `;

  await sharp(Buffer.from(svgIcon))
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));

  console.log('✅ Generated adaptive-icon.png (1024x1024)');
}

// Generate favicon (smaller version)
async function generateFavicon() {
  const svgIcon = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E3A8A;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#grad)"/>
      <circle cx="256" cy="200" r="60" fill="white" opacity="0.9"/>
      <rect x="206" y="240" width="100" height="70" rx="5" fill="white" opacity="0.9"/>
      <rect x="216" y="250" width="80" height="10" rx="3" fill="#1E3A8A"/>
      <rect x="216" y="270" width="60" height="10" rx="3" fill="#1E3A8A" opacity="0.7"/>
      <rect x="216" y="290" width="70" height="10" rx="3" fill="#1E3A8A" opacity="0.7"/>
    </svg>
  `;

  await sharp(Buffer.from(svgIcon))
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));

  console.log('✅ Generated favicon.png (512x512)');
}

// Run all generators
async function generateAllAssets() {
  try {
    console.log('🎨 Generating app assets...\n');
    await generateIcon();
    await generateSplash();
    await generateAdaptiveIcon();
    await generateFavicon();
    console.log('\n✅ All assets generated successfully!');
    console.log('📁 Assets saved to: frontend/assets/');
    console.log('\nYou can now run: eas build --platform android --profile preview');
  } catch (error) {
    console.error('❌ Error generating assets:', error);
    process.exit(1);
  }
}

generateAllAssets();

