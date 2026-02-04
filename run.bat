@echo off
REM Script chạy Web Application trên Windows

echo.
echo ============================================
echo   Web Application - MySQL Connection
echo ============================================
echo.

REM Kiểm tra Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python chua duoc cai dat hoac khong o trong PATH
    pause
    exit /b 1
)

REM Kiểm tra requirements
echo [*] Kiem tra Python packages...
pip list | findstr /R "Flask flask-mysqldb" >nul
if errorlevel 1 (
    echo [*] Cai dat Python packages...
    pip install -r requirements.txt
)

REM Chạy ứng dụng
echo.
echo [*] Khoi dong Flask server...
echo [*] Truy cap: http://localhost:5000/
echo [*] Dung server: Nhan Ctrl+C
echo.

python index.py

pause
