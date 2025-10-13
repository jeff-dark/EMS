<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\{Auth, DB};
use App\Models\{Course, Exam, ExamSession, Question, Teacher, Unit, User};
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
    $teacherData = null;

    if ($roleName === 'student') {
            // Restrict counts for students: they should only see exam-related personal stats, not global user/course counts.
            // We'll still send counts for exam cards but with specific keys for clarity on frontend.
            $now = now();
            // Preload student's registered units and derive courses from them
            $authUser->loadMissing(['units:id,course_id,title,order']);
            $unitIds = $authUser->units->pluck('id');
            $courseIds = Unit::whereIn('id', $unitIds)->distinct()->pluck('course_id');

            // Exams under student's registered units
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
        } elseif ($roleName === 'teacher') {
            // Teacher-specific metrics
            $authUser->loadMissing('teacher');
            $teacher = $authUser->teacher ?: Teacher::where('user_id', $authUser->id)->first();
            if ($teacher) {
                // Units taught by teacher
                $unitIds = $teacher->units()->pluck('units.id');
                $myUnitsCount = $unitIds->count();

                // Students under these units (distinct users with student role)
                $myStudentsCount = User::whereHas('role', fn($q) => $q->where('name', 'student'))
                    ->whereHas('units', function ($q) use ($unitIds) {
                        $q->whereIn('units.id', $unitIds);
                    })
                    ->count();

                // Active exams today: exams with start_time today and already started
                $todayStart = now()->startOfDay();
                $todayEnd = now()->endOfDay();
                $activeExamsToday = Exam::whereIn('unit_id', $unitIds)
                    ->where('is_published', true)
                    ->whereBetween('start_time', [$todayStart, $todayEnd])
                    ->where('start_time', '<=', now())
                    ->count();

                // Total exams under teacher's units
                $totalExamsUnderUnits = Exam::whereIn('unit_id', $unitIds)->count();

                // Charts datasets
                // 1) Students per unit
                $units = Unit::whereIn('id', $unitIds)->get(['id','title']);
                $studentsPerUnitRaw = DB::table('student_unit')
                    ->select(['unit_id', DB::raw('COUNT(DISTINCT student_id) as students')])
                    ->whereIn('unit_id', $unitIds)
                    ->groupBy('unit_id')
                    ->pluck('students', 'unit_id');
                $studentsPerUnit = $units->map(function($u) use ($studentsPerUnitRaw) {
                    return [
                        'unit' => $u->title,
                        'students' => (int)($studentsPerUnitRaw[$u->id] ?? 0),
                    ];
                })->values();

                // 2) Exams per unit
                $examsPerUnit = Unit::whereIn('id', $unitIds)
                    ->withCount('exams')
                    ->get(['id','title'])
                    ->map(fn($u) => [ 'unit' => $u->title, 'exams' => (int)$u->exams_count ])
                    ->values();

                // Student list details under teacher's units
                $studentsList = User::whereHas('role', fn($q) => $q->where('name', 'student'))
                    ->whereHas('units', function ($q) use ($unitIds) {
                        $q->whereIn('units.id', $unitIds);
                    })
                    ->with(['units' => function ($q) use ($unitIds) {
                        $q->whereIn('units.id', $unitIds)->select('units.id', 'title');
                    }])
                    ->get(['id','name','email'])
                    ->map(fn($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'email' => $s->email,
                        'units' => $s->units->map(fn($u) => ['id' => $u->id, 'title' => $u->title]),
                    ]);

                $teacherData = [
                    'cards' => [
                        'myUnits' => $myUnitsCount,
                        'myStudents' => $myStudentsCount,
                        'activeExamsToday' => $activeExamsToday,
                        'totalExams' => $totalExamsUnderUnits,
                    ],
                    'charts' => [
                        'studentsPerUnit' => $studentsPerUnit,
                        'examsPerUnit' => $examsPerUnit,
                    ],
                    'students' => $studentsList,
                ];
            } else {
                // No teacher profile linked
                $teacherData = [
                    'cards' => [ 'myUnits' => 0, 'myStudents' => 0, 'activeExamsToday' => 0, 'totalExams' => 0 ],
                    'charts' => [ 'studentsPerUnit' => [], 'examsPerUnit' => [] ],
                    'students' => [],
                ];
            }
        }

        // Only send users list for admin role
        $users = ($roleName === 'admin')
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
            'teacherData' => $teacherData,
            // Admin: interactive bar chart data
            'adminInteractive' => [
                ['metric' => 'Courses', 'value' => $counts['courses'] ?? 0],
                ['metric' => 'Units', 'value' => $counts['units'] ?? 0],
                ['metric' => 'Exams', 'value' => $counts['exams'] ?? 0],
                ['metric' => 'Teachers', 'value' => $counts['teachers'] ?? 0],
                ['metric' => 'Students', 'value' => $counts['students'] ?? 0],
                ['metric' => 'Admins', 'value' => $counts['admins'] ?? 0],
            ],
        ]);
    }
}
