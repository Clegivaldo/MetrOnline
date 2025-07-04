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
            AdminPermissionSeeder::class,
            PermissionSeeder::class,
            CompanySettingsSeeder::class,
            SystemSettingsSeeder::class,
            EmailTemplatesSeeder::class,
            InitialDataSeeder::class,
            DocumentSeeder::class,
        ]);
    }
    
}
