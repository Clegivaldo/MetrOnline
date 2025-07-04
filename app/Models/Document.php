<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'title',
        'description',
        'category_id',
        'version',
        'status',
        'effective_date',
        'review_date',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'created_by',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'is_controlled'
    ];

    protected $dates = [
        'effective_date',
        'review_date',
        'reviewed_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    protected $casts = [
        'is_controlled' => 'boolean',
        'file_size' => 'integer',
    ];

    /**
     * Categoria do documento
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<DocumentCategory,Document>
     */
    public function category()
    {
        return $this->belongsTo(DocumentCategory::class);
    }

    /**
     * Usuário criador do documento
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User,Document>
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Usuário revisor do documento
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User,Document>
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Revisões do documento
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<DocumentRevision>
     */
    public function revisions()
    {
        return $this->hasMany(DocumentRevision::class)->orderBy('created_at', 'desc');
    }

    /**
     * Distribuições do documento
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<DocumentDistribution>
     */
    public function distributions()
    {
        return $this->hasMany(DocumentDistribution::class);
    }

    public function getLatestRevision()
    {
        return $this->revisions()->latest()->first();
    }

    public function getStatusLabelAttribute()
    {
        $statuses = [
            'rascunho' => 'Rascunho',
            'em_revisao' => 'Em Revisão',
            'aprovado' => 'Aprovado',
            'obsoleto' => 'Obsoleto'
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
