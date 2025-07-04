<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Permission;

class AdminPermissionSeeder extends Seeder
{
    public function run()
    {
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            $perms = Permission::all()->pluck('id');
            $admin->permissions()->sync($perms);
        }
    }
} 