@echo off
set PATH=C:\pinokio\bin\miniconda\Library\bin;%PATH%
cd /d C:\Users\voids\.gemini\antigravity\scratch\portfolio-app
echo Pushing portfolio to https://github.com/moizk6913/moizcreates.git ...
git push -u origin main
echo.
echo All done! You can now deploy on Vercel.
pause
