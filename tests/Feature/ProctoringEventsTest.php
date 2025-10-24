<?php

use App\Models\{Role, User, Exam, Unit, Course, ExamSession, ProctorEvent};
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeStudent(): User {
    $studentRole = Role::create(['name' => 'student']);
    return User::factory()->create(['role_id' => $studentRole->id]);
}

function makeAdmin(): User {
    $adminRole = Role::create(['name' => 'admin']);
    return User::factory()->create(['role_id' => $adminRole->id]);
}

function makeExamFor(User $student): array {
    $course = Course::create(['name' => 'Course A']);
    $unit = Unit::create(['course_id' => $course->id, 'title' => 'Unit 1', 'order' => 1]);
    $exam = Exam::create(['unit_id' => $unit->id, 'title' => 'Midterm', 'duration_minutes' => 60, 'is_published' => true]);
    $session = ExamSession::create(['exam_id' => $exam->id, 'user_id' => $student->id, 'started_at' => now()]);
    return [$exam, $session];
}

it('records a proctoring event from a student during an active session', function () {
    $student = makeStudent();
    [, $session] = makeExamFor($student);

    $this->actingAs($student)
        ->postJson("/sessions/{$session->id}/proctor-events", [
            'type' => 'window_blur',
            'details' => ['foo' => 'bar'],
        ])->assertOk();

    $this->assertDatabaseHas('proctor_events', [
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'type' => 'window_blur',
    ]);
});

// Note: Rendering the Inertia page in tests requires a built Vite manifest.
// We validate the API write path above; the UI is covered by E2E/browser-level checks.
