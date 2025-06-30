# Sistema de Gestão de Certificados de Calibração

Sistema completo para gestão de certificados de calibração desenvolvido em Laravel 12 com frontend React/TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### **Autenticação e Segurança**
- ✅ Sistema de login multi-role (Admin, Usuário, Cliente)
- ✅ Proteção contra força bruta (máximo 5 tentativas)
- ✅ Tokens de autenticação seguros
- ✅ Logs de auditoria completos
- ✅ Controle de acesso por perfil

### **Gestão de Certificados**
- ✅ Upload de certificados em PDF
- ✅ Visualização e download de certificados
- ✅ Controle de validade e expiração
- ✅ Filtros e busca avançada
- ✅ Notificações automáticas de expiração

### **Gestão de Clientes**
- ✅ Cadastro completo de clientes
- ✅ Upload de foto de perfil
- ✅ Histórico de login
- ✅ Dashboard específico para clientes

### **Gestão de Usuários**
- ✅ Cadastro de usuários administrativos
- ✅ Controle de permissões por role
- ✅ Ativação/desativação de usuários
- ✅ Histórico de atividades

### **Sistema de Notificações**
- ✅ Envio automático de emails
- ✅ Templates de email configuráveis
- ✅ Notificações de expiração
- ✅ Configuração SMTP flexível

### **Relatórios e Auditoria**
- ✅ Logs detalhados de todas as ações
- ✅ Relatórios de certificados
- ✅ Estatísticas do sistema
- ✅ Exportação de dados

### **Configurações do Sistema**
- ✅ Configurações da empresa
- ✅ Configurações SMTP
- ✅ Templates de email
- ✅ Configurações de segurança

## 📋 Requisitos do Sistema

### **Requisitos Mínimos**
- **Servidor Web:** Apache 2.4+ ou Nginx 1.18+
- **PHP:** 8.2+ com extensões:
  - BCMath PHP Extension
  - Ctype PHP Extension
  - cURL PHP Extension
  - DOM PHP Extension
  - Fileinfo PHP Extension
  - JSON PHP Extension
  - Mbstring PHP Extension
  - OpenSSL PHP Extension
  - PCRE PHP Extension
  - PDO PHP Extension
  - Tokenizer PHP Extension
  - XML PHP Extension
- **Banco de Dados:** SQLite 3.0+ (padrão) ou MySQL 8.0+ / PostgreSQL 13+
- **Node.js:** 18.0+ e npm 9.0+
- **RAM:** 512MB mínimo
- **Espaço em Disco:** 1GB mínimo

### **Requisitos Recomendados**
- **Servidor Web:** Nginx 1.20+
- **PHP:** 8.3+ com OPcache habilitado
- **Banco de Dados:** MySQL 8.0+ ou PostgreSQL 15+
- **Node.js:** 20.0+ LTS
- **RAM:** 2GB ou mais
- **Espaço em Disco:** 5GB ou mais
- **SSL:** Certificado válido (produção)

## 🛠️ Instalação

### **Opção 1: Instalação Automática (Recomendado)**

#### Para VPS com Domínio e SSL:
```bash
curl -sSL https://raw.githubusercontent.com/Clegivaldo/sistema-certificados-laravel/main/install-vps.sh | bash
```

#### Para Localhost/Ubuntu Server:
```bash
curl -sSL https://raw.githubusercontent.com/Clegivaldo/sistema-certificados-laravel/main/install-localhost.sh | bash
```

### **Opção 2: Instalação Manual**

#### 1. Clone o repositório
```bash
git clone https://github.com/Clegivaldo/sistema-certificados-laravel.git
cd sistema-certificados-laravel
```

#### 2. Instale as dependências PHP
```bash
composer install --no-dev --optimize-autoloader
```

#### 3. Configure o ambiente
```bash
cp .env.example .env
php artisan key:generate
```

#### 4. Configure o banco de dados
Edite o arquivo `.env`:
```env
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite
```

#### 5. Execute as migrations e seeders
```bash
php artisan migrate --seed
```

#### 6. Instale as dependências Node.js
```bash
npm install
npm run build
```

#### 7. Configure as permissões
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 8. Inicie o servidor
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## 🔧 Configuração

### **Configuração Inicial**
1. Acesse `http://seu-dominio.com/login`
2. Use as credenciais padrão:
   - **Admin:** admin@metrologia.com / password
   - **Cliente:** cliente@teste.com / password

### **Configurações Importantes**

