<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Idempotent seeding: avoid UNIQUE constraint violations on repeated runs
        foreach (['admin', 'teacher', 'student'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }
    }
}
