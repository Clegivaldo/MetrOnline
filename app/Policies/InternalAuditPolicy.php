<?php

namespace App\Policies;

use App\Models\User;
use App\Models\InternalAudit;

class InternalAuditPolicy
{
    public function view(User $user, InternalAudit $audit)
    {
        return $user->hasPermission('view-internal-audit');
    }
    public function create(User $user)
    {
        return $user->hasPermission('create-internal-audit');
    }
    public function update(User $user, InternalAudit $audit)
    {
        return $user->hasPermission('update-internal-audit');
    }
    public function delete(User $user, InternalAudit $audit)
    {
        return $user->hasPermission('delete-internal-audit');
    }
} 