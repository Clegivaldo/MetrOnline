<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DocumentRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'version',
        'changes',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'created_by',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'status'
    ];

    protected $dates = [
        'reviewed_at',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Documento relacionado à revisão
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Document,DocumentRevision>
     */
    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Usuário criador da revisão
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User,DocumentRevision>
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Usuário revisor da revisão
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User,DocumentRevision>
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getStatusLabelAttribute()
    {
        $statuses = [
            'rascunho' => 'Rascunho',
            'em_revisao' => 'Em Revisão',
            'aprovado' => 'Aprovado',
            'rejeitado' => 'Rejeitado'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
