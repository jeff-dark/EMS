<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TwoFactorStatusMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
    public function __construct(public User $user, public string $event)
    {
    }
    public function build(): self
    {
        $subjectMap = [
            'enabled' => 'Two-Factor Authentication Enabled',
            'disabled' => 'Two-Factor Authentication Disabled',
            'confirmed' => 'Two-Factor Authentication Confirmed',
            'failed' => 'Two-Factor Authentication Failed',
            'verified' => 'Two-Factor Authentication Verified',
        ];
        $subject = $subjectMap[$this->event] ?? 'Two-Factor Notification';
        return $this->subject($subject)
            ->view('emails.two_factor_status', ['user' => $this->user, 'event' => $this->event]);
    }
}
