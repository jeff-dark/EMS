<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\{Course, User};
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Count users by role
        $counts = [
            'admins' => User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count(),
            'teachers' => User::whereHas('role', fn($q) => $q->where('name', 'teacher'))->count(),
            'students' => User::whereHas('role', fn($q) => $q->where('name', 'student'))->count(),
            'courses' => Course::count(),
        ];

        // Apply optional role filter and return users as simple arrays
        $filterRole = $request->get('role');

        $usersQuery = User::query()->with('role');

        $usersQuery->when($filterRole && $filterRole !== 'all', function ($query) use ($filterRole) {
            $query->whereHas('role', function ($q) use ($filterRole) {
                $q->where('name', $filterRole);
            });
        });

        $users = $usersQuery->get()->map(fn($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role?->name ?? '',
        ])->values();

        // Pass the current filter back to the frontend to highlight the active button
        $currentFilter = $filterRole ?: 'all';

        return Inertia::render('dashboard', [
            'counts' => $counts,
            'users' => $users,
            'currentFilter' => $currentFilter,
        ]);
    }
}
