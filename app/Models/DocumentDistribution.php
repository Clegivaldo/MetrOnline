<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DocumentDistribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'user_id',
        'distributed_at',
        'returned_at',
        'is_returned',
        'notes',
        'distributed_by',
        'returned_to'
    ];

    protected $dates = [
        'distributed_at',
        'returned_at',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'is_returned' => 'boolean',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function distributedBy()
    {
        return $this->belongsTo(User::class, 'distributed_by');
    }

    public function returnedTo()
    {
        return $this->belongsTo(User::class, 'returned_to');
    }

    public function getStatusAttribute()
    {
        return $this->is_returned ? 'Devolvido' : 'Em posse';
    }
}
