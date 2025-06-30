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
        SystemSetting::set('max_login_attempts_ip', 5, 'integer', 'Máximo de tentativas de login por IP');
        SystemSetting::set('max_login_attempts_email', 3, 'integer', 'Máximo de tentativas de login por email');
        SystemSetting::set('block_duration_ip', 15, 'integer', 'Duração do bloqueio por IP (minutos)');
        SystemSetting::set('block_duration_email', 30, 'integer', 'Duração do bloqueio por email (minutos)');
        SystemSetting::set('session_timeout', 120, 'integer', 'Timeout da sessão (minutos)');

        // Configurações de notificação
        SystemSetting::set('expiry_notification_days', [30, 15, 7, 1], 'array', 'Dias para notificação de expiração');
        SystemSetting::set('auto_send_emails', true, 'boolean', 'Envio automático de emails');
        SystemSetting::set('notification_email', '', 'string', 'Email para notificações do sistema');

        // Templates de email
        EmailTemplate::create([
            'name' => 'Certificado Criado',
            'type' => 'created',
            'subject' => 'Novo Certificado de Calibração - {{certificate_number}}',
            'body' => '
                <h2>Novo Certificado de Calibração</h2>
                <p>Olá {{client_name}},</p>
                <p>Um novo certificado de calibração foi cadastrado no sistema:</p>
                <ul>
                    <li><strong>Número do Certificado:</strong> {{certificate_number}}</li>
                    <li><strong>Equipamento:</strong> {{equipment_name}}</li>
                    <li><strong>Modelo:</strong> {{equipment_model}}</li>
                    <li><strong>Número de Série:</strong> {{equipment_serial}}</li>
                    <li><strong>Data de Calibração:</strong> {{calibration_date}}</li>
                    <li><strong>Data de Expiração:</strong> {{expiry_date}}</li>
                    <li><strong>Empresa de Calibração:</strong> {{calibration_company}}</li>
                </ul>
                <p>O certificado está anexado a este email.</p>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>
            ',
            'is_active' => true,
        ]);

        EmailTemplate::create([
            'name' => 'Certificado Atualizado',
            'type' => 'updated',
            'subject' => 'Certificado Atualizado - {{certificate_number}}',
            'body' => '
                <h2>Certificado de Calibração Atualizado</h2>
                <p>Olá {{client_name}},</p>
                <p>Um certificado de calibração foi atualizado no sistema:</p>
                <ul>
                    <li><strong>Número do Certificado:</strong> {{certificate_number}}</li>
                    <li><strong>Equipamento:</strong> {{equipment_name}}</li>
                    <li><strong>Modelo:</strong> {{equipment_model}}</li>
                    <li><strong>Número de Série:</strong> {{equipment_serial}}</li>
                    <li><strong>Data de Calibração:</strong> {{calibration_date}}</li>
                    <li><strong>Data de Expiração:</strong> {{expiry_date}}</li>
                    <li><strong>Empresa de Calibração:</strong> {{calibration_company}}</li>
                </ul>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>
            ',
            'is_active' => true,
        ]);

        EmailTemplate::create([
            'name' => 'Certificado Expirando',
            'type' => 'expiring',
            'subject' => 'ALERTA: Certificado Expirando - {{certificate_number}}',
            'body' => '
                <h2>ALERTA: Certificado Expirando</h2>
                <p>Olá {{client_name}},</p>
                <p><strong>ATENÇÃO:</strong> O certificado de calibração abaixo irá expirar em {{days_until_expiry}} dias:</p>
                <ul>
                    <li><strong>Número do Certificado:</strong> {{certificate_number}}</li>
                    <li><strong>Equipamento:</strong> {{equipment_name}}</li>
                    <li><strong>Modelo:</strong> {{equipment_model}}</li>
                    <li><strong>Número de Série:</strong> {{equipment_serial}}</li>
                    <li><strong>Data de Expiração:</strong> {{expiry_date}}</li>
                    <li><strong>Empresa de Calibração:</strong> {{calibration_company}}</li>
                </ul>
                <p><strong>Recomendamos agendar a nova calibração o quanto antes.</strong></p>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>
            ',
            'is_active' => true,
        ]);

        EmailTemplate::create([
            'name' => 'Certificado Expirado',
            'type' => 'expired',
            'subject' => 'URGENTE: Certificado Expirado - {{certificate_number}}',
            'body' => '
                <h2>URGENTE: Certificado Expirado</h2>
                <p>Olá {{client_name}},</p>
                <p><strong>URGENTE:</strong> O certificado de calibração abaixo expirou:</p>
                <ul>
                    <li><strong>Número do Certificado:</strong> {{certificate_number}}</li>
                    <li><strong>Equipamento:</strong> {{equipment_name}}</li>
                    <li><strong>Modelo:</strong> {{equipment_model}}</li>
                    <li><strong>Número de Série:</strong> {{equipment_serial}}</li>
                    <li><strong>Data de Expiração:</strong> {{expiry_date}}</li>
                    <li><strong>Empresa de Calibração:</strong> {{calibration_company}}</li>
                </ul>
                <p><strong>É necessário agendar a nova calibração IMEDIATAMENTE.</strong></p>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>
            ',
            'is_active' => true,
        ]);
    }
} 