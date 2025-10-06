<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function __construct()
    {
        // Enforce UserPolicy for teacher resource routes (route parameter name: 'teacher')
        $this->authorizeResource(User::class, 'teacher');
    }

    public function index()
    {
        $teachers = User::whereHas('role', function ($query) {
            $query->where('name', 'teacher');
        })->get();
        return Inertia::render('Teachers/Index', compact('teachers'));
    }

    public function create()
    {
        return Inertia::render('Teachers/Create', []);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $teacherRole = Role::where('name', 'teacher')->first();

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => bcrypt($request->password),
            'role_id' => $teacherRole->id,
        ]);

        return redirect()->route('teachers.index')->with('message', 'Teacher created successfully.');
    }

    public function edit(User $teacher)
    {
        return Inertia::render('Teachers/Edit', compact('teacher'));
    }

    public function update(Request $request, User $teacher)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->id,
            'username' => 'required|string|max:255|unique:users,username,' . $teacher->id,
            'password' => 'nullable|string|min:8',
        ]);

        $teacher->name = $request->name;
        $teacher->email = $request->email;
        $teacher->username = $request->username;
        if ($request->filled('password')) {
            $teacher->password = bcrypt($request->password);
        }
        $teacher->save();

        return redirect()->route('teachers.index')->with('message', 'Teacher updated successfully.');
    }

    public function destroy(User $teacher)
    {
        $teacher->delete();
        return redirect()->route('teachers.index')->with('message', 'Teacher deleted successfully.');
    }
}
