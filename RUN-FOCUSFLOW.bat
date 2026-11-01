@echo off
setlocal
cd /d "%~dp0"
start "FocusFlow Server" cmd /k "npm start"
timeout /t 2 /nobreak >nul
start "" http://localhost:3000
endlocal
