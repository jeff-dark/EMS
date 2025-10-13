<?php

namespace App\Policies;

use App\Models\{Exam, User};

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function view(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $exam->unit && $exam->unit->teachers()->where('teachers.id', $teacher->id)->exists();
        }
        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function update(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $exam->unit && $exam->unit->teachers()->where('teachers.id', $teacher->id)->exists();
        }
        return false;
    }

    public function delete(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            return $teacher && $exam->unit && $exam->unit->teachers()->where('teachers.id', $teacher->id)->exists();
        }
        return false;
    }
}