<?php

namespace App\Mail;

use App\Models\ExamSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResultsUpdatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
    public function __construct(public ExamSession $session)
    {
    }
    public function build(): self
    {
        $session = $this->session->loadMissing('exam','user');
        return $this->subject('Your Exam Results Were Updated')
            ->view('emails.results_updated', ['session' => $session, 'exam' => $session->exam, 'student' => $session->user]);
    }
}
