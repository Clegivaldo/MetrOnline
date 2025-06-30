#!/bin/bash

# Sistema de Gestão de Certificados de Calibração - Instalador VPS
# Este script instala o sistema em um VPS com domínio e SSL

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (sudo)"
fi

# Verificar se é Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    error "Este script é compatível apenas com Ubuntu/Debian"
fi

# Configurações
DOMAIN=""
EMAIL=""
DB_PASSWORD=""
ADMIN_PASSWORD=""

# Função para obter configurações
get_config() {
    echo -e "${BLUE}=== CONFIGURAÇÃO DO SISTEMA ===${NC}"
    
    read -p "Digite o domínio (ex: metrologia.seudominio.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        error "Domínio é obrigatório"
    fi
    
    read -p "Digite o email para SSL (ex: admin@seudominio.com): " EMAIL
    if [[ -z "$EMAIL" ]]; then
        error "Email é obrigatório"
    fi
    
    read -s -p "Digite a senha do banco de dados: " DB_PASSWORD
    echo
    if [[ -z "$DB_PASSWORD" ]]; then
        DB_PASSWORD=$(openssl rand -base64 32)
        info "Senha do banco gerada automaticamente: $DB_PASSWORD"
    fi
    
    read -s -p "Digite a senha do administrador: " ADMIN_PASSWORD
    echo
    if [[ -z "$ADMIN_PASSWORD" ]]; then
        ADMIN_PASSWORD="admin123"
        warning "Usando senha padrão: $ADMIN_PASSWORD"
    fi
    
    echo -e "${GREEN}Configuração salva!${NC}"
}

# Função para atualizar sistema
update_system() {
    log "Atualizando sistema..."
    apt update && apt upgrade -y
    log "Sistema atualizado!"
}

# Função para instalar dependências
install_dependencies() {
    log "Instalando dependências..."
    
    # Instalar pacotes básicos
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Instalar PHP 8.2
    log "Instalando PHP 8.2..."
    add-apt-repository ppa:ondrej/php -y
    apt update
    apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common php8.2-mysql php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-json php8.2-tokenizer php8.2-fileinfo php8.2-opcache
    
    # Instalar Composer
    log "Instalando Composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
    
    # Instalar Node.js 18
    log "Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Instalar Nginx
    log "Instalando Nginx..."
    apt install -y nginx
    
    # Instalar MySQL
    log "Instalando MySQL..."
    apt install -y mysql-server
    
    # Instalar Certbot
    log "Instalando Certbot..."
    apt install -y certbot python3-certbot-nginx
    
    # Instalar Supervisor
    log "Instalando Supervisor..."
    apt install -y supervisor
    
    log "Dependências instaladas!"
}

# Função para configurar MySQL
configure_mysql() {
    log "Configurando MySQL..."
    
    # Configurar MySQL
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';"
    mysql -e "DELETE FROM mysql.user WHERE User='';"
    mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    mysql -e "DROP DATABASE IF EXISTS test;"
    mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    mysql -e "FLUSH PRIVILEGES;"
    
    # Criar banco e usuário para o sistema
    mysql -e "CREATE DATABASE IF NOT EXISTS metrologia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -e "CREATE USER IF NOT EXISTS 'metrologia'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
    mysql -e "GRANT ALL PRIVILEGES ON metrologia.* TO 'metrologia'@'localhost';"
    mysql -e "FLUSH PRIVILEGES;"
    
    log "MySQL configurado!"
}

# Função para baixar e configurar o sistema
install_system() {
    log "Baixando e configurando o sistema..."
    
    # Criar diretório
    mkdir -p /var/www
    cd /var/www
    
    # Clonar repositório (substitua pela URL correta)
    git clone https://github.com/seu-usuario/sistema-certificados-laravel.git
    cd sistema-certificados-laravel
    
    # Configurar permissões
    chown -R www-data:www-data /var/www/sistema-certificados-laravel
    chmod -R 755 /var/www/sistema-certificados-laravel
    
    # Instalar dependências PHP
    log "Instalando dependências PHP..."
    composer install --no-dev --optimize-autoloader
    
    # Instalar dependências Node.js
    log "Instalando dependências Node.js..."
    npm install
    npm run build
    
    # Configurar arquivo .env
    log "Configurando arquivo .env..."
    cp .env.example .env
    
    # Gerar chave da aplicação
    php artisan key:generate
    
    # Configurar banco de dados no .env
    sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=mysql/" .env
    sed -i "s/DB_HOST=.*/DB_HOST=127.0.0.1/" .env
    sed -i "s/DB_PORT=.*/DB_PORT=3306/" .env
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=metrologia/" .env
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=metrologia/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    
    # Configurar domínio no .env
    sed -i "s/APP_URL=.*/APP_URL=https:\/\/$DOMAIN/" .env
    
    # Executar migrations e seeders
    log "Executando migrations e seeders..."
    php artisan migrate --seed
    
    # Configurar permissões de storage
    chmod -R 775 storage bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache
    
    # Criar link simbólico para storage
    php artisan storage:link
    
    log "Sistema instalado!"
}

