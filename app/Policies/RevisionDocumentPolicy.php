<?php

namespace App\Policies;

use App\Models\RevisionDocument;
use App\Models\User;

class RevisionDocumentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole('admin','teacher','student');
    }

    /**
     * Determine whether the user can view the model (including inline view/download).
     */
    public function view(User $user, RevisionDocument $document): bool
    {
        if ($user->hasRole('admin')) return true;
        if ($user->hasRole('teacher')) {
            return (bool) $user->teacher?->units()->where('units.id', $document->unit_id)->exists();
        }
        if ($user->hasRole('student')) {
            return (bool) $user->units()->where('units.id', $document->unit_id)->exists();
        }
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole('admin','teacher');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RevisionDocument $document): bool
    {
        if ($user->hasRole('admin')) return true;
        return $user->hasRole('teacher')
            && $user->teacher
            && $document->teacher_id === $user->teacher->id;
    }
}
