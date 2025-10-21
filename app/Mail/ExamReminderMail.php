<?php

namespace App\Mail;

use App\Models\Exam;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExamReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
    public function __construct(public Exam $exam, public string $timing)
    {
    }
    public function build(): self
    {
        $exam = $this->exam->loadMissing('unit.course');
        return $this->subject('Reminder: '.$exam->title.' ('.$this->timing.')')
            ->view('emails.exam_reminder', ['exam' => $exam, 'timing' => $this->timing]);
    }
}
