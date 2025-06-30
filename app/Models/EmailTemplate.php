<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'subject',
        'body',
        'is_active',
        'variables',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'variables' => 'array',
    ];

    /**
     * Obter template por tipo
     */
    public static function getByType($type)
    {
        return static::where('type', $type)->where('is_active', true)->first();
    }

    /**
     * Obter lista de variáveis disponíveis
     */
    public static function getAvailableVariables(): array
    {
        return [
            'client_name' => 'Nome da empresa do cliente',
            'client_email' => 'Email do cliente',
            'certificate_number' => 'Número do certificado',
            'equipment_name' => 'Nome do equipamento',
            'equipment_model' => 'Modelo do equipamento',
            'equipment_serial' => 'Número de série do equipamento',
            'calibration_date' => 'Data de calibração',
            'expiry_date' => 'Data de expiração',
            'next_calibration_date' => 'Próxima data de calibração',
            'calibration_company' => 'Empresa de calibração',
            'days_until_expiry' => 'Dias até a expiração',
            'system_url' => 'URL do sistema',
            'current_date' => 'Data atual',
        ];
    }
} 