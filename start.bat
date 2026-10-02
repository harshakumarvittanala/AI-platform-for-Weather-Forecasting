@echo off
title MausamVani AI - Weather & Climate Intelligence Platform
color 0b

echo ======================================================================
echo    MausamVani AI - Weather Forecasting & Climate Intelligence
echo ======================================================================
echo.

:: Automatically free port 5000 if another background instance was left running
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo Freeing existing process on port 5000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting MausamVani Server on http://localhost:5000...
echo.

:: Automatically open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

:: Run the server
node backend\src\server.js

pause
