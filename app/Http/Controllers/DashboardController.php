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

        // Get all users with their role name
        $users = User::with('role:id,name')
            ->get(['id', 'name', 'email', 'role_id'])
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role?->name ?? '',
            ]);

        $filterRole = $request->get('role');

        $users = User::query()
            // Eager load the role relationship to display the role name
            ->with('role')

            // Apply the filter if a specific role is requested
            ->when($filterRole && $filterRole !== 'all', function ($query) use ($filterRole) {
                $query->whereHas('role', function ($q) use ($filterRole) {
                    // Filter by role name (e.g., 'admin', 'teacher', 'student')
                    $q->where('name', $filterRole);
                });
            })
            ->get();

        // Pass the current filter back to the frontend to highlight the active button
        $currentFilter = $filterRole ?: 'all';

        return Inertia::render('dashboard', [
            'counts' => $counts,
            'users' => $users,
        ]);
    }
}
