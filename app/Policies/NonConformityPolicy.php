<?php

namespace App\Policies;

use App\Models\User;
use App\Models\NonConformity;

class NonConformityPolicy
{
    public function view(User $user, NonConformity $nonConformity)
    {
        return $user->hasPermission('view-non-conformity');
    }
    public function create(User $user)
    {
        return $user->hasPermission('create-non-conformity');
    }
    public function update(User $user, NonConformity $nonConformity)
    {
        return $user->hasPermission('update-non-conformity');
    }
    public function delete(User $user, NonConformity $nonConformity)
    {
        return $user->hasPermission('delete-non-conformity');
    }
} 