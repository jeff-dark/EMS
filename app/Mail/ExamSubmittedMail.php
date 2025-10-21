<?php

namespace App\Mail;

use App\Models\ExamSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExamSubmittedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ExamSession $session)
    {
    }

    public function build(): self
    {
        $session = $this->session->loadMissing('exam', 'user');
        return $this
            ->subject('Exam Submission Confirmation')
            ->view('emails.exam_submitted', [
                'session' => $session,
                'exam' => $session->exam,
                'student' => $session->user,
            ]);
    }
}
