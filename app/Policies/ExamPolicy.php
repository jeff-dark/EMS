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
        if ($user->hasRole('student')) {
            $exam->loadMissing('unit.course');
            $courseId = $exam->unit?->course?->id;
            if (!$courseId) {
                return false;
            }
            // Student must be enrolled and exam should be published and within time window
            $enrolled = $user->courses()->where('courses.id', $courseId)->exists();
            if (!$enrolled) {
                return false;
            }
            $now = \now();
            if (!$exam->is_published) {
                return false;
            }
            if (!is_null($exam->start_time) && $exam->start_time->gt($now)) {
                return false;
            }
            if (!is_null($exam->end_time) && $exam->end_time->lt($now)) {
                return false;
            }
            return true;
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