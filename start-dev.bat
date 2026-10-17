@echo off
echo.
echo ========================================
echo  SocialTodo - Starting Development Mode
echo ========================================
echo.

:: Start backend
echo [1/2] Starting backend on http://localhost:5000...
start "SocialTodo Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start frontend
echo [2/2] Starting frontend on http://localhost:3000...
start "SocialTodo Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo Both servers are starting!
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
