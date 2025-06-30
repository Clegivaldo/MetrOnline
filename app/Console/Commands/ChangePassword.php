<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ChangePassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:change-password {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Change user password';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Usuário com email {$email} não encontrado!");
            return;
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info("Senha alterada com sucesso para o usuário {$user->name}!");
    }
}
