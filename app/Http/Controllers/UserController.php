<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct()
    {
        // Only allow admins to manage users. Use a small closure middleware so we don't depend on a specific gate.
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (! $user || ! $user->hasAnyRole('admin', 'administrator')) {
                abort(403);
            }
            return $next($request);
        });
    }

    /**
     * Show a listing of users (basic list for admins).
     */
    public function index(Request $request)
    {
        $users = User::with('role')->orderBy('name')->paginate(25);
        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $roles = Role::orderBy('name')->get();
        return Inertia::render('Users/Edit', [
            'user' => $user->load('role'),
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'username' => ['nullable', 'string', 'max:255', 'unique:users,username,'.$user->id],
            'role_id' => ['nullable', 'exists:roles,id'],
        ]);

        $user->fill($data);
        $user->save();

        return back()->with('success', 'User updated.');
    }

    /**
     * Reset the user's password to a random strong value and return feedback.
     * In production you should send this via email; here we provide the new password in the
     * response for admins to copy if needed.
     */
    public function resetPassword(Request $request, User $user)
    {
        $newPassword = Str::random(12);
        $user->password = Hash::make($newPassword);
        $user->save();

        // If the request expects JSON respond with the password, otherwise flash and redirect back.
        if ($request->wantsJson()) {
            return response()->json(['status' => 'ok', 'password' => $newPassword]);
        }

        return back()->with('success', 'Password reset. New password: ' . $newPassword);
    }

    /**
     * Remove the specified user from storage.*/
    public function destroy(User $user)
    {
        // Prevent admins from deleting themselves accidentally
        if (Auth::id() === $user->getKey()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();
        return back()->with('success', 'User deleted.');
    }
    }
