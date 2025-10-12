@echo off
REM Build and Deploy Script for AI Tester (Windows)

echo ========================================
echo AI Tester - Build and Deploy Script
echo ========================================
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install build tools
echo Installing build tools...
pip install build wheel setuptools

REM Clean previous builds
echo Cleaning previous builds...
if exist "build" rmdir /s /q build
if exist "dist" rmdir /s /q dist
if exist "ai_tester.egg-info" rmdir /s /q ai_tester.egg-info

REM Build wheel
echo.
echo Building wheel package...
python -m build --wheel

REM Check if build was successful
if exist "dist\ai_tester-1.0.0-py3-none-any.whl" (
    echo.
    echo ========================================
    echo Build successful!
    echo ========================================
    echo.
    echo Wheel package created: dist\ai_tester-1.0.0-py3-none-any.whl
    echo.
    echo To install:
    echo   pip install dist\ai_tester-1.0.0-py3-none-any.whl
    echo.
    echo To run:
    echo   python app.py
    echo.
) else (
    echo.
    echo ========================================
    echo Build failed!
    echo ========================================
    echo Please check the error messages above.
    exit /b 1
)

REM Ask if user wants to install
set /p INSTALL="Do you want to install the package now? (y/n): "
if /i "%INSTALL%"=="y" (
    echo.
    echo Installing package...
    pip install dist\ai_tester-1.0.0-py3-none-any.whl
    echo.
    echo Installation complete!
)

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Initialize database: python database.py
echo 2. Set SECRET_KEY in oauth_config.py
echo 3. Run application: python app.py
echo 4. Access at: http://127.0.0.1:5000
echo.

pause
