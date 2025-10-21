<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountDeletedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public string $name)
    {
    }

    public function build(): self
    {
        return $this
            ->subject('Your Account Has Been Deleted')
            ->view('emails.account_deleted', [
                'name' => $this->name,
            ]);
    }
}
