<?php

namespace App\Console\Commands;

use App\Mail\ExamReminderMail;
use App\Models\Exam;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;

class SendExamReminders extends Command
{
    protected $signature = 'exams:reminders {--hours=24 : Hours before start_time to remind} {--now : Send start-time reminders}';
    protected $description = 'Send reminders for upcoming or starting exams to enrolled students';

    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $sendNow = (bool) $this->option('now');
        $notifier = App::make(NotificationService::class);

        if ($sendNow) {
            // Exams starting within the next minute
            $from = now();
            $to = now()->addMinute();
            $exams = Exam::whereNotNull('start_time')->whereBetween('start_time', [$from, $to])->where('is_published', true)->get();
            foreach ($exams as $exam) {
                $students = \App\Models\User::whereHas('units', fn($q) => $q->where('units.id', $exam->unit_id))->get();
                foreach ($students as $s) {
                    if (!$s->email) continue;
                    $notifier->sendOnce('exam.reminder.now', Exam::class, $exam->id, new ExamReminderMail($exam, 'Starting Now'), $s->email, ['user_id' => $s->id]);
                }
            }
        } else {
            // Exams starting in exactly $hours from now (+/- 1 minute window)
            $target = now()->addHours($hours);
            $from = $target->copy()->subMinute();
            $to = $target->copy()->addMinute();
            $exams = Exam::whereNotNull('start_time')->whereBetween('start_time', [$from, $to])->where('is_published', true)->get();
            foreach ($exams as $exam) {
                $students = \App\Models\User::whereHas('units', fn($q) => $q->where('units.id', $exam->unit_id))->get();
                foreach ($students as $s) {
                    if (!$s->email) continue;
                    $notifier->sendOnce('exam.reminder.before', Exam::class, $exam->id, new ExamReminderMail($exam, $hours.' hours before'), $s->email, ['user_id' => $s->id]);
                }
            }
        }

        $this->info('Reminders processed.');
        return self::SUCCESS;
    }
}
