<?php

namespace App\Http\Controllers;

use App\Models\{Course, Exam, Question, Unit, User};
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $counts = [
            'admins' => User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count(),
            'teachers' => User::whereHas('role', fn($q) => $q->where('name', 'teacher'))->count(),
            'students' => User::whereHas('role', fn($q) => $q->where('name', 'student'))->count(),
            'courses' => Course::count(),
            'units' => Unit::count(),
            'exams' => Exam::count(),
            'questions' => Question::count(),
        ];

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
