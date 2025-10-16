<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ExamSession;

class ExamSessionPolicy
{
    public function viewAny(User $user)
    {
        // Only teachers and admins can view grading lists
        return $user->hasRole('teacher') || $user->hasRole('admin');
    }

    public function view(User $user, ExamSession $session)
    {
        // Students can view their own session
        if ($user->hasRole('student')) {
            return $session->user_id === $user->id;
        }

        // Admins can view all
        if ($user->hasRole('admin')) {
            return true;
        }

        // Teachers can only view sessions for exams under units they are assigned to
        if ($user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if (!$teacher) return false;
            $session->loadMissing('exam.unit', 'exam.teacher');
            $unitId = $session->exam?->unit?->id;
            $isUnitTeacher = $unitId && $teacher->units()->where('units.id', $unitId)->exists();
            $isExamOwner = $session->exam?->teacher?->id === $teacher->id;
            return (bool) ($isUnitTeacher || $isExamOwner);
        }

        return false;
    }
}
