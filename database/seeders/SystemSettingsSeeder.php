<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemSetting;
use App\Models\EmailTemplate;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Configurações de email
        SystemSetting::set('smtp_host', 'smtp.gmail.com', 'string', 'Host do servidor SMTP');
        SystemSetting::set('smtp_port', 587, 'integer', 'Porta do servidor SMTP');
        SystemSetting::set('smtp_username', '', 'string', 'Usuário SMTP');
        SystemSetting::set('smtp_password', '', 'string', 'Senha SMTP');
        SystemSetting::set('smtp_encryption', 'tls', 'string', 'Tipo de criptografia SMTP');
        SystemSetting::set('from_email', 'noreply@metrologia.com', 'string', 'Email remetente');
        SystemSetting::set('from_name', 'Sistema de Metrologia', 'string', 'Nome remetente');

        // Configurações de segurança
        SystemSetting::set('max_login_attempts_ip', 3, 'integer', 'Máximo de tentativas de login por IP');
        SystemSetting::set('max_login_attempts_email', 3, 'integer', 'Máximo de tentativas de login por email');
        SystemSetting::set('block_duration_ip', 30, 'integer', 'Duração do bloqueio por IP (minutos)');
        SystemSetting::set('block_duration_email', 30, 'integer', 'Duração do bloqueio por email (minutos)');
        SystemSetting::set('session_timeout', 60, 'integer', 'Timeout da sessão (minutos)');

        // Configurações de notificação
        SystemSetting::set('expiry_notification_days', [30, 15, 7, 1], 'array', 'Dias para notificação de expiração');
        SystemSetting::set('auto_send_emails', true, 'boolean', 'Envio automático de emails');
        SystemSetting::set('notification_email', '', 'string', 'Email para notificações do sistema');
    }
} 