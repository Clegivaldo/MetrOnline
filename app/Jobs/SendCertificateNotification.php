<?php

namespace App\Jobs;

use App\Models\Certificate;
use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendCertificateNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $certificate;
    public $type;
    public $tries = 3;
    public $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(Certificate $certificate, string $type = 'created')
    {
        $this->certificate = $certificate;
        $this->type = $type;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('[SendCertificateNotification:INICIO]', ['certificado_id' => $this->certificate->id, 'type' => $this->type]);
        try {
            $client = $this->certificate->client;
            
            if (!$client || !$client->email) {
                Log::warning('[SendCertificateNotification:SEM_EMAIL]', ['certificado_id' => $this->certificate->id]);
                return;
            }

            Log::info('[SendCertificateNotification:BUSCANDO_TEMPLATE]', ['type' => $this->type]);
            // Buscar template de email
            $template = EmailTemplate::where('type', $this->type)->where('is_active', true)->first();
            
            if (!$template) {
                Log::warning('[SendCertificateNotification:TEMPLATE_NAO_ENCONTRADO]', ['type' => $this->type]);
                return;
            }
            Log::info('[SendCertificateNotification:TEMPLATE_OK]', ['template_id' => $template->id]);

            // Preparar dados para o template
            $data = $this->prepareTemplateData($template);

            Log::info('[SendCertificateNotification:ANTES_ENVIO_EMAIL]', ['to' => $client->email]);
            // Enviar email
            $body = $template->body;
            $subject = $template->subject;
            foreach ($data as $key => $value) {
                $body = str_replace([
                    '{{ $' . $key . ' }}',
                    '{{' . $key . '}}',
                    '{{ $' . $key . '}}',
                    '{{' . $key . ' }}',
                ], $value, $body);
                $subject = str_replace([
                    '{{ $' . $key . ' }}',
                    '{{' . $key . '}}',
                    '{{ $' . $key . '}}',
                    '{{' . $key . ' }}',
                ], $value, $subject);
            }
            Mail::send([], [], function ($message) use ($client, $template, $body, $subject) {
                $message->to($client->email, $client->company_name)
                        ->subject($subject)
                        ->html($body);

                // Anexar certificado se existir
                if ($this->certificate->file_path) {
                    $message->attach(storage_path('app/public/' . $this->certificate->file_path), [
                        'as' => $this->certificate->file_name,
                        'mime' => 'application/pdf',
                    ]);
                }
            });
            Log::info('[SendCertificateNotification:EMAIL_ENVIADO]', ['to' => $client->email]);

        } catch (\Exception $e) {
            Log::error('[SendCertificateNotification:ERRO]', ['exception' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    /**
     * Preparar dados para o template
     */
    private function prepareTemplateData($template): array
    {
        return [
            'client_name' => $this->certificate->client->company_name,
            'client_email' => $this->certificate->client->email,
            'certificate_number' => $this->certificate->certificate_number,
            'equipment_name' => $this->certificate->equipment_name,
            'equipment_model' => $this->certificate->equipment_model,
            'equipment_serial' => $this->certificate->equipment_serial,
            'calibration_date' => $this->certificate->calibration_date->format('d/m/Y'),
            'expiry_date' => $this->certificate->expiry_date->format('d/m/Y'),
            'next_calibration_date' => $this->certificate->next_calibration_date?->format('d/m/Y'),
            'calibration_company' => $this->certificate->calibration_company,
            'days_until_expiry' => $this->certificate->expiry_date->diffInDays(now()),
            'system_url' => config('app.url'),
            'current_date' => now()->format('d/m/Y'),
            'company_website' => optional(\App\Models\CompanySetting::first())->website ?? config('app.url'),
        ];
    }

    /**
     * Substituir variáveis no template
     */
    private function replaceVariables($content, $data): string
    {
        foreach ($data as $key => $value) {
            $content = str_replace('{{' . $key . '}}', $value, $content);
        }
        return $content;
    }
} 