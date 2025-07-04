<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class EmailTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\EmailTemplate::truncate();

        // Template para novo certificado
        \App\Models\EmailTemplate::updateOrCreate([
            'type' => 'certificate_created',
        ], [
            'name' => 'Certificado Criado',
            'subject' => 'Novo Certificado de Calibração - {{ $certificate_number }}',
            'body' => '
                <h2>Novo certificado de calibração</h2>
                <p>Olá {{ $client_name }},</p>
                <p>Um novo certificado foi cadastrado no sistema.</p>
                <ul>
                    <li><strong>Número do Certificado:</strong> {{ $certificate_number }}</li>
                    <li><strong>Equipamento:</strong> {{ $equipment_name }}</li>
                    <li><strong>Data de Calibração:</strong> {{ $calibration_date }}</li>
                    <li><strong>Data de Expiração:</strong> {{ $expiry_date }}</li>
                </ul><p>Acesse a plataforma para baixar o certificado.</p>
                <p>{{ $company_website }}</p>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>',
            'is_active' => true,
        ]);
        // Template para certificado editado
        \App\Models\EmailTemplate::updateOrCreate([
            'type' => 'certificate_updated',
        ], [
            'name' => 'Certificado Editado',
            'subject' => 'Certificado Atualizado - {{ $certificate_number }}',
            'body' => '
                <h2>Certificado atualizado</h2>
                <p>Olá {{ $client_name }},</p><p>Um certificado foi atualizado no sistema.</p>
                <ul>
                    <li><strong>Número do Certificado:</strong> {{ $certificate_number }}</li>
                    <li><strong>Equipamento:</strong> {{ $equipment_name }}</li>
                    <li><strong>Data de Calibração:</strong> {{ $calibration_date }}</li>
                    <li><strong>Data de Expiração:</strong> {{ $expiry_date }}</li>
                </ul><p>Acesse a plataforma para baixar o certificado.</p>
                <p>{{ $company_website }}</p>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>',
            'is_active' => true,
        ]);
        // Template para certificado expirando
        \App\Models\EmailTemplate::updateOrCreate([
            'type' => 'certificate_expiring',
        ], [
            'name' => 'Certificado Expirando',
            'subject' => 'Certificado Expirando em Breve - {{ $certificate_number }}',
            'body' => '
                <h2>Certificado expirando</h2>
                <p>Olá {{ $client_name }},</p>
                <p>O certificado {{ $certificate_number }} está prestes a expirar.</p>
                <ul>
                    <li><strong>Equipamento:</strong> {{ $equipment_name }}</li>
                    <li><strong>Data de Expiração:</strong> {{ $expiry_date }}</li>
                    <li><strong>Dias até expirar:</strong> {{ $days_until_expiry }}</li>
                </ul><p>Renove o certificado para manter a conformidade.</p>
                <p>{{ $company_website }}</p>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>',
            'is_active' => true,
        ]);
        // Template para certificado expirado
        \App\Models\EmailTemplate::updateOrCreate([
            'type' => 'certificate_expired',
        ], [
            'name' => 'Certificado Expirado',
            'subject' => 'Certificado Expirado - {{ $certificate_number }}',
            'body' => '
                <h2>Certificado expirado</h2>
                <p>Olá {{ $client_name }},</p>
                <p>O certificado {{ $certificate_number }} expirou.</p>
                <ul>
                    <li><strong>Equipamento:</strong> {{ $equipment_name }}</li>
                    <li><strong>Data de Expiração:</strong> {{ $expiry_date }}</li>
                </ul><p>Renove o certificado para manter a conformidade.</p>
                <p>{{ $company_website }}</p>
                <p>Atenciosamente,<br>Sistema de Metrologia</p>',
            'is_active' => true,
        ]);
    }
}
