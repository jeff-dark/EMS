<?php

namespace App\Http\Controllers;

use App\Models\{Course, Exam, ExamSession, Question, Unit, User};
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $authUserId = Auth::id();
        if (!$authUserId) {
            abort(401);
        }
        // Fetch authenticated user with relations needed for role-based dashboards
        $authUser = User::with('role')->findOrFail($authUserId);
        $roleName = $authUser->role?->name;

        // --- Default (admin/teacher) aggregate counts ---
        $counts = [
            'admins' => User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count(),
            'teachers' => User::whereHas('role', fn($q) => $q->where('name', 'teacher'))->count(),
            'students' => User::whereHas('role', fn($q) => $q->where('name', 'student'))->count(),
            'courses' => Course::count(),
            'units' => Unit::count(),
            'exams' => Exam::count(),
            'questions' => Question::count(),
        ];

        // Data container for role-based additions
        $studentData = null;

        if ($roleName === 'student') {
            // Restrict counts for students: they should only see exam-related personal stats, not global user/course counts.
            // We'll still send counts for exam cards but with specific keys for clarity on frontend.
            $now = now();
            // Eager load student's courses & units
            // Preload student's courses & units (only what we need)
            $authUser->loadMissing(['courses:id,name,description','units:id,course_id,title,order']);
            $courseIds = $authUser->courses->pluck('id');
            $unitIds = $authUser->units->pluck('id');

            // Exams under student's units
            $examQuery = Exam::whereIn('unit_id', $unitIds);

            // Total exams (published only?) - assume only published should count
            $totalExams = (clone $examQuery)->where('is_published', true)->count();

            // Upcoming exams (start_time in future OR if start_time null treat as not yet available)
            $upcomingExams = (clone $examQuery)
                ->where('is_published', true)
                ->where(function($q) use ($now) {
                    $q->whereNull('start_time')->orWhere('start_time', '>', $now);
                })
                ->count();

            // Available exams (start_time <= now OR null) and not yet completed by student
            $availableExams = (clone $examQuery)
                ->where('is_published', true)
                ->where(function($q) use ($now) {
                    $q->whereNull('start_time')->orWhere('start_time', '<=', $now);
                })
                ->whereDoesntHave('sessions', function($q) use ($authUser) {
                    $q->where('user_id', $authUser->id)->whereNotNull('submitted_at');
                })
                ->count();

            // Completed exams: sessions the student has submitted
            $completedExams = ExamSession::where('user_id', $authUser->id)->whereNotNull('submitted_at')->count();

            // Provide list of student's courses & units (basic fields)
            $courses = Course::whereIn('id', $courseIds)->get(['id','name','description']);
            $units = Unit::whereIn('id', $unitIds)->with('course:id,name')->orderBy('course_id')->orderBy('order')->get(['id','course_id','title','order']);

            $studentData = [
                'examStats' => [
                    'total' => $totalExams,
                    'available' => $availableExams,
                    'upcoming' => $upcomingExams,
                    'completed' => $completedExams,
                ],
                'courses' => $courses,
                'units' => $units->map(fn($u) => [
                    'id' => $u->id,
                    'course_id' => $u->course_id,
                    'course_name' => $u->course?->name,
                    'title' => $u->title,
                    'order' => $u->order,
                ]),
                // Chart dataset (single point summary & distribution)
                'examDistribution' => [
                    ['status' => 'Available', 'value' => $availableExams],
                    ['status' => 'Upcoming', 'value' => $upcomingExams],
                    ['status' => 'Completed', 'value' => $completedExams],
                ],
            ];
        }

        // Only send users list for admin/teacher roles
        $users = ($roleName === 'admin' || $roleName === 'teacher')
            ? User::with('role:id,name')
                ->get(['id', 'name', 'email', 'role_id'])
                ->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role?->name ?? '',
                ])
            : [];

        return Inertia::render('dashboard', [
            'counts' => $counts,
            'users' => $users,
            'authUser' => [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'role' => $roleName,
            ],
            'studentData' => $studentData,
        ]);
    }
}
