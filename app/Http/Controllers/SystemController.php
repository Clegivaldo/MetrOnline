<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\EmailTemplate;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class SystemController extends Controller
{
    /**
     * Obter configurações do sistema
     */
    public function getSettings(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        return response()->json([
            'email' => SystemSetting::getEmailSettings(),
            'security' => SystemSetting::getSecuritySettings(),
            'notification' => SystemSetting::getNotificationSettings(),
        ]);
    }

    /**
     * Atualizar configurações do sistema
     */
    public function updateSettings(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        try {
            // Validação mais flexível
            $request->validate([
                'email.smtp_host' => 'nullable|string',
                'email.smtp_port' => 'nullable|integer|min:1|max:65535',
                'email.smtp_username' => 'nullable|string',
                'email.smtp_password' => 'nullable|string',
                'email.smtp_encryption' => 'nullable|in:tls,ssl',
                'email.from_email' => 'nullable|email',
                'email.from_name' => 'nullable|string',
                'security.max_login_attempts_ip' => 'nullable|integer|min:1|max:20',
                'security.max_login_attempts_email' => 'nullable|integer|min:1|max:10',
                'security.block_duration_ip' => 'nullable|integer|min:1|max:60',
                'security.block_duration_email' => 'nullable|integer|min:1|max:120',
                'security.session_timeout' => 'nullable|integer|min:30|max:480',
                'notification.expiry_notification_days' => 'nullable|array',
                'notification.auto_send_emails' => 'nullable|boolean',
                'notification.notification_email' => 'nullable|email',
            ]);

            // Atualizar configurações de email
            if ($request->has('email') && is_array($request->email)) {
                foreach ($request->email as $key => $value) {
                    if ($value !== null && $value !== '') {
                        SystemSetting::set($key, $value, 'string', "Configuração SMTP: {$key}");
                    }
                }
            }

            // Atualizar configurações de segurança
            if ($request->has('security') && is_array($request->security)) {
                foreach ($request->security as $key => $value) {
                    if ($value !== null && $value !== '') {
                        SystemSetting::set($key, $value, 'integer', "Configuração de segurança: {$key}");
                    }
                }
            }

            // Atualizar configurações de notificação
            if ($request->has('notification') && is_array($request->notification)) {
                foreach ($request->notification as $key => $value) {
                    if ($value !== null && $value !== '') {
                        $type = $key === 'auto_send_emails' ? 'boolean' : 'string';
                        SystemSetting::set($key, $value, $type, "Configuração de notificação: {$key}");
                    }
                }
            }

            // Log de auditoria
            AuditLog::create([
                'action' => 'Configurações do sistema atualizadas',
                'user_email' => $request->user()->email,
                'user_role' => $request->user()->role,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(['message' => 'Configurações atualizadas com sucesso']);

        } catch (\Exception $e) {
            \Log::error('Erro ao atualizar configurações: ' . $e->getMessage());
            return response()->json(['error' => 'Erro interno do servidor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Testar configuração de email
     */
    public function testEmail(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $request->validate([
            'test_email' => 'required|email',
        ]);

        try {
            // Configurar email temporariamente
            $emailSettings = SystemSetting::getEmailSettings();
            
            Config::set('mail.mailers.smtp.host', $emailSettings['smtp_host']);
            Config::set('mail.mailers.smtp.port', $emailSettings['smtp_port']);
            Config::set('mail.mailers.smtp.username', $emailSettings['smtp_username']);
            Config::set('mail.mailers.smtp.password', $emailSettings['smtp_password']);
            Config::set('mail.mailers.smtp.encryption', $emailSettings['smtp_encryption']);
            Config::set('mail.from.address', $emailSettings['from_email']);
            Config::set('mail.from.name', $emailSettings['from_name']);

            // Enviar email de teste
            Mail::send([], [], function ($message) use ($request, $emailSettings) {
                $message->to($request->test_email)
                        ->subject('Teste de Configuração - Sistema de Metrologia')
                        ->html("
                            <h2>Teste de Configuração</h2>
                            <p>Este é um email de teste para verificar se as configurações SMTP estão funcionando corretamente.</p>
                            <p><strong>Configurações utilizadas:</strong></p>
                            <ul>
                                <li>Host: {$emailSettings['smtp_host']}</li>
                                <li>Porta: {$emailSettings['smtp_port']}</li>
                                <li>Usuário: {$emailSettings['smtp_username']}</li>
                                <li>Criptografia: {$emailSettings['smtp_encryption']}</li>
                            </ul>
                            <p>Se você recebeu este email, as configurações estão funcionando corretamente!</p>
                        ");
            });

            return response()->json(['message' => 'Email de teste enviado com sucesso']);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao enviar email de teste: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get email templates
     */
    public function getEmailTemplates()
    {
        $templates = EmailTemplate::all();
        
        return response()->json($templates);
    }

    /**
     * Atualizar template de email
     */
    public function updateEmailTemplate(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        try {
            $request->validate([
                'name' => 'nullable|string|max:255',
                'subject' => 'nullable|string|max:255',
                'body' => 'nullable|string',
                'is_active' => 'nullable|boolean',
            ]);

            $template = EmailTemplate::findOrFail($id);
            
            // Atualizar apenas os campos fornecidos
            $updateData = [];
            if ($request->has('name') && $request->name !== null) $updateData['name'] = $request->name;
            if ($request->has('subject') && $request->subject !== null) $updateData['subject'] = $request->subject;
            if ($request->has('body') && $request->body !== null) $updateData['body'] = $request->body;
            if ($request->has('is_active') && $request->is_active !== null) $updateData['is_active'] = $request->is_active;
            
            if (!empty($updateData)) {
                $template->update($updateData);
            }

            // Log de auditoria
            AuditLog::create([
                'action' => 'Template de email atualizado',
                'user_email' => $request->user()->email,
                'user_role' => $request->user()->role,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(['message' => 'Template atualizado com sucesso']);

        } catch (\Exception $e) {
            \Log::error('Erro ao atualizar template: ' . $e->getMessage());
            return response()->json(['error' => 'Erro interno do servidor: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Obter estatísticas do sistema
     */
    public function getSystemStats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $stats = [
            'total_users' => \App\Models\User::count(),
            'total_clients' => \App\Models\Client::count(),
            'total_certificates' => \App\Models\Certificate::count(),
            'expiring_certificates' => \App\Models\Certificate::expiringIn(30)->count(),
            'expired_certificates' => \App\Models\Certificate::expired()->count(),
            'total_audit_logs' => \App\Models\AuditLog::count(),
            'failed_login_attempts' => \App\Models\LoginAttempt::where('success', false)->count(),
            'disk_usage' => $this->getDiskUsage(),
            'system_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'database_driver' => config('database.default'),
                'queue_driver' => config('queue.default'),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Obter uso do disco
     */
    private function getDiskUsage(): array
    {
        $storagePath = storage_path();
        $totalSpace = disk_total_space($storagePath);
        $freeSpace = disk_free_space($storagePath);
        $usedSpace = $totalSpace - $freeSpace;

        return [
            'total' => $this->formatBytes($totalSpace),
            'used' => $this->formatBytes($usedSpace),
            'free' => $this->formatBytes($freeSpace),
            'percentage' => round(($usedSpace / $totalSpace) * 100, 2),
        ];
    }

    /**
     * Formatar bytes
     */
    private function formatBytes($bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
