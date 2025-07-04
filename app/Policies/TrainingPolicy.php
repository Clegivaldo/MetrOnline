<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Training;

class TrainingPolicy
{
    public function view(User $user, Training $training)
    {
        return $user->hasPermission('view-training') || $user->id === $training->user_id;
    }
    public function create(User $user)
    {
        return $user->hasPermission('create-training');
    }
    public function update(User $user, Training $training)
    {
        return $user->hasPermission('update-training') || $user->id === $training->user_id;
    }
    public function delete(User $user, Training $training)
    {
        return $user->hasPermission('delete-training') || $user->id === $training->user_id;
    }
} 