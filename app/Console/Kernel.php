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
        // 24-hour reminders: run hourly and catch exams starting ~24h later
        $schedule->command('exams:reminders --hours=24')->hourly();
        // Start-time reminders: run every minute
        $schedule->command('exams:reminders --now')->everyMinute();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}
