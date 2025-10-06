<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
     * Display a listing of exams for a specific unit.
     */
    public function index(Course $course, Unit $unit)
    {
        // Fetch the exams for the given unit
        $exams = $unit->exams()->get();

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
        // Render the Create view, passing the parent course and unit data
        return Inertia::render('Courses/Units/Exams/Create', compact('course', 'unit'));
    }

    /**
     * Store a newly created exam in storage.
     */
    public function store(Request $request, Course $course, Unit $unit)
    {
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
        return redirect()->route('courses.units.exams.index', [$course, $unit])
            ->with('message', 'Exam "' . $request->title . '" created successfully.');
    }

    /**
     * Show the form for editing the specified exam.
     */
    public function edit(Course $course, Unit $unit, Exam $exam)
    {
        // Render the Edit view, passing the context objects
        return Inertia::render('Courses/Units/Exams/Edit', compact('course', 'unit', 'exam'));
    }

    /**
     * Update the specified exam in storage.
     */
    public function update(Request $request, Course $course, Unit $unit, Exam $exam)
    {
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

        return redirect()->route('courses.units.exams.index', [$course, $unit])
            ->with('message', 'Exam updated successfully.');
    }

    /**
     * Remove the specified exam from storage.
     */
    public function destroy(Course $course, Unit $unit, Exam $exam)
    {
        $exam->delete();

        return redirect()->route('courses.units.exams.index', [$course, $unit])
            ->with('message', 'Exam deleted successfully.');
    }
}
