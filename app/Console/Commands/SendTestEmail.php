<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmail extends Command
{
    protected $signature = 'mail:test {to? : Email address to send to (defaults to APP mail from)} {--queued : Queue the email instead of sending immediately}';
    protected $description = 'Send a test email using the current mail configuration';

    public function handle(): int
    {
        $to = $this->argument('to') ?: config('mail.from.address');
        if (!$to) {
            $this->error('No recipient specified and MAIL_FROM_ADDRESS is not set.');
            return self::FAILURE;
        }

        $this->info('Mailer: '.config('mail.default'));
        $this->info('Sending test email to: '.$to);

        try {
            $send = function () use ($to) {
                Mail::raw('This is a CLI test email from '.config('app.name').'.', function ($m) use ($to) {
                    $m->to($to)->subject('CLI Test Email');
                });
            };

            if ($this->option('queued')) {
                // Use a lightweight queued mailable
                Mail::to($to)->queue(new class extends \Illuminate\Mail\Mailable implements \Illuminate\Contracts\Queue\ShouldQueue {
                    public function build(): self { return $this->subject('CLI Test Email (Queued)')->text('emails.plain_test'); }
                });
                $this->info('Queued test email. Make sure a queue worker is running.');
            } else {
                $send();
                $this->info('Sent test email synchronously.');
            }
            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Failed to send test email: '.$e->getMessage());
            return self::FAILURE;
        }
    }
}
