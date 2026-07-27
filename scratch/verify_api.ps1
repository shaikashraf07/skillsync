# Test 1: Health check
Write-Host "=== Health Check ===" -ForegroundColor Cyan
try {
    $h = Invoke-RestMethod -Method GET -Uri "https://skillsync-api-gnhz.onrender.com/health"
    $h | ConvertTo-Json
} catch { Write-Host "Health check failed: $_" -ForegroundColor Red }

# Test 2: Login with bad credentials (should return 401, NOT 500)
Write-Host "`n=== Login (bad creds -> expect 401) ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Method POST -Uri "https://skillsync-api-gnhz.onrender.com/auth/login" `
        -ContentType "application/json" `
        -Body '{"email":"nobody@test.com","password":"wrongpass"}'
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "Status: $status" -ForegroundColor Yellow
    Write-Host "Body: $body"
}

# Test 3: Login with valid credentials (should return 200)
Write-Host "`n=== Login (valid creds -> expect 200) ===" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Method POST -Uri "https://skillsync-api-gnhz.onrender.com/auth/login" `
        -ContentType "application/json" `
        -Body '{"email":"newtest123@test.com","password":"Test123!"}'
    Write-Host "Status: 200 OK" -ForegroundColor Green
    Write-Host "Token received: $($r.token.Substring(0,20))..."
    Write-Host "User: $($r.user | ConvertTo-Json)"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "FAILED - Status: $status" -ForegroundColor Red
    Write-Host "Body: $body"
}
