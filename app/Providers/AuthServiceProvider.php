<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use App\Models\Qualification;
use App\Policies\QualificationPolicy;
use App\Models\Training;
use App\Policies\TrainingPolicy;
use App\Models\Equipment;
use App\Policies\EquipmentPolicy;
use App\Models\CalibrationCertificate;
use App\Policies\CalibrationCertificatePolicy;
use App\Models\NonConformity;
use App\Policies\NonConformityPolicy;
use App\Models\InternalAudit;
use App\Policies\InternalAuditPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        \App\Models\Qualification::class => \App\Policies\QualificationPolicy::class,
        \App\Models\Training::class => \App\Policies\TrainingPolicy::class,
        \App\Models\Equipment::class => \App\Policies\EquipmentPolicy::class,
        \App\Models\CalibrationCertificate::class => \App\Policies\CalibrationCertificatePolicy::class,
        \App\Models\NonConformity::class => \App\Policies\NonConformityPolicy::class,
        \App\Models\InternalAudit::class => \App\Policies\InternalAuditPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot()
    {
        $this->registerPolicies();

        \Illuminate\Support\Facades\Gate::define('create-document', function ($user) {
            return $user->hasPermission('create-document');
        });

        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            \Log::info('[Gate::before] chamado', ['user_id' => $user?->id, 'role' => $user?->role, 'ability' => $ability]);
            if ($user && $user->role === 'admin') {
                return true;
            }
        });
    }
} 