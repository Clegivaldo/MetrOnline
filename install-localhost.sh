#!/bin/bash

# Sistema de Gestão de Certificados de Calibração - Instalador Localhost
# Este script instala o sistema em localhost/Ubuntu Server sem SSL

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
ADMIN_PASSWORD=""
PORT="8000"

# Função para obter configurações
get_config() {
    echo -e "${BLUE}=== CONFIGURAÇÃO DO SISTEMA ===${NC}"
    
    read -s -p "Digite a senha do administrador: " ADMIN_PASSWORD
    echo
    if [[ -z "$ADMIN_PASSWORD" ]]; then
        ADMIN_PASSWORD="admin123"
        warning "Usando senha padrão: $ADMIN_PASSWORD"
    fi
    
    read -p "Digite a porta para o servidor (padrão: 8000): " PORT
    if [[ -z "$PORT" ]]; then
        PORT="8000"
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
    apt install -y php8.2 php8.2-cli php8.2-common php8.2-sqlite3 php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-json php8.2-tokenizer php8.2-fileinfo php8.2-opcache
    
    # Instalar Composer
    log "Instalando Composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
    
    # Instalar Node.js 18
    log "Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Instalar SQLite
    log "Instalando SQLite..."
    apt install -y sqlite3
    
    log "Dependências instaladas!"
}

# Função para baixar e configurar o sistema
install_system() {
    log "Baixando e configurando o sistema..."
    
    # Criar diretório
    mkdir -p /var/www
    cd /var/www
    
    # Clonar repositório
    git clone https://github.com/Clegivaldo/sistema-certificados-laravel.git
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
    
    # Configurar banco de dados SQLite no .env
    sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=sqlite/" .env
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=\/var\/www\/sistema-certificados-laravel\/database\/database.sqlite/" .env
    
    # Configurar URL local no .env
    sed -i "s/APP_URL=.*/APP_URL=http:\/\/localhost:$PORT/" .env
    
    # Criar banco SQLite
    touch database/database.sqlite
    chmod 664 database/database.sqlite
    chown www-data:www-data database/database.sqlite
    
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

# Função para configurar usuário administrador
configure_admin() {
    log "Configurando usuário administrador..."
    
    cd /var/www/sistema-certificados-laravel
    
    # Alterar senha do admin
    php artisan user:change-password --email=admin@metrologia.com --password=$ADMIN_PASSWORD
    
    log "Administrador configurado!"
}

# Função para criar script de inicialização
create_startup_script() {
    log "Criando script de inicialização..."
    
    # Criar script de inicialização
    cat > /usr/local/bin/start-metrologia.sh << EOF
#!/bin/bash
cd /var/www/sistema-certificados-laravel
php artisan serve --host=0.0.0.0 --port=$PORT
EOF
    
    # Tornar executável
    chmod +x /usr/local/bin/start-metrologia.sh
    
    # Criar serviço systemd
    cat > /etc/systemd/system/metrologia.service << EOF
[Unit]
Description=Sistema de Gestão de Certificados de Calibração
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sistema-certificados-laravel
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=$PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Recarregar systemd e habilitar serviço
    systemctl daemon-reload
    systemctl enable metrologia.service
    
    log "Script de inicialização criado!"
}

# Função para configurar firewall
configure_firewall() {
    log "Configurando firewall..."
    
    # Instalar UFW se não estiver instalado
    apt install -y ufw
    
    # Configurar regras
    ufw allow ssh
    ufw allow $PORT/tcp
    ufw --force enable
    
    log "Firewall configurado!"
}

# Função para mostrar informações finais
show_final_info() {
    echo -e "${GREEN}"
    echo "=========================================="
    echo "    INSTALAÇÃO CONCLUÍDA COM SUCESSO!    "
    echo "=========================================="
    echo -e "${NC}"
    
    echo -e "${BLUE}Informações do Sistema:${NC}"
    echo "URL: http://localhost:$PORT"
    echo "Email Admin: admin@metrologia.com"
    echo "Senha Admin: $ADMIN_PASSWORD"
    echo "Email Cliente: cliente@teste.com"
    echo "Senha Cliente: password"
    
    echo -e "${BLUE}Comandos Úteis:${NC}"
    echo "Iniciar sistema: systemctl start metrologia"
    echo "Parar sistema: systemctl stop metrologia"
    echo "Reiniciar sistema: systemctl restart metrologia"
    echo "Ver status: systemctl status metrologia"
    echo "Ver logs: journalctl -u metrologia -f"
    echo "Iniciar manualmente: /usr/local/bin/start-metrologia.sh"
    
    echo -e "${BLUE}Informações do Banco:${NC}"
    echo "Tipo: SQLite"
    echo "Arquivo: /var/www/sistema-certificados-laravel/database/database.sqlite"
    
    echo -e "${YELLOW}IMPORTANTE:${NC}"
    echo "1. Altere as senhas padrão após o primeiro login"
    echo "2. Configure o SMTP para envio de emails"
    echo "3. Configure as informações da empresa"
    echo "4. O sistema inicia automaticamente com o servidor"
    
    echo -e "${GREEN}O sistema está pronto para uso!${NC}"
    echo -e "${BLUE}Acesse: http://localhost:$PORT${NC}"
}

# Função principal
main() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  SISTEMA DE GESTÃO DE CERTIFICADOS      "
    echo "      Instalador Localhost v1.0          "
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
    install_system
    configure_admin
    create_startup_script
    configure_firewall
    
    # Mostrar informações finais
    show_final_info
}

# Executar função principal
main "$@" 