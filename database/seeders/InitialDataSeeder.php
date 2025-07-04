<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Criar usuário administrador
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@metrologia.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Criar usuário padrão
        User::create([
            'name' => 'Usuário Teste',
            'email' => 'user@metrologia.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
        ]);

        // Criar cliente de exemplo
        Client::create([
            'cnpj' => '12345678000190',
            'company_name' => 'Empresa Exemplo Ltda',
            'email' => 'cliente@exemplo.com',
            'password' => Hash::make('123456'),
            'phone' => '(11) 99999-9999',
            'city' => 'São Paulo',
            'state' => 'SP',
        ]);

        // Criar categorias de documentos iniciais
        \App\Models\DocumentCategory::insert([
            [
                'name' => 'Procedimentos',
                'code' => 'PROC',
                'description' => 'Procedimentos operacionais',
                'is_active' => true,
            ],
            [
                'name' => 'Instruções de Trabalho',
                'code' => 'INST',
                'description' => 'Instruções detalhadas de trabalho',
                'is_active' => true,
            ],
            [
                'name' => 'Formulários',
                'code' => 'FORM',
                'description' => 'Formulários e registros',
                'is_active' => true,
            ],
        ]);
    }
}
