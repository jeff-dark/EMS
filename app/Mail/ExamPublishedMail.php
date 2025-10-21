<?php

namespace App\Mail;

use App\Models\Exam;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExamPublishedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Exam $exam)
    {
    }

    public function build(): self
    {
        $exam = $this->exam->loadMissing('unit.course');
        return $this->subject('New Exam Published: '.$exam->title)
            ->view('emails.exam_published', compact('exam'));
    }
}
