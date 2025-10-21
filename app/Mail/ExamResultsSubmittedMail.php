<?php

namespace App\Mail;

use App\Models\ExamSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExamResultsSubmittedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public ExamSession $session)
    {
    }

    public function build(): self
    {
        $exam = $this->session->exam;
        $student = $this->session->user;
        return $this
            ->subject('Your Exam Results Are Available')
            ->view('emails.exam_results_submitted', [
                'session' => $this->session,
                'exam' => $exam,
                'student' => $student,
            ]);
    }
}
