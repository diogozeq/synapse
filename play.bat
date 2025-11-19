@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c','npm run dev' -WorkingDirectory '%~dp0' -WindowStyle Hidden; Start-Process cmd.exe -ArgumentList '/c','npx prisma studio' -WorkingDirectory '%~dp0' -WindowStyle Hidden"
exit