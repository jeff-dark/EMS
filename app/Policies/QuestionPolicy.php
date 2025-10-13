<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Question;

class QuestionPolicy
{
    public function before(User $user)
    {
        // Allow admins full access
        if ($user->hasRole('admin')) {
            return true;
        }
    }

    public function viewAny(User $user)
    {
        return $user->hasRole('teacher');
    }

    public function view(User $user, Question $question)
    {
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $question->loadMissing('exam.unit.teachers');
            return $teacher && $question->exam && $question->exam->unit && $question->exam->unit->teachers->contains('id', $teacher->id);
        }
        return false;
    }

    public function create(User $user)
    {
        return $user->hasRole('teacher');
    }

    public function update(User $user, Question $question)
    {
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $question->loadMissing('exam.unit.teachers');
            return $teacher && $question->exam && $question->exam->unit && $question->exam->unit->teachers->contains('id', $teacher->id);
        }
        return false;
    }

    public function delete(User $user, Question $question)
    {
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $question->loadMissing('exam.unit.teachers');
            return $teacher && $question->exam && $question->exam->unit && $question->exam->unit->teachers->contains('id', $teacher->id);
        }
        return false;
    }
}
