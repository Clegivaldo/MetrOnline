<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Qualification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type', // Ex: competência, autorização
        'name',
        'description',
        'issued_at',
        'expires_at',
        'issued_by',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    protected $dates = [
        'issued_at',
        'expires_at',
        'created_at',
        'updated_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 