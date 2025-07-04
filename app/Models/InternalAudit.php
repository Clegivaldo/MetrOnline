<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class InternalAudit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'planned_at',
        'executed_at',
        'auditor_id',
        'status', // planejada, em_execucao, concluida
        'findings',
        'actions',
        'effectiveness_verification',
        'notes',
    ];

    protected $dates = [
        'planned_at',
        'executed_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    public function auditor()
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }
} 