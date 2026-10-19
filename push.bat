@echo off
echo ===================================================
echo Playo Edappal - Git Commit ^& Push to GitHub
echo Remote: https://github.com/playoedappal99/playo
echo Author: midlaj99 (muhammedmidlaj561@gmail.com)
echo ===================================================

git config user.name "midlaj99"
git config user.email "muhammedmidlaj561@gmail.com"
git add -A
git commit -m "feat: admin auth, forgot password otp via gmail smtp, category image fix, and playoedappal.in domain metadata"
git push origin main

echo.
echo ===================================================
echo Done! Changes are live on playoedappal99/playo
echo ===================================================
pause
