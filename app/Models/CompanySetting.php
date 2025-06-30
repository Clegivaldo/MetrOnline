<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'cnpj',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'website',
        'description',
        'logo_path',
    ];

    /**
     * Get the logo URL
     */
    public function getLogoUrlAttribute()
    {
        if ($this->logo_path) {
            return asset('storage/' . $this->logo_path);
        }
        return null;
    }
}
