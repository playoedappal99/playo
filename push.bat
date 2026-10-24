@echo off
echo ========================================================
echo  Syncing Playo Edappal to GitHub (playoedappal99/playo)
echo ========================================================
git config user.name midlaj99
git config user.email muhammedmidlaj561@gmail.com
git add -A
git commit -m "feat: optional delivery fee in admin & checkout, device-isolated my-orders privacy, and privacy & terms pages with razorpay integration"
git push origin main
echo ========================================================
echo  Sync complete!
echo ========================================================
pause
