<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ExamSession;

class ExamSessionPolicy
{
    public function view(User $user, ExamSession $session)
    {
        // Students can view their own session; teachers/admins can view all
        if ($user->hasRole('student')) {
            return $session->user_id === $user->id;
        }

        return $user->hasRole('teacher') || $user->hasRole('admin');
    }
}
