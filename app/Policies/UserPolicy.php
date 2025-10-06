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
        // Admins and Teachers can view any user.
        // Students can only view themselves (if $user->id === $model->id)
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
}