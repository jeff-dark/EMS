<?php

namespace App\Observers;

use App\Mail\ExamResultsSubmittedMail;
use App\Models\ExamSession;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ExamSessionObserver
{
    public function updated(ExamSession $session): void
    {
        // Detect transition to graded state
        if ($session->wasChanged('is_graded') && $session->is_graded === true) {
            $student = $session->user;
            if ($student && $student->email) {
                try {
                    if (config('queue.default') === 'sync') {
                        Mail::to($student->email)->send(new ExamResultsSubmittedMail($session));
                    } else {
                        Mail::to($student->email)->queue(new ExamResultsSubmittedMail($session));
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to dispatch exam result email', [
                        'session_id' => $session->id,
                        'student_id' => $student->id,
                        'email' => $student->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }
}
