Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 NAAC Accreditation Automation System 🚀" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Step 1: Kill ghost node/python processes lingering from old crashes
Write-Host "1. Sweeping old background ghost processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue

# Step 2: Ensure database is thoroughly seeded natively
Write-Host "2. Running Backend Database Validations..." -ForegroundColor Yellow
Set-Location -Path "backend"
# Attempt to use Python Virtual Environment correctly
$PythonExe = "python"
if (Test-Path "venv\Scripts\python.exe") {
    $PythonExe = "venv\Scripts\python.exe"
}
& $PythonExe seed_data.py

# Step 3: Spawn the Backend Server (Detached Window)
Write-Host "3. Spawning Python Flask API..." -ForegroundColor Green
Start-Process $PythonExe -ArgumentList "app.py" -WindowStyle Normal

# Step 4: Spawn the Frontend Dev Server (Detached Window)
Write-Host "4. Spawning Vite React Framework..." -ForegroundColor Green
Set-Location -Path "..\frontend"
Start-Process "npm.cmd" -ArgumentList "run", "dev" -WindowStyle Normal

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "System is officially ONLINE!" -ForegroundColor Green
Write-Host "Backend API -> http://127.0.0.1:5000" -ForegroundColor White
Write-Host "Frontend UI -> Follow the Vite link in the newly opened window." -ForegroundColor White
Write-Host "Use admin@naac.edu | Admin@123 " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
