@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo  Syncing Playo Edappal to GitHub (playoedappal99/playo)
echo ========================================================

git config user.name midlaj99
git config user.email muhammedmidlaj561@gmail.com

echo Staging all changes...
git add -A

echo Creating commit...
git commit -m "feat: SEO optimization for Edappal & Malappuram, branded OG image and favicon, real-time 3x notification sounds, order email alerts, and cybersecurity hardening"

echo Integrating remote changes...
git pull origin main --no-edit --allow-unrelated-histories -X ours

echo Pushing to GitHub (main branch)...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Non-fast-forward detected. Synchronizing with GitHub...
    git push origin main --force
)

echo.
echo ========================================================
echo  Sync finished! Check the message above for confirmation.
echo ========================================================
pause
