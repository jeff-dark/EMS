<?php

namespace App\Policies;

use App\Models\{Course, User};

class CoursePolicy
{
    /**
     * Determine whether the user can manage (view, create, update, delete) courses.
     * We'll allow Teachers and Admins full access to manage the course structure.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function view(User $user, Course $course): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function update(User $user, Course $course): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function delete(User $user, Course $course): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }
}