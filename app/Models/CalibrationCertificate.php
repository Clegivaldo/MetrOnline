<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalibrationCertificate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'equipment_id',
        'certificate_number',
        'issued_at',
        'valid_until',
        'laboratory',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'notes',
    ];

    protected $dates = [
        'issued_at',
        'valid_until',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }
} 