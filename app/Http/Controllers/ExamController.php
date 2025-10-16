<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\{Course, Exam, Unit, User};
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
        /** @var User|null $user */
    $user = Auth::user();
        if ($user instanceof User && $user->hasRole('teacher')) {
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
        } elseif ($user instanceof User && $user->hasRole('admin')) {
            // Admin sees all
            $exams = Exam::with(['unit', 'unit.course'])->get();
        } else {
            // Students: show exams under units they are registered to (published only),
            // and compute a per-user is_submitted flag via exists on sessions.
            $unitIds = $user instanceof User ? $user->units()->pluck('units.id') : collect();
            $exams = Exam::whereIn('unit_id', $unitIds)
                ->where('is_published', true)
                ->with(['unit', 'unit.course'])
                ->withExists(['sessions as is_submitted' => function ($q) use ($user) {
                    if ($user instanceof User) {
                        $q->where('user_id', $user->id)->whereNotNull('submitted_at');
                    }
                }])
                ->get()
                ->map(function ($exam) {
                    $exam->is_submitted = (bool) ($exam->is_submitted ?? false);
                    return $exam;
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
        /** @var User|null $user */
    $user = Auth::user();
        if ($user instanceof User && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                \abort(403);
            }
        } elseif ($user instanceof User && $user->hasRole('student')) {
            // Students can only access exams for units they are registered to
            $registered = $user->units()->where('units.id', $unit->id)->exists();
            if (!$registered) {
                \abort(403);
            }
        }
        // Fetch the exams for the given unit
        $query = $unit->exams();
        if ($user instanceof User && $user->hasRole('student')) {
            $query->where('is_published', true)
                ->withExists(['sessions as is_submitted' => function ($q) use ($user) {
                    $q->where('user_id', $user->id)->whereNotNull('submitted_at');
                }]);
        }
        $exams = $query->get()->map(function ($exam) use ($user) {
            if ($user instanceof User && $user->hasRole('student')) {
                $exam->is_submitted = (bool) ($exam->is_submitted ?? false);
            }
            return $exam;
        });

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
    /** @var User|null $user */
    $user = Auth::user();
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
        $payload = [
            'title' => $request->title,
            'duration_minutes' => $request->duration_minutes,
            'passing_score' => $request->passing_score,
            'is_published' => $request->is_published ?? false,
        ];
        if ($user instanceof User && $user->hasRole('teacher')) {
            $payload['teacher_id'] = optional($user->teacher)->id;
        }
        $unit->exams()->create($payload);

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
    /** @var User|null $user */
    $user = Auth::user();
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

        $update = [
            'title' => $request->title,
            'duration_minutes' => $request->duration_minutes,
            'passing_score' => $request->passing_score,
            'is_published' => $request->is_published ?? false,
        ];
        if ($user instanceof User && $user->hasRole('teacher')) {
            $update['teacher_id'] = optional($user->teacher)->id;
        }
        $exam->update($update);

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
