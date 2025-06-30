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

        EmailTemplate::create([
            'name' => 'Notificação de Certificado Expirando',
            'type' => 'expiring',
            'subject' => 'Certificado Expirando - {{company_name}}',
            'body' => '
                <h2>Certificado Expirando</h2>
                <p>Olá {{client_name}},</p>
                <p>O certificado do equipamento <strong>{{equipment_name}}</strong> irá expirar em {{days_until_expiry}} dias.</p>
                <p><strong>Detalhes do Certificado:</strong></p>
                <ul>
                    <li>Número: {{certificate_number}}</li>
                    <li>Equipamento: {{equipment_name}}</li>
                    <li>Data de Calibração: {{calibration_date}}</li>
                    <li>Data de Expiração: {{expiry_date}}</li>
                </ul>
                <p>Entre em contato conosco para agendar uma nova calibração.</p>
                <p>Atenciosamente,<br>{{company_name}}</p>
            ',
            'is_active' => true,
        ]);

        EmailTemplate::create([
            'name' => 'Certificado Criado',
            'type' => 'created',
            'subject' => 'Novo Certificado Criado - {{company_name}}',
            'body' => '
                <h2>Certificado Criado</h2>
                <p>Olá {{client_name}},</p>
                <p>Um novo certificado foi criado para o equipamento <strong>{{equipment_name}}</strong>.</p>
                <p><strong>Detalhes do Certificado:</strong></p>
                <ul>
                    <li>Número: {{certificate_number}}</li>
                    <li>Equipamento: {{equipment_name}}</li>
                    <li>Data de Calibração: {{calibration_date}}</li>
                    <li>Data de Expiração: {{expiry_date}}</li>
                </ul>
                <p>Atenciosamente,<br>{{company_name}}</p>
            ',
            'is_active' => true,
        ]);

        EmailTemplate::create([
            'name' => 'Certificado Atualizado',
            'type' => 'updated',
            'subject' => 'Certificado Atualizado - {{company_name}}',
            'body' => '
                <h2>Certificado Atualizado</h2>
                <p>Olá {{client_name}},</p>
                <p>O certificado do equipamento <strong>{{equipment_name}}</strong> foi atualizado.</p>
                <p><strong>Detalhes do Certificado:</strong></p>
                <ul>
                    <li>Número: {{certificate_number}}</li>
                    <li>Equipamento: {{equipment_name}}</li>
                    <li>Data de Calibração: {{calibration_date}}</li>
                    <li>Data de Expiração: {{expiry_date}}</li>
                </ul>
                <p>Atenciosamente,<br>{{company_name}}</p>
            ',
            'is_active' => true,
        ]);
    }
}
