<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class TestLogin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:login {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test login directly';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        // Tentar como usuário
        $user = User::where('email', $email)->first();
        if ($user && Hash::check($password, $user->password)) {
            $this->info("Login bem-sucedido para {$user->name}!");
            $this->line("Email: {$user->email}");
            $this->line("Role: {$user->role}");
            return;
        }

        // Tentar como cliente
        $client = Client::where('email', $email)->first();
        if ($client && Hash::check($password, $client->password)) {
            $this->info("Login bem-sucedido para {$client->company_name}!");
            $this->line("Email: {$client->email}");
            $this->line("Role: client");
            $this->line("CNPJ: {$client->cnpj}");
            return;
        }

        // Se chegou aqui, não encontrou ou senha incorreta
        if ($user) {
            $this->error("Senha incorreta para {$user->name}!");
        } elseif ($client) {
            $this->error("Senha incorreta para {$client->company_name}!");
        } else {
            $this->error("Usuário ou cliente com email {$email} não encontrado!");
        }
    }
}
