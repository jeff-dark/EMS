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
        return Inertia::render('Students/Create', []);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $studentRole = Role::where('name', 'student')->first();

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => bcrypt($request->password),
            'role_id' => $studentRole->id,
        ]);

        return redirect()->route('students.index')->with('message', 'Student created successfully.');
    }

    public function edit(User $student)
    {
        return Inertia::render('Students/Edit', compact('student'));
    }

    public function update(Request $request, User $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $student->id,
            'username' => 'required|string|max:255|unique:users,username,' . $student->id,
            'password' => 'nullable|string|min:8',
        ]);

        $student->name = $request->name;
        $student->email = $request->email;
        $student->username = $request->username;
        if ($request->filled('password')) {
            $student->password = bcrypt($request->password);
        }
        $student->save();

        return redirect()->route('students.index')->with('message', 'Student updated successfully.');
    }

    public function destroy(User $student)
    {
        $student->delete();
        return redirect()->route('students.index')->with('message', 'Student deleted successfully.');
    }
}
