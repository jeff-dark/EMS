<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;

class PruneAuditLogs extends Command
{
    protected $signature = 'audit:prune {--days=}';
    protected $description = 'Prune audit logs older than retention period';

    public function handle(): int
    {
        $days = (int)($this->option('days') ?? config('audit.retention_days'));
        $cutoff = now()->subDays($days);
        $count = AuditLog::where('created_at', '<', $cutoff)->delete();
        $this->info("Pruned {$count} audit logs older than {$days} days.");
        return self::SUCCESS;
    }
}
