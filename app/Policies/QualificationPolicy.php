<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Qualification;

class QualificationPolicy
{
    public function view(User $user, Qualification $qualification)
    {
        return $user->hasPermission('view-qualification') || $user->id === $qualification->user_id;
    }
    public function create(User $user)
    {
        return $user->hasPermission('create-qualification');
    }
    public function update(User $user, Qualification $qualification)
    {
        return $user->hasPermission('update-qualification') || $user->id === $qualification->user_id;
    }
    public function delete(User $user, Qualification $qualification)
    {
        return $user->hasPermission('delete-qualification') || $user->id === $qualification->user_id;
    }
} 