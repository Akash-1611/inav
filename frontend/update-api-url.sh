#!/bin/bash
# Script to update API URL with current IP address

echo "Finding your computer's IP address..."

# Get IP address (works on Mac and Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

if [ -n "$IP" ]; then
    echo "EXPO_PUBLIC_API_URL=http://$IP:3000/api" > .env
    echo "✅ Updated .env file!"
    echo "API URL: http://$IP:3000/api"
    echo ""
    echo "Now restart Expo: npx expo start --clear"
else
    echo "❌ Could not detect IP address"
    echo "Please find your IP manually and update .env file"
fi

