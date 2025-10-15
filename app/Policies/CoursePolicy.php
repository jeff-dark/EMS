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
        // Allow students to access the index; controller will filter results to enrolled courses
        return $user->hasRole('admin') || $user->hasRole('teacher') || $user->hasRole('student');
    }

    public function view(User $user, Course $course): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $course->units()->whereHas('teachers', function ($q) use ($teacher) {
                $q->where('teachers.id', $teacher->id);
            })->exists();
        }
        if ($user->hasRole('student')) {
            // Students can view courses they are enrolled in
            return $user->courses()->where('courses.id', $course->id)->exists();
        }
        return false;
    }

    public function create(User $user): bool
    {
        // Only admins can create courses
        return $user->hasRole('admin');
    }

    public function update(User $user, Course $course): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $course->units()->whereHas('teachers', function ($q) use ($teacher) {
                $q->where('teachers.id', $teacher->id);
            })->exists();
        }
        return false;
    }

    public function delete(User $user, Course $course): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $course->units()->whereHas('teachers', function ($q) use ($teacher) {
                $q->where('teachers.id', $teacher->id);
            })->exists();
        }
        return false;
    }
}