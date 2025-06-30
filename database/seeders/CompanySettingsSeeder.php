<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CompanySetting;

class CompanySettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CompanySetting::create([
            'company_name' => 'Empresa de Calibração Ltda',
            'cnpj' => '00.000.000/0001-00',
            'email' => 'contato@empresa.com',
            'phone' => '(11) 99999-9999',
            'address' => 'Rua das Calibrações, 123',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01234-567',
            'website' => 'https://www.empresa.com',
            'description' => 'Empresa especializada em calibração de equipamentos de medição',
        ]);
    }
}
