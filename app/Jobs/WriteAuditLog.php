<?php

namespace App\Jobs;

use App\Models\AuditLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class WriteAuditLog implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** @var array<string,mixed> */
    public array $payload;

    /**
     * Create a new job instance.
     * @param array<string,mixed> $payload
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
        $this->onQueue('audit');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Guard against mass assignment issues; model has fillable set
        AuditLog::create($this->payload);
    }
}
