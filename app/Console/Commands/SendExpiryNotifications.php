<?php

namespace App\Console\Commands;

use App\Models\Certificate;
use App\Models\SystemSetting;
use App\Jobs\SendCertificateNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendExpiryNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:send-expiry-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enviar notificações de certificados próximos ao vencimento';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando envio de notificações de expiração...');

        // Obter configurações
        $notificationDays = SystemSetting::get('expiry_notification_days', [30, 15, 7, 1]);
        $autoSendEmails = SystemSetting::get('auto_send_emails', true);

        if (!$autoSendEmails) {
            $this->warn('Envio automático de emails está desabilitado.');
            return;
        }

        $totalSent = 0;

        foreach ($notificationDays as $days) {
            $this->info("Verificando certificados que expiram em {$days} dias...");

            $certificates = Certificate::with('client')
                ->where('expiry_date', '=', now()->addDays($days)->startOfDay())
                ->get();

            foreach ($certificates as $certificate) {
                if ($certificate->client && $certificate->client->email) {
                    try {
                        SendCertificateNotification::dispatch($certificate, 'expiring');
                        $totalSent++;
                        
                        $this->line("Email enviado para {$certificate->client->email} - Certificado: {$certificate->certificate_number}");
                        
                        Log::info("Notificação de expiração enviada", [
                            'certificate_id' => $certificate->id,
                            'client_email' => $certificate->client->email,
                            'days_until_expiry' => $days,
                        ]);
                    } catch (\Exception $e) {
                        $this->error("Erro ao enviar email para {$certificate->client->email}: " . $e->getMessage());
                        Log::error("Erro ao enviar notificação de expiração", [
                            'certificate_id' => $certificate->id,
                            'client_email' => $certificate->client->email,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }
        }

        // Verificar certificados expirados
        $this->info('Verificando certificados expirados...');
        $expiredCertificates = Certificate::with('client')
            ->where('expiry_date', '<', now())
            ->where('expiry_date', '>=', now()->subDays(1)) // Apenas os que expiraram hoje
            ->get();

        foreach ($expiredCertificates as $certificate) {
            if ($certificate->client && $certificate->client->email) {
                try {
                    SendCertificateNotification::dispatch($certificate, 'expired');
                    $totalSent++;
                    
                    $this->line("Email de expiração enviado para {$certificate->client->email} - Certificado: {$certificate->certificate_number}");
                    
                    Log::info("Notificação de certificado expirado enviada", [
                        'certificate_id' => $certificate->id,
                        'client_email' => $certificate->client->email,
                    ]);
                } catch (\Exception $e) {
                    $this->error("Erro ao enviar email de expiração para {$certificate->client->email}: " . $e->getMessage());
                    Log::error("Erro ao enviar notificação de certificado expirado", [
                        'certificate_id' => $certificate->id,
                        'client_email' => $certificate->client->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        $this->info("Processo concluído. Total de emails enviados: {$totalSent}");
        
        // Limpar tentativas de login antigas
        \App\Models\LoginAttempt::cleanup();
        $this->info('Tentativas de login antigas removidas.');
    }
}
