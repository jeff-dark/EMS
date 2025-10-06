<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        // Enforce UserPolicy for admin resource routes (route parameter name: 'admin')
        $this->authorizeResource(User::class, 'admin');
    }

    public function index()
    {
        $this->authorize('viewAdmin', User::class);
        $admins = User::whereHas('role', function ($query) {
            $query->where('name', 'admin');
        })->get();
        return Inertia::render('Admins/Index', compact('admins'));
    }

    public function create()
    {
        $this->authorize('createAdmin', User::class);
        return Inertia::render('Admins/Create', []);
    }

    public function store(Request $request)
    {
        $this->authorize('createAdmin', User::class);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $adminRole = Role::where('name', 'admin')->first();

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => bcrypt($request->password),
            'role_id' => $adminRole->id,
        ]);

        return redirect()->route('admins.index')->with('message', 'Admin created successfully.');
    }

    public function edit(User $admin)
    {
        return Inertia::render('Admins/Edit', compact('admin'));
    }

    public function update(Request $request, User $admin)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $admin->id,
            'username' => 'required|string|max:255|unique:users,username,' . $admin->id,
            'password' => 'nullable|string|min:8',
        ]);

        $admin->name = $request->name;
        $admin->email = $request->email;
        $admin->username = $request->username;
        if ($request->filled('password')) {
            $admin->password = bcrypt($request->password);
        }
        $admin->save();

        return redirect()->route('admins.index')->with('message', 'Admin updated successfully.');
    }

    public function destroy(User $admin)
    {
        $admin->delete();
        return redirect()->route('admins.index')->with('message', 'Admin deleted successfully.');
    }
}
