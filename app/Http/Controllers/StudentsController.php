<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class StudentsController extends Controller
{
    public function __construct()
    {
        // Enforce UserPolicy for student resource routes (route parameter name: 'student')
        $this->authorizeResource(User::class, 'student');
    }

    public function index()
    {
        $students = User::whereHas('role', function ($query) {
            $query->where('name', 'student');
        })->get();
        return Inertia::render('Students/Index', compact('students'));
    }

    public function create()
    {
    $courses = \App\Models\Course::all();
    return Inertia::render('Students/Create', compact('courses'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'courses' => 'required|array|min:1|max:2',
            'courses.*' => 'exists:courses,id',
        ]);

        $studentRole = Role::where('name', 'student')->first();
        $student = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => bcrypt($request->password),
            'role_id' => $studentRole->id,
        ]);

        // Attach selected courses
        $student->courses()->sync($request->courses);

        // Assign units from selected courses
        $unitIds = \App\Models\Unit::whereIn('course_id', $request->courses)->pluck('id')->toArray();
        $student->units()->sync($unitIds);

        return redirect()->route('students.index')->with('message', 'Student created successfully.');
    }

    public function edit(User $student)
    {
    $courses = \App\Models\Course::all();
    $studentCourses = $student->courses()->pluck('courses.id')->toArray();
    return Inertia::render('Students/Edit', compact('student', 'courses', 'studentCourses'));
    }

    public function update(Request $request, User $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $student->id,
            'username' => 'required|string|max:255|unique:users,username,' . $student->id,
            'password' => 'nullable|string|min:8',
            'courses' => 'required|array|min:1|max:2',
            'courses.*' => 'exists:courses,id',
        ]);

        $student->name = $request->name;
        $student->email = $request->email;
        $student->username = $request->username;
        if ($request->filled('password')) {
            $student->password = bcrypt($request->password);
        }
        $student->save();

        // Sync selected courses
        $student->courses()->sync($request->courses);

        // Sync units from selected courses
        $unitIds = \App\Models\Unit::whereIn('course_id', $request->courses)->pluck('id')->toArray();
        $student->units()->sync($unitIds);

        return redirect()->route('students.index')->with('message', 'Student updated successfully.');
    }

    public function destroy(User $student)
    {
        $student->delete();
        return redirect()->route('students.index')->with('message', 'Student deleted successfully.');
    }
}
