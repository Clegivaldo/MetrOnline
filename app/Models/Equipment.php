<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'identification',
        'manufacturer',
        'model',
        'serial_number',
        'location',
        'status', // em_uso, em_calibracao, em_manutencao, fora_de_servico
        'last_calibration_at',
        'next_calibration_at',
        'last_maintenance_at',
        'unique_code',
        'certificate_id',
        'notes',
    ];

    protected $dates = [
        'last_calibration_at',
        'next_calibration_at',
        'last_maintenance_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    public function certificate()
    {
        return $this->belongsTo(Certificate::class);
    }

    public function calibrations()
    {
        return $this->hasMany(Calibration::class);
    }

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }
} 