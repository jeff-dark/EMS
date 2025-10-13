<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Course, User};
use Inertia\Inertia;

class CourseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        // Enforce the CoursePolicy for all resource methods
        $this->authorizeResource(Course::class, 'course');
    }



    public function index()
    {
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if ($teacher) {
                $courses = Course::whereHas('units.teachers', function ($q) use ($teacher) {
                    $q->where('teachers.id', $teacher->id);
                })->get();
            } else {
                $courses = collect();
            }
        } else {
            // Admin and others (if any) see all courses
            $courses = Course::all();
        }
        return Inertia::render('Courses/Index', compact('courses'));
    }

    public function create()
    {
        return Inertia::render('Courses/Create', []);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:courses',
            'description' => 'nullable|string',
        ]);

        Course::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->route('courses.index')->with('message', 'Course created successfully.');
    }

    public function edit(Course $course)
    {
        return Inertia::render('Courses/Edit', compact('course'));
    }

    public function update(Request $request, Course $course)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:courses,name,' . $course->id,
            'description' => 'nullable|string',
        ]);

        $course->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->route('courses.index')->with('message', 'Course updated successfully.');
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return redirect()->route('courses.index')->with('message', 'Course deleted successfully.');
    }
}
