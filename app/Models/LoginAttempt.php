<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'ip_address',
        'user_agent',
        'success',
        'reason',
        'attempted_at',
    ];

    protected $casts = [
        'success' => 'boolean',
        'attempted_at' => 'datetime',
    ];

    /**
     * Verificar se o IP está bloqueado
     */
    public static function isIpBlocked($ip, $maxAttempts = 5, $blockDuration = 15): bool
    {
        $recentAttempts = static::where('ip_address', $ip)
            ->where('success', false)
            ->where('attempted_at', '>=', now()->subMinutes($blockDuration))
            ->count();

        return $recentAttempts >= $maxAttempts;
    }

    /**
     * Verificar se o email está bloqueado
     */
    public static function isEmailBlocked($email, $maxAttempts = 3, $blockDuration = 30): bool
    {
        $recentAttempts = static::where('email', $email)
            ->where('success', false)
            ->where('attempted_at', '>=', now()->subMinutes($blockDuration))
            ->count();

        return $recentAttempts >= $maxAttempts;
    }

    /**
     * Registrar tentativa de login
     */
    public static function record($email, $ip, $userAgent, $success = false): void
    {
        static::create([
            'email' => $email,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'success' => $success,
            'attempted_at' => now(),
        ]);
    }

    /**
     * Limpar tentativas antigas
     */
    public static function cleanup(): void
    {
        static::where('attempted_at', '<', now()->subDays(7))->delete();
    }
} 