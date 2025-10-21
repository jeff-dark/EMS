<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\EnrollmentChangedMail;

class StudentsController extends Controller
{
    public function __construct()
    {
        // Enforce UserPolicy for student resource routes (route parameter name: 'student')
        $this->authorizeResource(User::class, 'student');
    }

    public function index()
    {
    $user = Auth::user();
    if (($user instanceof \App\Models\User) && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if ($teacher) {
                // Students registered under courses/units the teacher teaches
                $students = User::whereHas('role', fn($q) => $q->where('name', 'student'))
                    ->where(function ($q) use ($teacher) {
                        // Either same courses or units
                        $q->whereHas('courses.units.teachers', function ($q2) use ($teacher) {
                            $q2->where('teachers.id', $teacher->id);
                        })->orWhereHas('units.teachers', function ($q3) use ($teacher) {
                            $q3->where('teachers.id', $teacher->id);
                        });
                    })
                    ->get();
            } else {
                $students = collect();
            }
        } else {
            $students = User::whereHas('role', function ($query) {
                $query->where('name', 'student');
            })->get();
        }
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
        try {
            if ($student->email) {
                $m = new EnrollmentChangedMail($student, coursesAdded: \App\Models\Course::whereIn('id', $request->courses)->pluck('name')->toArray(), coursesRemoved: []);
                if (config('queue.default') === 'sync') { Mail::to($student->email)->send($m); } else { Mail::to($student->email)->queue($m); }
            }
        } catch (\Throwable $e) { /* ignore */ }

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
        $existing = $student->courses()->pluck('courses.id')->toArray();
        $student->courses()->sync($request->courses);
        $added = array_values(array_diff($request->courses, $existing));
        $removed = array_values(array_diff($existing, $request->courses));
        try {
            if ($student->email && (!empty($added) || !empty($removed))) {
                $addedNames = empty($added) ? [] : \App\Models\Course::whereIn('id', $added)->pluck('name')->toArray();
                $removedNames = empty($removed) ? [] : \App\Models\Course::whereIn('id', $removed)->pluck('name')->toArray();
                $m = new EnrollmentChangedMail($student, $addedNames, $removedNames);
                if (config('queue.default') === 'sync') { Mail::to($student->email)->send($m); } else { Mail::to($student->email)->queue($m); }
            }
        } catch (\Throwable $e) { /* ignore */ }

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

    public function resetPassword(User $student)
    {
        $actor = Auth::user();
        if (!($actor instanceof \App\Models\User) || !$actor->hasRole('admin')) {
            abort(403);
        }

        $student->password = bcrypt('123456789');
        $student->save();

        return redirect()->back()->with('message', 'Password reset to 123456789 for ' . $student->name . '.');
    }
}
