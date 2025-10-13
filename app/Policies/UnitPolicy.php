<?php

namespace App\Policies;

use App\Models\{Unit, User};

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
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
        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
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