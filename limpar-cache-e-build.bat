@echo off
REM Limpa cache do Laravel
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
REM Roda o build do frontend
npm run build
pause 