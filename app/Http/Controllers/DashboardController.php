<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\{Course, Exam, Question, Unit, User};
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // NOTE: If this becomes performance heavy, wrap aggregates & chartData in cache:
        // Cache::remember('dashboard.metrics', 300, fn() => [...]) and bust on model events.
        // You can also precompute monthly counts via scheduled job for large datasets.

        $counts = [
            'admins' => User::whereHas('role', fn($q) => $q->where('name', 'admin'))->count(),
            'teachers' => User::whereHas('role', fn($q) => $q->where('name', 'teacher'))->count(),
            'students' => User::whereHas('role', fn($q) => $q->where('name', 'student'))->count(),
            'courses' => Course::count(),
            'units' => Unit::count(),
            'exams' => Exam::count(),
            'questions' => Question::count(),
        ];

        $months = collect(range(0,5))
            ->map(fn($i) => Carbon::now()->subMonths($i)->startOfMonth())
            ->sort();

        $perMonth = function($modelClass) use ($months) {
            // For PostgreSQL adjust DATE_FORMAT to TO_CHAR(created_at, 'YYYY-MM')
            $counts = $modelClass::select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as ym'), DB::raw('COUNT(*) as aggregate'))
                ->where('created_at', '>=', $months->first())
                ->groupBy('ym')
                ->pluck('aggregate', 'ym');
            return $months->map(function($m) use ($counts) {
                $key = $m->format('Y-m');
                return [
                    'month' => $m->format('M'),
                    'ym' => $key,
                    'value' => (int) ($counts[$key] ?? 0),
                ];
            });
        };

        $seriesCourses = $perMonth(Course::class);
        $seriesUnits = $perMonth(Unit::class);
        $seriesExams = $perMonth(Exam::class);
        $seriesQuestions = $perMonth(Question::class);

        $chartData = $seriesCourses->map(function($row, $index) use ($seriesUnits, $seriesExams, $seriesQuestions) {
            return [
                'month' => $row['month'],
                'courses' => $row['value'],
                'units' => $seriesUnits[$index]['value'],
                'exams' => $seriesExams[$index]['value'],
                'questions' => $seriesQuestions[$index]['value'],
            ];
        });

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
            'chartData' => $chartData,
        ]);
    }
}
