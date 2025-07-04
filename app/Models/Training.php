<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Training extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'planned_at',
        'executed_at',
        'effectiveness_evaluation',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    protected $dates = [
        'planned_at',
        'executed_at',
        'created_at',
        'updated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 