@echo off
cd /d "c:\Users\hii\Desktop\playo\playoedappal"
timeout /t 2 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
if exist ".next" rmdir /s /q .next
set PATH=D:\New folder;%PATH%
start "" /min cmd.exe /c "npm run dev > dev-server.log 2>&1"
