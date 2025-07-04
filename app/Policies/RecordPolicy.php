<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Record;

class RecordPolicy
{
    public function view(User $user, Record $record)
    {
        return $user->hasPermission('view-record') || $user->id === $record->created_by;
    }
    public function create(User $user)
    {
        return $user->hasPermission('create-record');
    }
    public function update(User $user, Record $record)
    {
        return $user->hasPermission('update-record') || $user->id === $record->created_by;
    }
    public function delete(User $user, Record $record)
    {
        return $user->hasPermission('delete-record') || $user->id === $record->created_by;
    }
} 