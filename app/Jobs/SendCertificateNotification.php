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
        try {
            $client = $this->certificate->client;
            
            if (!$client || !$client->email) {
                Log::warning('Cliente não encontrado ou sem email para certificado: ' . $this->certificate->id);
                return;
            }

            // Buscar template de email
            $template = EmailTemplate::where('type', $this->type)->first();
            
            if (!$template) {
                Log::warning('Template de email não encontrado para tipo: ' . $this->type);
                return;
            }

            // Preparar dados para o template
            $data = $this->prepareTemplateData($template);

            // Enviar email
            Mail::send([], [], function ($message) use ($client, $template, $data) {
                $message->to($client->email, $client->company_name)
                        ->subject($this->replaceVariables($template->subject, $data))
                        ->html($this->replaceVariables($template->body, $data));

                // Anexar certificado se existir
                if ($this->certificate->file_path && file_exists(storage_path('app/public/' . $this->certificate->file_path))) {
                    $message->attach(storage_path('app/public/' . $this->certificate->file_path), [
                        'as' => $this->certificate->file_name ?? 'certificado.pdf'
                    ]);
                }
            });

            Log::info('Email enviado com sucesso para: ' . $client->email);

        } catch (\Exception $e) {
            Log::error('Erro ao enviar email de certificado: ' . $e->getMessage());
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