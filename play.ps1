Set-Location $PSScriptRoot
Start-Process cmd.exe -ArgumentList '/c','npm run dev' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
Start-Process cmd.exe -ArgumentList '/c','npx prisma studio' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
exit