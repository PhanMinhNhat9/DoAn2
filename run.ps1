# Script chạy Web Application trên Windows PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Web Application - MySQL Connection" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Python
try {
    $pythonVersion = python --version 2>$null
    Write-Host "[✓] Python: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "[✗] Python chua duoc cai dat!" -ForegroundColor Red
    exit 1
}

# Kiểm tra requirements
Write-Host "[*] Kiem tra Python packages..." -ForegroundColor Yellow
$packages = pip list
if (-not $packages -match "Flask") {
    Write-Host "[*] Cai dat Python packages..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Kiểm tra kết nối
Write-Host "[*] Kiem tra ket noi MySQL..." -ForegroundColor Yellow
python test_connection.py
Write-Host ""

# Chạy ứng dụng
Write-Host "[*] Khoi dong Flask server..." -ForegroundColor Green
Write-Host "[*] Truy cap: http://localhost:5000/" -ForegroundColor Cyan
Write-Host "[*] Dung server: Nhan Ctrl+C" -ForegroundColor Yellow
Write-Host ""

python index.py

Read-Host "Nhan Enter de thoat"
