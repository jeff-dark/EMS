<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles exist (idempotent). If RolesTableSeeder already ran, these will be ignored.
        $roles = ['admin', 'teacher', 'student'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        $adminRole   = Role::where('name', 'admin')->first();
        $teacherRole = Role::where('name', 'teacher')->first();
        $studentRole = Role::where('name', 'student')->first();

        // Helper closure to create a user with role
        $create = function (array $overrides, Role $role) {
            return User::firstOrCreate(
                ['email' => $overrides['email']],
                array_merge([
                    'name' => $overrides['name'] ?? Str::of($role->name)->title() . ' User',
                    'username' => $overrides['username'] ?? Str::slug($overrides['email']),
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'role_id' => $role->id,
                ], $overrides)
            );
        };

        // 2 Admins
        $create(['name' => 'Primary Admin', 'email' => 'admin1@example.com', 'username' => 'admin1'], $adminRole);
        $create(['name' => 'Secondary Admin', 'email' => 'admin2@example.com', 'username' => 'admin2'], $adminRole);

        // 7 Teachers
        for ($i = 1; $i <= 7; $i++) {
            $create([
                'name' => 'Teacher ' . $i,
                'email' => "teacher{$i}@example.com",
                'username' => "teacher{$i}",
            ], $teacherRole);
        }

        // 30 Students
        for ($i = 1; $i <= 30; $i++) {
            $create([
                'name' => 'Student ' . $i,
                'email' => "student{$i}@example.com",
                'username' => "student{$i}",
            ], $studentRole);
        }
    }
}
