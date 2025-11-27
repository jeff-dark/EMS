<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Backfill end_time for exams that have a start_time but no end_time
        DB::table('exams')
            ->whereNotNull('start_time')
            ->whereNull('end_time')
            ->orderBy('id')
            ->chunkById(100, function ($exams) {
                foreach ($exams as $e) {
                    try {
                        $end = Carbon::parse($e->start_time)->addMinutes((int) $e->duration_minutes);
                        DB::table('exams')->where('id', $e->id)->update(['end_time' => $end->toDateTimeString()]);
                    } catch (\Throwable $err) {
                        // If parsing fails for a row, skip it and continue
                        continue;
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is a data backfill. Do not remove end_time values on rollback
        // to avoid deleting intentionally-set end_time values.
    }
};
