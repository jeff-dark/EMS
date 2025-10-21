<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\{
    UserRegisteredMail,
    AccountDeletedMail,
    ExamResultsSubmittedMail,
    ExamSubmittedMail,
    ExamPublishedMail,
    ExamReminderMail,
    ResultsUpdatedMail,
    RoleChangedMail,
    EnrollmentChangedMail,
    TwoFactorStatusMail
};
use App\Models\{User, Role, Course, Unit, Exam, ExamSession};

class SendAllTestEmails extends Command
{
    protected $signature = 'mail:test-all {to : Recipient email}';
    protected $description = 'Send all implemented notification emails to the specified recipient for verification';

    public function handle(): int
    {
        $to = (string) $this->argument('to');
        $this->info('Mailer: '.config('mail.default'));
        $this->info('Sending all test emails to: '.$to);

        try {
            // Ensure roles exist
            $studentRole = Role::firstOrCreate(['name' => 'student']);

            // Create sample entities (idempotent-ish by unique names)
            $course = Course::firstOrCreate(['name' => 'Test Course for Emails']);
            $unit = Unit::firstOrCreate(['course_id' => $course->id, 'title' => 'Test Unit for Emails'], ['order' => 1]);

            $student = User::firstOrCreate(
                ['email' => 'test-student@example.com'],
                [
                    'name' => 'Test Student',
                    'username' => 'test_student_'.uniqid(),
                    'password' => bcrypt('password1234'),
                    'role_id' => $studentRole->id,
                ]
            );
            // attach enrollment
            $student->courses()->syncWithoutDetaching([$course->id]);
            $student->units()->syncWithoutDetaching([$unit->id]);

            $exam = Exam::firstOrCreate(
                ['unit_id' => $unit->id, 'title' => 'Test Exam Notifications'],
                [
                    'duration_minutes' => 60,
                    'passing_score' => 50,
                    'is_published' => true,
                    'start_time' => now()->addHour(),
                    'end_time' => now()->addHours(2),
                ]
            );

            $session = ExamSession::firstOrCreate(
                ['exam_id' => $exam->id, 'user_id' => $student->id],
                [
                    'started_at' => now()->subMinutes(10),
                    'submitted_at' => now()->subMinutes(5),
                    'score' => 75,
                    'is_graded' => true,
                    'teacher_comment' => 'Great work on the exam!',
                ]
            );

            // Send each mailable to the provided address
            $this->line(' - UserRegisteredMail');
            Mail::to($to)->send(new UserRegisteredMail($student));

            $this->line(' - AccountDeletedMail');
            Mail::to($to)->send(new AccountDeletedMail('Test User'));

            $this->line(' - ExamResultsSubmittedMail');
            Mail::to($to)->send(new ExamResultsSubmittedMail($session));

            $this->line(' - ExamSubmittedMail');
            Mail::to($to)->send(new ExamSubmittedMail($session));

            $this->line(' - ExamPublishedMail');
            Mail::to($to)->send(new ExamPublishedMail($exam));

            $this->line(' - ExamReminderMail (24 hours before)');
            Mail::to($to)->send(new ExamReminderMail($exam, '24 hours before'));

            $this->line(' - ExamReminderMail (Starting now)');
            Mail::to($to)->send(new ExamReminderMail($exam, 'Starting now'));

            $this->line(' - ResultsUpdatedMail');
            Mail::to($to)->send(new ResultsUpdatedMail($session));

            $this->line(' - RoleChangedMail');
            Mail::to($to)->send(new RoleChangedMail($student, 'student', 'teacher'));

            $this->line(' - EnrollmentChangedMail');
            Mail::to($to)->send(new EnrollmentChangedMail($student, ['Course A', 'Course B'], ['Course C']));

            $this->line(' - TwoFactorStatusMail (enabled)');
            Mail::to($to)->send(new TwoFactorStatusMail($student, 'enabled'));

            $this->line(' - TwoFactorStatusMail (disabled)');
            Mail::to($to)->send(new TwoFactorStatusMail($student, 'disabled'));

            $this->line(' - TwoFactorStatusMail (confirmed)');
            Mail::to($to)->send(new TwoFactorStatusMail($student, 'confirmed'));

            $this->line(' - TwoFactorStatusMail (failed)');
            Mail::to($to)->send(new TwoFactorStatusMail($student, 'failed'));

            $this->line(' - TwoFactorStatusMail (verified)');
            Mail::to($to)->send(new TwoFactorStatusMail($student, 'verified'));

            $this->info('All test emails dispatched.');
            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Failed while sending test emails: '.$e->getMessage());
            return self::FAILURE;
        }
    }
}