# Função para configurar Nginx
configure_nginx() {
    log "Configurando Nginx..."
    
    # Criar configuração do site
    cat > /etc/nginx/sites-available/metrologia << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    root /var/www/sistema-certificados-laravel/public;
    index index.php index.html index.htm;
    
    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Configuração principal
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    # Configuração PHP
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }
    
    # Configuração de upload
    client_max_body_size 100M;
    
    # Configuração de cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
    }
    
    location ~ /\.ht {
        deny all;
    }
    
    # Logs
    access_log /var/log/nginx/metrologia_access.log;
    error_log /var/log/nginx/metrologia_error.log;
}
EOF
    
    # Ativar site
    ln -sf /etc/nginx/sites-available/metrologia /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    nginx -t
    
    # Reiniciar Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log "Nginx configurado!"
}

# Função para configurar SSL
configure_ssl() {
    log "Configurando SSL..."
    
    # Obter certificado SSL
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
    
    # Configurar renovação automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log "SSL configurado!"
}

# Função para configurar Supervisor
configure_supervisor() {
    log "Configurando Supervisor..."
    
    # Criar configuração do worker
    cat > /etc/supervisor/conf.d/laravel-worker.conf << EOF
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sistema-certificados-laravel/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/sistema-certificados-laravel/storage/logs/worker.log
stopwaitsecs=3600
EOF
    
    # Recarregar configuração
    supervisorctl reread
    supervisorctl update
    supervisorctl start laravel-worker:*
    
    log "Supervisor configurado!"
}

# Função para configurar firewall
configure_firewall() {
    log "Configurando firewall..."
    
    # Instalar UFW se não estiver instalado
    apt install -y ufw
    
    # Configurar regras
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
    
    log "Firewall configurado!"
}

# Função para configurar backup
configure_backup() {
    log "Configurando backup automático..."
    
    # Criar script de backup
    cat > /usr/local/bin/backup-metrologia.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/metrologia"
DATE=\$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p \$BACKUP_DIR

# Backup do banco de dados
mysqldump -u metrologia -p$DB_PASSWORD metrologia > \$BACKUP_DIR/database_\$DATE.sql

# Backup dos arquivos
tar -czf \$BACKUP_DIR/files_\$DATE.tar.gz -C /var/www sistema-certificados-laravel

# Manter apenas os últimos 7 backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: \$DATE"
EOF
    
    # Tornar executável
    chmod +x /usr/local/bin/backup-metrologia.sh
    
    # Adicionar ao crontab (backup diário às 2h da manhã)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-metrologia.sh") | crontab -
    
    log "Backup configurado!"
}

# Função para configurar usuário administrador
configure_admin() {
    log "Configurando usuário administrador..."
    
    cd /var/www/sistema-certificados-laravel
    
    # Alterar senha do admin
    php artisan user:change-password --email=admin@metrologia.com --password=$ADMIN_PASSWORD
    
    log "Administrador configurado!"
}

# Função para mostrar informações finais
show_final_info() {
    echo -e "${GREEN}"
    echo "=========================================="
    echo "    INSTALAÇÃO CONCLUÍDA COM SUCESSO!    "
    echo "=========================================="
    echo -e "${NC}"
    
    echo -e "${BLUE}Informações do Sistema:${NC}"
    echo "URL: https://$DOMAIN"
    echo "Email Admin: admin@metrologia.com"
    echo "Senha Admin: $ADMIN_PASSWORD"
    echo "Email Cliente: cliente@teste.com"
    echo "Senha Cliente: password"
    
    echo -e "${BLUE}Informações do Banco:${NC}"
    echo "Database: metrologia"
    echo "Usuário: metrologia"
    echo "Senha: $DB_PASSWORD"
    
    echo -e "${BLUE}Comandos Úteis:${NC}"
    echo "Ver logs: tail -f /var/www/sistema-certificados-laravel/storage/logs/laravel.log"
    echo "Reiniciar: systemctl restart nginx && systemctl restart php8.2-fpm"
    echo "Backup manual: /usr/local/bin/backup-metrologia.sh"
    echo "Verificar status: supervisorctl status"
    
    echo -e "${YELLOW}IMPORTANTE:${NC}"
    echo "1. Altere as senhas padrão após o primeiro login"
    echo "2. Configure o SMTP para envio de emails"
    echo "3. Configure as informações da empresa"
    echo "4. Faça backup regular dos dados"
    
    echo -e "${GREEN}O sistema está pronto para uso!${NC}"
}

# Função principal
main() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  SISTEMA DE GESTÃO DE CERTIFICADOS      "
    echo "        Instalador VPS v1.0              "
    echo "=========================================="
    echo -e "${NC}"
    
    # Obter configurações
    get_config
    
    # Confirmar instalação
    echo
    read -p "Deseja continuar com a instalação? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Instalação cancelada"
    fi
    
    # Executar instalação
    update_system
    install_dependencies
    configure_mysql
    install_system
    configure_nginx
    configure_ssl
    configure_supervisor
    configure_firewall
    configure_backup
    configure_admin
    
    # Mostrar informações finais
    show_final_info
}

# Executar função principal
main "$@"