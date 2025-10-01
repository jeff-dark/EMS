<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Count users by role
        $counts = [
            'admins' => User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count(),
            'teachers' => User::whereHas('role', fn($q) => $q->where('name', 'teacher'))->count(),
            'students' => User::whereHas('role', fn($q) => $q->where('name', 'student'))->count(),
        ];

        // Get all users with their role name
        $users = User::with('role:id,name')
            ->get(['id', 'name', 'email', 'role_id'])
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role?->name ?? '',
            ]);

        return Inertia::render('dashboard', [
            'counts' => $counts,
            'users' => $users,
        ]);
    }
}
