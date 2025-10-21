<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EnrollmentChangedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
    public function __construct(public User $student, public array $coursesAdded = [], public array $coursesRemoved = [])
    {
    }
    public function build(): self
    {
        return $this->subject('Your Course Enrollment Changed')
            ->view('emails.enrollment_changed', [
                'student' => $this->student,
                'coursesAdded' => $this->coursesAdded,
                'coursesRemoved' => $this->coursesRemoved,
            ]);
    }
}
