<?php

namespace App\Console\Commands;

use App\Models\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateTestClient extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'client:create-test {--email=cliente@teste.com : Email do cliente} {--password=password : Senha do cliente}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Criar um cliente de teste';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');

        // Verificar se o cliente já existe
        $existingClient = Client::where('email', $email)->first();
        if ($existingClient) {
            $this->warn("Cliente com email {$email} já existe!");
            $this->info("Dados do cliente:");
            $this->line("ID: {$existingClient->id}");
            $this->line("Nome: {$existingClient->company_name}");
            $this->line("CNPJ: {$existingClient->cnpj}");
            $this->line("Email: {$existingClient->email}");
            return;
        }

        // Criar cliente de teste
        $client = Client::create([
            'cnpj' => '12345678000199',
            'company_name' => 'Empresa Teste Ltda',
            'email' => $email,
            'password' => Hash::make($password),
            'phone' => '(11) 99999-9999',
            'address' => 'Rua Teste, 123',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01234-567',
        ]);

        $this->info("Cliente de teste criado com sucesso!");
        $this->line("ID: {$client->id}");
        $this->line("Nome: {$client->company_name}");
        $this->line("CNPJ: {$client->cnpj}");
        $this->line("Email: {$client->email}");
        $this->line("Senha: {$password}");
        
        $this->info("\nVocê pode fazer login com:");
        $this->line("Email: {$email}");
        $this->line("Senha: {$password}");
    }
}
