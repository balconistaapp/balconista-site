@echo off
setlocal
title Balconista - landing local
cd /d "%~dp0"
set "PORTA=8767"
set "URL=http://127.0.0.1:%PORTA%/"

where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERRO] Python nao encontrado.
  echo  Instale em https://www.python.org/downloads/ e marque "Add python.exe to PATH".
  echo.
  pause
  exit /b 1
)

rem Se a landing ja estiver rodando nesta porta, so abre o navegador
netstat -ano | findstr /c:"127.0.0.1:%PORTA% " | findstr /c:"LISTENING" >nul
if not errorlevel 1 (
  echo  A landing ja esta rodando. Abrindo %URL%
  start "" "%URL%"
  exit /b 0
)

echo.
echo  ==============================================
echo   Balconista - landing rodando em %URL%
echo   So este computador acessa (127.0.0.1).
echo   Para parar: feche esta janela ou aperte Ctrl+C.
echo  ==============================================
echo.

rem Abre o navegador 2 segundos depois, enquanto o servidor sobe
start "" /b cmd /c "ping -n 3 127.0.0.1 >nul & start "" "%URL%""

python -m http.server %PORTA% --bind 127.0.0.1 -d "%~dp0."

echo.
echo  O servidor parou.
pause
