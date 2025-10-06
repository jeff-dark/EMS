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
        $units = $course->units()->orderBy('order')->get(); 
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

    return redirect()->route('units.index', $course)->with('message', 'Unit created successfully.');
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

    return redirect()->route('units.index', $course)->with('message', 'Unit updated successfully.');
    }

    public function destroy(Course $course, Unit $unit)
    {
        $unit->delete();
    return redirect()->route('units.index', $course)->with('message', 'Unit deleted successfully.');
    }
}
