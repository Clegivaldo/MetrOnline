<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    protected $casts = [
        'value' => 'json',
    ];

    /**
     * Obter valor de uma configuração
     */
    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Definir valor de uma configuração
     */
    public static function set($key, $value, $type = 'string', $description = null): void
    {
        try {
            static::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => $type,
                    'description' => $description,
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Erro ao salvar configuração: ' . $e->getMessage(), [
                'key' => $key,
                'value' => $value,
                'type' => $type
            ]);
            throw $e;
        }
    }

    /**
     * Obter configurações de email
     */
    public static function getEmailSettings(): array
    {
        return [
            'smtp_host' => static::get('smtp_host', ''),
            'smtp_port' => static::get('smtp_port', 587),
            'smtp_username' => static::get('smtp_username', ''),
            'smtp_password' => static::get('smtp_password', ''),
            'smtp_encryption' => static::get('smtp_encryption', 'tls'),
            'from_email' => static::get('from_email', ''),
            'from_name' => static::get('from_name', ''),
        ];
    }

    /**
     * Obter configurações de segurança
     */
    public static function getSecuritySettings(): array
    {
        return [
            'max_login_attempts_ip' => static::get('max_login_attempts_ip', 5),
            'max_login_attempts_email' => static::get('max_login_attempts_email', 3),
            'block_duration_ip' => static::get('block_duration_ip', 15),
            'block_duration_email' => static::get('block_duration_email', 30),
            'session_timeout' => static::get('session_timeout', 120),
        ];
    }

    /**
     * Obter configurações de notificação
     */
    public static function getNotificationSettings(): array
    {
        return [
            'expiry_notification_days' => static::get('expiry_notification_days', [30, 15, 7, 1]),
            'auto_send_emails' => static::get('auto_send_emails', true),
            'notification_email' => static::get('notification_email', ''),
        ];
    }
} 