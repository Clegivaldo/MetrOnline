<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'parent_id',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Categoria pai
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<DocumentCategory,DocumentCategory>
     */
    public function parent()
    {
        return $this->belongsTo(DocumentCategory::class, 'parent_id');
    }

    /**
     * Categorias filhas
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<DocumentCategory>
     */
    public function children()
    {
        return $this->hasMany(DocumentCategory::class, 'parent_id');
    }

    /**
     * Documentos da categoria
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Document>
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
