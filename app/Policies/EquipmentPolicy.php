<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Equipment;

class EquipmentPolicy
{
    public function view(User $user, Equipment $equipment)
    {
        return $user->hasPermission('view-equipment');
    }
    public function create(User $user)
    {
        return $user->hasPermission('create-equipment');
    }
    public function update(User $user, Equipment $equipment)
    {
        return $user->hasPermission('update-equipment');
    }
    public function delete(User $user, Equipment $equipment)
    {
        return $user->hasPermission('delete-equipment');
    }
} 