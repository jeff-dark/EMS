<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Course, Unit};
use Carbon\Traits\Units;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function __construct()
    {
        // Enforce the UnitPolicy for all resource methods
        // The second parameter 'unit' matches the variable name in your route/method signatures
        $this->authorizeResource(Unit::class, 'unit');
    }

    public function index(Course $course)
    {
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$teacher) {
                \abort(403);
            }
            // Ensure teacher is assigned to at least one unit in this course
            $isAssignedToCourse = Unit::where('course_id', $course->id)
                ->whereHas('teachers', fn($q) => $q->where('teachers.id', $teacher->id))
                ->exists();
            if (!$isAssignedToCourse) {
                \abort(403);
            }
            // Show only the units in this course that the teacher teaches
            $units = $course->units()
                ->whereHas('teachers', fn($q) => $q->where('teachers.id', $teacher->id))
                ->orderBy('order')
                ->get();
        } elseif ($user && $user->hasRole('student')) {
            // Students can only access units under courses they are enrolled in
            $enrolled = $user->courses()->where('courses.id', $course->id)->exists();
            if (!$enrolled) {
                \abort(403);
            }
            $units = $course->units()->orderBy('order')->get();
        } else {
            $units = $course->units()->orderBy('order')->get();
        }
        return Inertia::render('Courses/Units/Index', compact('course', 'units'));
    }

    public function create(Course $course)
    {
        // Teachers can only create units under courses they teach
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $isAssignedToCourse = Unit::where('course_id', $course->id)
                ->whereHas('teachers', fn($q) => $q->where('teachers.id', $teacher->id))
                ->exists();
            if (!$isAssignedToCourse) {
                abort(403);
            }
        }
        return Inertia::render('Courses/Units/Create', compact('course'));
    }

    public function store(Request $request, Course $course)
    {
        // Teachers can only create units under courses they teach
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $isAssignedToCourse = Unit::where('course_id', $course->id)
                ->whereHas('teachers', fn($q) => $q->where('teachers.id', $teacher->id))
                ->exists();
            if (!$isAssignedToCourse) {
                abort(403);
            }
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'order' => 'required|integer|min:1',
        ]);

        Unit::create([
            'course_id' => $course->id,
            'title' => $request->title,
            'summary' => $request->summary,
            'order' => $request->order,
        ]);

    return redirect()->route('units.index', $course)->with('message', 'Unit created successfully.');
    }

    public function edit(Course $course, Unit $unit)
    {
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                abort(403);
            }
        }
        return Inertia::render('Courses/Units/Edit', compact('course', 'unit'));
    }

    public function update(Request $request, Course $course, Unit $unit)
    {
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                abort(403);
            }
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'order' => 'required|integer|min:1',
        ]);

        $unit->update([
            'title' => $request->title,
            'summary' => $request->summary,
            'order' => $request->order,
        ]);

    return redirect()->route('units.index', $course)->with('message', 'Unit updated successfully.');
    }

    public function destroy(Course $course, Unit $unit)
    {
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$unit->teachers()->where('teachers.id', $teacher->id)->exists()) {
                abort(403);
            }
        }
        $unit->delete();
    return redirect()->route('units.index', $course)->with('message', 'Unit deleted successfully.');
    }
}
