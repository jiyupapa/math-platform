@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Math Platform - dev server

REM -- check npm (Node.js) --
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js first: https://nodejs.org
  pause & exit /b 1
)

REM -- first run: install deps if node_modules is missing --
if not exist "node_modules\" (
  echo [setup] node_modules missing - running "npm install" to link all workspaces ...
  call npm install || ( echo [ERROR] npm install failed. & pause & exit /b 1 )
)

REM -- launch everything (build all 12 apps + serve one origin at :4173):  start.cmd all --
if /i "%~1"=="all" ( call :serveall & exit /b )
if /i "%~1"=="a"   ( call :serveall & exit /b )

REM -- direct launch by arg:  start.cmd part1   or   start.cmd 1 --
if not "%~1"=="" (
  call :resolve "%~1"
  if defined app ( call :dev "!app!" & exit /b 0 )
  echo [ERROR] unknown app: %~1
  exit /b 1
)

:menu
cls
echo ============================================================
echo    Math Platform   (monorepo . npm workspaces)
echo ============================================================
echo    0)  Portal                          portal
echo    1)  Part 1  - Linear Algebra        part1
echo    2)  Part 2  - Calculus              part2
echo    3)  Part 3  - Probability ^& Stats   part3
echo    4)  Part 4  - Transformer           part4
echo    5)  Part 5  - Information Theory     part5
echo    6)  Part 6  - LLM Training          part6
echo    7)  Part 7  - Embedding Geometry    part7
echo    8)  Part 8  - Optimization          part8
echo    9)  Part 9  - Numerical Computing   part9
echo   10)  Part 10 - Scaling ^& Evaluation  part10
echo   11)  Part 11 - Agents ^& Reasoning    part11
echo ------------------------------------------------------------
echo    A)  Build all + serve as one origin  (deploy)   [arg: all]
echo    I)  Reinstall deps                   (npm install)
echo    Q)  Quit
echo ============================================================
set "choice="
set /p "choice=Select: "

if /i "%choice%"=="Q" exit /b 0
if /i "%choice%"=="I" ( call npm install & pause & goto menu )
if /i "%choice%"=="A" ( call :serveall & pause & goto menu )

call :resolve "%choice%"
if not defined app ( echo Invalid choice. & timeout /t 1 >nul & goto menu )
call :dev "!app!"
goto menu

REM -- subroutine: number/name -> app folder --
:resolve
set "app="
set "in=%~1"
if /i "%in%"=="0"      set "app=portal"
if /i "%in%"=="portal" set "app=portal"
for /l %%n in (1,1,11) do (
  if "%in%"=="%%n"        set "app=part%%n"
  if /i "%in%"=="part%%n" set "app=part%%n"
)
exit /b 0

REM -- subroutine: run dev server --
:dev
echo.
echo [dev] %~1  -  Vite HMR. Press Ctrl+C to stop and return to the menu.
echo.
call npm run dev -w apps/%~1/web
exit /b 0

REM -- subroutine: build all 12 apps + serve one origin at http://localhost:4173 --
:serveall
echo.
echo [all] building all 12 apps, then serving one origin at http://localhost:4173 ...
echo       (production build - no HMR. Press Ctrl+C to stop.)
echo.
call npm run deploy:build && call npm run deploy:serve
exit /b
