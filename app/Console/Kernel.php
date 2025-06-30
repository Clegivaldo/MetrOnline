<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Enviar notificações de expiração diariamente às 8h
        $schedule->command('certificates:send-expiry-notifications')
                ->dailyAt('08:00')
                ->withoutOverlapping()
                ->runInBackground();

        // Limpar tentativas de login antigas semanalmente
        $schedule->call(function () {
            \App\Models\LoginAttempt::cleanup();
        })->weekly()->sundays()->at('02:00');

        // Backup automático diário às 3h
        $schedule->call(function () {
            // Implementar backup automático aqui
        })->dailyAt('03:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
} 