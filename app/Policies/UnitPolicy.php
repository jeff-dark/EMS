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
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->hasRole('admin') || $user->hasRole('teacher');
    }
}