@echo off
REM Instalador para Windows - Sistema de Certificados Laravel + React

REM Verificar dependências
where php >nul 2>nul || (echo PHP não encontrado! Instale o XAMPP ou WAMP. & pause & exit /b)
where composer >nul 2>nul || (echo Composer não encontrado! Instale o Composer. & pause & exit /b)
where npm >nul 2>nul || (echo Node.js/NPM não encontrado! Instale o Node.js. & pause & exit /b)

REM Instalar dependências PHP
composer install --no-dev --optimize-autoloader

REM Instalar dependências Node.js
npm install
npm run build

REM Gerar .env
if not exist .env copy .env.example .env
php artisan key:generate

REM Criar banco SQLite
if not exist database\database.sqlite type nul > database\database.sqlite

REM Executar migrations e seeders
php artisan migrate --seed

REM Criar link simbólico para storage
php artisan storage:link

REM Iniciar servidor Laravel
start php artisan serve --host=127.0.0.1 --port=8000

REM Abrir navegador
start http://127.0.0.1:8000

echo Instalação concluída! Acesse http://127.0.0.1:8000
pause 