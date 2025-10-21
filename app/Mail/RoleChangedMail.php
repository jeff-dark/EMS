<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RoleChangedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
    public function __construct(public User $user, public string $oldRole, public string $newRole)
    {
    }
    public function build(): self
    {
        return $this->subject('Your Account Role Changed')
            ->view('emails.role_changed', ['user' => $this->user, 'oldRole' => $this->oldRole, 'newRole' => $this->newRole]);
    }
}
