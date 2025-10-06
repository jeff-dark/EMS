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
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }
}