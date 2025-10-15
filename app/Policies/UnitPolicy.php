<?php

namespace App\Policies;

use App\Models\{Unit, User};

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        // Allow students to reach the index; controller will further filter by enrollment
        return $user->hasRole('admin') || $user->hasRole('teacher') || $user->hasRole('student');
    }

    public function view(User $user, Unit $unit): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $unit->teachers()->where('teachers.id', $teacher->id)->exists();
        }
        if ($user->hasRole('student')) {
            // Students may view units only if the unit belongs to a course they are enrolled in
            $unit->loadMissing('course');
            return $unit->course && $user->courses()->where('courses.id', $unit->course->id)->exists();
        }
        return false;
    }

    public function create(User $user): bool
    {
        // Only admins can create units
        return $user->hasRole('admin');
    }

    public function update(User $user, Unit $unit): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $unit->teachers()->where('teachers.id', $teacher->id)->exists();
        }
        return false;
    }

    public function delete(User $user, Unit $unit): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $unit->teachers()->where('teachers.id', $teacher->id)->exists();
        }
        return false;
    }
}