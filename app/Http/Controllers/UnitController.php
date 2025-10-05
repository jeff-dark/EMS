<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Inertia\Inertia;
use App\Models\Course;
use Carbon\Traits\Units;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Course $course)
    {
        $units = $course->units()->get();
        return Inertia::render('Courses/Units/Index', compact('course', 'units'));
    }

    public function create(Course $course)
    {
        return Inertia::render('Courses/Units/Create', compact('course'));
    }

    public function store(Request $request, Course $course)
    {
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

        return redirect()->route('Courses/Units.Index', $course)->with('message', 'Unit created successfully.');
    }

    public function edit(Course $course, Unit $unit)
    {
        return Inertia::render('Courses/Units/Edit', compact('course', 'unit'));
    }

    public function update(Request $request, Course $course, Unit $unit)
    {
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

        return redirect()->route('Courses/units.index', $course)->with('message', 'Unit updated successfully.');
    }

    public function destroy(Course $course, Unit $unit)
    {
        $unit->delete();
        return redirect()->route('Courses/units.index', $course)->with('message', 'Unit deleted successfully.');
    }
}
