<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Certificate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'certificate_number',
        'equipment_name',
        'equipment_model',
        'equipment_serial',
        'calibration_date',
        'expiry_date',
        'file_path',
        'file_name',
        'uploaded_by',
        'status',
        'notes',
        'next_calibration_date',
        'calibration_company',
        'uncertainty',
        'measurement_range',
        'calibration_standard',
        'environmental_conditions',
        'traceability',
        'certificate_type',
        'accreditation_body',
        'accreditation_number',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'calibration_date' => 'date',
        'expiry_date' => 'date',
        'next_calibration_date' => 'date',
    ];

    /**
     * Get the client that owns the certificate
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the user who uploaded the certificate
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scope para certificados expirando em X dias
     */
    public function scopeExpiringIn($query, $days)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>=', now());
    }

    /**
     * Scope para certificados expirados
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    /**
     * Scope para certificados válidos
     */
    public function scopeValid($query)
    {
        return $query->where('expiry_date', '>=', now());
    }

    /**
     * Check if certificate is expiring soon (within 30 days)
     */
    public function isExpiringSoon($days = 30): bool
    {
        return $this->expiry_date->diffInDays(now()) <= $days && $this->expiry_date->isFuture();
    }

    /**
     * Check if certificate is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    /**
     * Get the full file path
     */
    public function getFullFilePathAttribute()
    {
        return storage_path('app/public/' . $this->file_path);
    }

    /**
     * Get the file URL
     */
    public function getFileUrlAttribute(): ?string
    {
        if ($this->file_path && Storage::disk('public')->exists($this->file_path)) {
            return Storage::disk('public')->url($this->file_path);
        }
        return null;
    }

    /**
     * Obter status do certificado
     */
    public function getStatusAttribute($value): string
    {
        if ($this->isExpired()) {
            return 'expirado';
        }
        if ($this->isExpiringSoon()) {
            return 'expirando';
        }
        return 'válido';
    }

    /**
     * Boot do modelo
     */
    protected static function boot()
    {
        parent::boot();

        // Quando um certificado é criado
        static::created(function ($certificate) {
            // Enviar email de notificação
            if ($certificate->client && $certificate->client->email) {
                \App\Jobs\SendCertificateNotification::dispatch($certificate, 'created');
            }
        });

        // Quando um certificado é atualizado
        static::updated(function ($certificate) {
            // Verificar se a data de expiração mudou
            if ($certificate->wasChanged('expiry_date')) {
                // Enviar email de notificação
                if ($certificate->client && $certificate->client->email) {
                    \App\Jobs\SendCertificateNotification::dispatch($certificate, 'updated');
                }
            }
        });
    }
}
