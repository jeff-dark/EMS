<?php

namespace App\Console;

use App\Console\Commands\PruneAuditLogs;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('audit:prune')->dailyAt('03:30');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}
