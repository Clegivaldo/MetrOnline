<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            EmailTemplatesSeeder::class,
            CompanySettingsSeeder::class,
            SystemSettingsSeeder::class,
            InitialDataSeeder::class,
            PermissionSeeder::class,
            AdminPermissionSeeder::class,
        ]);
    }
    
}
