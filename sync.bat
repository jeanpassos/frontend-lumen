@echo off
REM Duplo-clique para sincronizar o LUMEN do Claude Design -> GitHub -> Pages.
setlocal
set "BASH=C:\Program Files\Git\bin\bash.exe"
if not exist "%BASH%" set "BASH=bash"
"%BASH%" "%~dp0scripts/sync.sh"
echo.
pause