#### **SMTP para Emails**
1. Acesse **Configurações > SMTP**
2. Configure seu servidor SMTP
3. Teste o envio de emails

#### **Configurações da Empresa**
1. Acesse **Configurações > Empresa**
2. Preencha os dados da empresa
3. Salve as configurações

#### **Templates de Email**
1. Acesse **Configurações > Templates**
2. Personalize os templates de notificação
3. Use as variáveis disponíveis

## 📁 Estrutura do Projeto

```
sistema-certificados-laravel/
├── app/
│   ├── Console/Commands/     # Comandos Artisan
│   ├── Http/Controllers/     # Controllers da API
│   ├── Jobs/                 # Jobs para emails
│   ├── Models/               # Modelos Eloquent
│   └── Providers/            # Service Providers
├── database/
│   ├── migrations/           # Migrations do banco
│   └── seeders/              # Seeders com dados iniciais
├── resources/
│   └── js/                   # Frontend React
│       ├── components/       # Componentes React
│       ├── contexts/         # Contextos (Auth, etc.)
│       ├── pages/            # Páginas da aplicação
│       └── app.jsx           # Ponto de entrada
├── routes/
│   ├── api.php              # Rotas da API
│   └── web.php              # Rotas web
├── scripts/                  # Scripts de instalação
├── storage/                  # Arquivos e logs
└── public/                   # Arquivos públicos
```

## 🔐 Segurança

### **Medidas Implementadas**
- ✅ Autenticação via Sanctum
- ✅ Proteção contra força bruta
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Logs de auditoria
- ✅ Controle de acesso por role
- ✅ Tokens seguros

### **Recomendações de Segurança**
1. **Altere as senhas padrão** após a instalação
2. **Configure HTTPS** em produção
3. **Mantenha o sistema atualizado**
4. **Faça backups regulares**
5. **Monitore os logs de auditoria**

## 📊 Comandos Úteis

### **Manutenção**
```bash
# Limpar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Otimizar para produção
php artisan optimize
php artisan view:cache

# Verificar status
php artisan system:health
```

### **Backup e Restauração**
```bash
# Backup do banco
php artisan backup:run

# Restaurar backup
php artisan backup:restore backup-file.zip
```

### **Usuários e Senhas**
```bash
# Alterar senha de usuário
php artisan user:change-password

# Verificar usuários
php artisan user:check

# Testar login
php artisan user:test-login
```

### **Notificações**
```bash
# Enviar notificações de expiração
php artisan notifications:send-expiry

# Verificar tentativas de login
php artisan login:check-attempts

# Limpar tentativas antigas
php artisan login:clear-attempts
```

## 🚀 Deploy em Produção

### **Configuração do Servidor Web**

#### **Nginx (Recomendado)**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/sistema-certificados-laravel/public;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### **Apache**
```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    DocumentRoot /var/www/sistema-certificados-laravel/public
    
    <Directory /var/www/sistema-certificados-laravel/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

### **Configuração do Supervisor (Para Jobs)**
```ini
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
```

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **Erro 500 - Página em Branco**
```bash
# Verificar logs
tail -f storage/logs/laravel.log

# Verificar permissões
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### **Erro de Conexão com Banco**
```bash
# Verificar configuração
php artisan tinker --execute="echo 'Teste de conexão: '; try { DB::connection()->getPdo(); echo 'OK'; } catch(Exception \$e) { echo 'ERRO: ' . \$e->getMessage(); }"
```

#### **Problemas com Upload**
```bash
# Verificar permissões de upload
chmod -R 755 storage/app/public
chown -R www-data:www-data storage/app/public

# Verificar limite de upload no PHP
php -i | grep upload_max_filesize
```

#### **Problemas com Emails**
```bash
# Testar configuração SMTP
php artisan mail:test

# Verificar logs de email
tail -f storage/logs/laravel.log | grep mail
```

## 📞 Suporte

### **Canais de Suporte**
- **Issues:** [GitHub Issues](https://github.com/Clegivaldo/sistema-certificados-laravel/issues)
- **Documentação:** [Wiki do Projeto](https://github.com/Clegivaldo/sistema-certificados-laravel/wiki)
- **Email:** suporte@seudominio.com

### **Informações para Suporte**
Ao reportar problemas, inclua:
- Versão do PHP
- Versão do Laravel
- Sistema operacional
- Logs de erro
- Passos para reproduzir

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para facilitar a gestão de certificados de calibração**
