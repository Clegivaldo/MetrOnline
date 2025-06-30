<?php

namespace App\Console\Commands;

use App\Models\LoginAttempt;
use Illuminate\Console\Command;

class CheckLoginAttempts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'login:check {--clear : Limpar todas as tentativas} {--ip= : Verificar IP específico} {--email= : Verificar email específico}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar e gerenciar tentativas de login';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $clear = $this->option('clear');
        $ip = $this->option('ip');
        $email = $this->option('email');

        if ($clear) {
            $this->clearAllAttempts();
            return;
        }

        if ($ip) {
            $this->checkIpAttempts($ip);
            return;
        }

        if ($email) {
            $this->checkEmailAttempts($email);
            return;
        }

        $this->showAllAttempts();
    }

    private function clearAllAttempts()
    {
        $count = LoginAttempt::count();
        LoginAttempt::truncate();
        $this->info("Todas as {$count} tentativas de login foram removidas!");
    }

    private function checkIpAttempts($ip)
    {
        $attempts = LoginAttempt::where('ip_address', $ip)
            ->orderBy('created_at', 'desc')
            ->get();

        $this->info("Tentativas para IP: {$ip}");
        $this->table(
            ['Email', 'Sucesso', 'Motivo', 'Data'],
            $attempts->map(function ($attempt) {
                return [
                    $attempt->email,
                    $attempt->success ? 'Sim' : 'Não',
                    $attempt->reason ?? 'N/A',
                    $attempt->created_at->format('d/m/Y H:i:s')
                ];
            })
        );

        $failedCount = $attempts->where('success', false)->count();
        $this->warn("Total de tentativas falhadas: {$failedCount}");
    }

    private function checkEmailAttempts($email)
    {
        $attempts = LoginAttempt::where('email', $email)
            ->orderBy('created_at', 'desc')
            ->get();

        $this->info("Tentativas para email: {$email}");
        $this->table(
            ['IP', 'Sucesso', 'Motivo', 'Data'],
            $attempts->map(function ($attempt) {
                return [
                    $attempt->ip_address,
                    $attempt->success ? 'Sim' : 'Não',
                    $attempt->reason ?? 'N/A',
                    $attempt->created_at->format('d/m/Y H:i:s')
                ];
            })
        );

        $failedCount = $attempts->where('success', false)->count();
        $this->warn("Total de tentativas falhadas: {$failedCount}");
    }

    private function showAllAttempts()
    {
        $attempts = LoginAttempt::orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $this->info("Últimas 20 tentativas de login:");
        $this->table(
            ['Email', 'IP', 'Sucesso', 'Motivo', 'Data'],
            $attempts->map(function ($attempt) {
                return [
                    $attempt->email,
                    $attempt->ip_address,
                    $attempt->success ? 'Sim' : 'Não',
                    $attempt->reason ?? 'N/A',
                    $attempt->created_at->format('d/m/Y H:i:s')
                ];
            })
        );

        $totalFailed = LoginAttempt::where('success', false)->count();
        $totalSuccess = LoginAttempt::where('success', true)->count();
        
        $this->info("Estatísticas:");
        $this->line("Total de tentativas falhadas: {$totalFailed}");
        $this->line("Total de tentativas bem-sucedidas: {$totalSuccess}");
    }
}
