<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\{Role, User};

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
                    'password' => Hash::make('123456789'),
                    'email_verified_at' => now(),
                    'role_id' => $role->id,
                ], $overrides)
            );
        };

        // 2 Admins
        $create(['name' => 'Primary Admin', 'email' => 'jeffkamau8501@gmail.com', 'username' => 'Jeff_Admin001'], $adminRole);
        $create(['name' => 'Secondary Admin', 'email' => 'hontez@proton.me', 'username' => 'Jeff_Admin002'], $adminRole);

        7 Teachers
        for ($i = 1; $i <= 7; $i++) {
            $create([
                'name' => 'Teacher ' . $i,
                'email' => "teacher{$i}@gmail.com.com",
                'username' => "teacher{$i}",
            ], $teacherRole);
        }

        20 Students
        for ($i = 1; $i <= 20; $i++) {
            $create([
                'name' => 'Student ' . $i,
                'email' => "student{$i}@gmail.com",
                'username' => "student{$i}",
            ], $studentRole);
        }
    }
}
