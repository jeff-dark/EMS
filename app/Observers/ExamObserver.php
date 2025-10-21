<?php

namespace App\Observers;

use App\Mail\ExamPublishedMail;
use App\Models\Exam;
use App\Services\NotificationService;
use Illuminate\Support\Facades\App;

class ExamObserver
{
    public function updated(Exam $exam): void
    {
        if ($exam->wasChanged('is_published') && $exam->is_published) {
            // Notify all students enrolled in the unit's course
            $exam->loadMissing('unit.students');
            $students = optional($exam->unit)->students ?? collect();
            // If Unit doesn't have students relation, fall back to users enrolled to unit via pivot student_unit
            if (method_exists($exam->unit, 'students')) {
                $students = $exam->unit->students;
            } else {
                $students = \App\Models\User::whereHas('units', fn($q) => $q->where('units.id', $exam->unit_id))->get();
            }
            $notifier = App::make(NotificationService::class);
            foreach ($students as $student) {
                if (!$student->email) continue;
                $notifier->sendOnce('exam.published', Exam::class, $exam->id, new ExamPublishedMail($exam), $student->email, [
                    'user_id' => $student->id,
                ]);
            }
        }
    }
}
