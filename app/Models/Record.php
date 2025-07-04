<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Record extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type', // Ex: dados_brutos, resultado_calibracao, certificado, relatorio
        'title',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'created_by',
        'related_equipment_id',
        'related_certificate_id',
        'integrity_hash',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // public function equipment()
    // {
    //     return $this->belongsTo(Equipment::class, 'related_equipment_id');
    // }

    public function certificate()
    {
        return $this->belongsTo(Certificate::class, 'related_certificate_id');
    }
} 