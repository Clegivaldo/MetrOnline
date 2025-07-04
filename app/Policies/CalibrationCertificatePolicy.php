<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CalibrationCertificate;

class CalibrationCertificatePolicy
{
    public function view(User $user, CalibrationCertificate $certificate)
    {
        return $user->hasPermission('view-certificate');
    }
    public function create(User $user)
    {
        return $user->hasPermission('create-certificate');
    }
    public function update(User $user, CalibrationCertificate $certificate)
    {
        return $user->hasPermission('update-certificate');
    }
    public function delete(User $user, CalibrationCertificate $certificate)
    {
        return $user->hasPermission('delete-certificate');
    }
} 