@echo off
echo ========================================
echo   INICIANDO APLICACION DE FINANZAS
echo ========================================
echo.

cd /d %~dp0

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor, instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar si las dependencias estan instaladas
if not exist "backend\node_modules" (
    echo Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
    echo.
)

REM Iniciar backend en una nueva ventana
echo Iniciando backend en http://localhost:3000...
start "Backend - Finanzas" cmd /k "cd /d %~dp0backend && node server.js"

REM Esperar 2 segundos para que el backend inicie
timeout /t 2 /nobreak >nul

REM Iniciar frontend en una nueva ventana
echo Iniciando frontend en http://localhost:8888...
start "Frontend - Finanzas" cmd /k "cd /d %~dp0 && python -m http.server 8888"

REM Esperar 1 segundo
timeout /t 1 /nobreak >nul

REM Abrir navegador
echo Abriendo navegador...
start "" http://localhost:8888

echo.
echo ========================================
echo   APLICACION INICIADA CORRECTAMENTE
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8888
echo.
echo Presiona cualquier tecla para cerrar esta ventana
echo (Las ventanas de backend y frontend seguiran activas)
pause >nul
