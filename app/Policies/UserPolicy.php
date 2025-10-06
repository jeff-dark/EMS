<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the list of all users.
     */
    public function viewAny(User $user): bool
    {
        // Only Admins and Teachers can view the full list of users
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    /**
     * Determine whether the user can view a specific user.
     */
    public function view(User $user, User $model): bool
    {
        // If the target user is an admin, only admins (or the user themselves) may view.
        if ($model->role && $model->role->name === 'admin') {
            return $user->hasRole('admin') || $user->id === $model->id;
        }

        // For non-admin targets: Admins and Teachers can view; Students can view themselves.
        return $user->hasRole('admin') || $user->hasRole('teacher') || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create new users.
     */
    public function create(User $user): bool
    {
        // Only Admins and Teachers can create new users
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    /**
     * Determine whether the user can create new admin users.
     * Only admins are allowed to create admin accounts.
     */
    public function createAdmin(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the specific user.
     */
    public function update(User $user, User $model): bool
    {
        // Admins can update anyone. Teachers can update anyone.
        // Students can only update themselves.
        return $user->hasRole('admin') || $user->hasRole('teacher') || $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the specific user.
     */
    public function delete(User $user, User $model): bool
    {
        // Only Admins can delete users, and they cannot delete themselves.
        return $user->hasRole('admin') && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can view the admin list / admin resources.
     * Only admins may view admin accounts.
     */
    public function viewAdmin(User $user): bool
    {
        return $user->hasRole('admin');
    }
}