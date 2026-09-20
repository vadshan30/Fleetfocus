# FleetFocus backend launcher
# Auto-kills any orphaned process on port 8080 before starting

Write-Host "Checking port 8080..." -ForegroundColor Cyan

$existing = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

if ($existing) {
    foreach ($procId in $existing) {
        Write-Host "Killing orphaned process PID $procId on port 8080" -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

Write-Host "Port 8080 is free. Starting backend..." -ForegroundColor Green
mvn spring-boot:run
