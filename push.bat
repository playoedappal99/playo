@echo off
echo ===================================================
echo Playo Edappal - Git Commit ^& Push to GitHub
echo Remote: https://github.com/playoedappal99/playo
echo Author: midlaj99 (muhammedmidlaj561@gmail.com)
echo ===================================================

git config user.name "midlaj99"
git config user.email "muhammedmidlaj561@gmail.com"
git add -A
git commit -m "fix: resolve lint errors and allow clean production build on vercel"
git push origin main

echo.
echo ===================================================
echo Done! Changes are live on playoedappal99/playo
echo ===================================================
pause
