<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\{Course, Exam, Unit};
use Inertia\Inertia;

class ExamController extends Controller
{
    public function __construct()
    {
        // Enforce the ExamPolicy for all resource methods
        $this->authorizeResource(Exam::class, 'exam');
    }

    /**
     * Display a listing of all exams across all units and courses.
     */
    public function allExamsIndex()
    {
    $user = Auth::user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$teacher) {
                $exams = collect();
            } else {
                // Only exams under units assigned to this teacher
                $exams = Exam::whereHas('unit.teachers', function ($q) use ($teacher) {
                        $q->where('teachers.id', $teacher->id);
                    })
                    ->with(['unit', 'unit.course'])
                    ->get();
            }
        } elseif ($user && $user->hasRole('admin')) {
            // Admin sees all
            $exams = Exam::with(['unit', 'unit.course'])->get();
        } else {
            // Students: show exams under units they are registered to (published only)
            $unitIds = $user->units()->pluck('units.id');
            $exams = Exam::whereIn('unit_id', $unitIds)
                ->where('is_published', true)
                ->with(['unit', 'unit.course'])
                ->get();

            // Attach per-student submission status (is_submitted)
            $submittedExamIds = \App\Models\ExamSession::where('user_id', $user->id)
                ->whereNotNull('submitted_at')
                ->pluck('exam_id')
                ->all();

            // Map to lightweight array including nested unit & course names
            $exams = $exams->map(function ($e) use ($submittedExamIds) {
                return [
                    'id' => $e->id,
                    'unit_id' => $e->unit_id,
                    'title' => $e->title,
                    'duration_minutes' => $e->duration_minutes,
                    'passing_score' => $e->passing_score,
                    'is_published' => (bool)$e->is_published,
                    'is_submitted' => in_array($e->id, $submittedExamIds, true),
                    'unit' => $e->unit ? [
                        'id' => $e->unit->id,
                        'title' => $e->unit->title,
                        'course' => $e->unit->course ? [
                            'id' => $e->unit->course->id,
                            'name' => $e->unit->course->name,
                        ] : null,
                    ] : null,
                ];
            });
        }

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
        ]);
    }


    /**
     * Display a listing of exams for a specific unit.
     */
    public function index(Course $course, Unit $unit)
    {
        // Teachers can only access exams for units they teach
    $user = Auth::user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                \abort(403);
            }
        } elseif ($user && $user->hasRole('student')) {
            // Students can only access exams for units they are registered to
            $registered = $user->units()->where('units.id', $unit->id)->exists();
            if (!$registered) {
                \abort(403);
            }
        }
        // Fetch the exams for the given unit
        $query = $unit->exams();
        if ($user && $user->hasRole('student')) {
            $query->where('is_published', true);
        }
        $exams = $query->with(['unit', 'unit.course'])->get();

        // For students, enrich exams with per-student submission flag
        if ($user && $user->hasRole('student')) {
            $submittedExamIds = \App\Models\ExamSession::where('user_id', $user->id)
                ->whereNotNull('submitted_at')
                ->pluck('exam_id')
                ->all();
            $exams = $exams->map(function ($e) use ($submittedExamIds) {
                return [
                    'id' => $e->id,
                    'unit_id' => $e->unit_id,
                    'title' => $e->title,
                    'duration_minutes' => $e->duration_minutes,
                    'passing_score' => $e->passing_score,
                    'is_published' => (bool)$e->is_published,
                    'is_submitted' => in_array($e->id, $submittedExamIds, true),
                    'unit' => $e->unit ? [
                        'id' => $e->unit->id,
                        'title' => $e->unit->title,
                        'course' => $e->unit->course ? [
                            'id' => $e->unit->course->id,
                            'name' => $e->unit->course->name,
                        ] : null,
                    ] : null,
                ];
            });
        }

        // Render the Index view, passing the course, unit, exams, and auth
        return Inertia::render('Courses/Units/Exams/Index', [
            'course' => $course,
            'unit' => $unit,
            'exams' => $exams,
        ]);
    }

    /**
     * Show the form for creating a new exam for a specific unit.
     */
    public function create(Course $course, Unit $unit)
    {
        // Teachers can only create exams for units they teach
    $user = Auth::user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                \abort(403);
            }
        }
        // Render the Create view, passing the parent course and unit data
        return Inertia::render('Courses/Units/Exams/Create', compact('course', 'unit'));
    }

    /**
     * Store a newly created exam in storage.
     */
    public function store(Request $request, Course $course, Unit $unit)
    {
        // Teachers can only store exams for units they teach
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                \abort(403);
            }
        }
        // Validate the request data
        $request->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1',
            'passing_score' => 'required|numeric|min:0|max:100',
            'is_published' => 'boolean', // Expects a true/false value
        ]);

        // Use the unit relationship to create and automatically set the unit_id
        $unit->exams()->create([
            'title' => $request->title,
            'duration_minutes' => $request->duration_minutes,
            'passing_score' => $request->passing_score,
            'is_published' => $request->is_published ?? false,
        ]);

        // Redirect back to the list of exams for this specific unit
        return \redirect()->route('courses.units.exams.index', [$course, $unit])
            ->with('message', 'Exam "' . $request->title . '" created successfully.');
    }

    /**
     * Show the form for editing the specified exam.
     */
    public function edit(Course $course, Unit $unit, Exam $exam)
    {
        // Teachers can only edit exams for units they teach
    $user = Auth::user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                \abort(403);
            }
        }
        // Render the Edit view, passing the context objects
        return Inertia::render('Courses/Units/Exams/Edit', compact('course', 'unit', 'exam'));
    }

    /**
     * Update the specified exam in storage.
     */
    public function update(Request $request, Course $course, Unit $unit, Exam $exam)
    {
        // Teachers can only update exams for units they teach
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                abort(403);
            }
        }
        // Validate the request data
        $request->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1',
            'passing_score' => 'required|numeric|min:0|max:100',
            'is_published' => 'boolean',
        ]);

        $exam->update([
            'title' => $request->title,
            'duration_minutes' => $request->duration_minutes,
            'passing_score' => $request->passing_score,
            'is_published' => $request->is_published ?? false,
        ]);

        return \redirect()->route('courses.units.exams.index', [$course, $unit])
            ->with('message', 'Exam updated successfully.');
    }

    /**
     * Remove the specified exam from storage.
     */
    public function destroy(Course $course, Unit $unit, Exam $exam)
    {
        // Teachers can only delete exams for units they teach
    $user = Auth::user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                abort(403);
            }
        }
        $exam->delete();

        return \redirect()->route('courses.units.exams.index', [$course, $unit])
            ->with('message', 'Exam deleted successfully.');
    }
}
