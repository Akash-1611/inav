# Script to update API URL with current IP address

Write-Host "Finding your computer's IP address..." -ForegroundColor Cyan

# Get IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -like "192.168.*" -or 
    $_.IPAddress -like "10.*" -or 
    $_.IPAddress -like "172.16.*" 
} | Select-Object -First 1).IPAddress

if ($ip) {
    $apiUrl = "EXPO_PUBLIC_API_URL=http://$ip`:3000/api"
    $apiUrl | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ Updated .env file!" -ForegroundColor Green
    Write-Host "API URL: http://$ip`:3000/api" -ForegroundColor Cyan
    Write-Host "`nNow restart Expo: npx expo start --clear" -ForegroundColor Yellow
} else {
    Write-Host "❌ Could not detect IP address" -ForegroundColor Red
    Write-Host "Please find your IP manually and update .env file" -ForegroundColor Yellow
}

