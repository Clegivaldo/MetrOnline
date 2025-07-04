<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class NonConformity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type', // interna, externa
        'category',
        'description',
        'root_cause',
        'corrective_action',
        'preventive_action',
        'effectiveness_verification',
        'status', // aberta, em_andamento, encerrada
        'opened_by',
        'closed_by',
        'closed_at',
        'notes',
    ];

    protected $dates = [
        'closed_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    public function opener()
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function closer()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }
} 