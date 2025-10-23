<?php

use App\Models\{Course, Exam, Role, Unit, User};
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

it('blocks starting an exam before the scheduled time with a friendly message', function () {
    $role = Role::query()->firstOrCreate(['name' => 'student']);
    $student = User::factory()->create(['role_id' => $role->id]);

    $course = Course::create(['name' => 'C1']);
    $unit = Unit::create(['course_id' => $course->id, 'title' => 'U1']);
    // Enroll student to unit
    $student->units()->attach($unit->id);

    $exam = Exam::create([
        'unit_id' => $unit->id,
        'title' => 'Scheduled Exam',
        'duration_minutes' => 30,
        'passing_score' => 50,
        'is_published' => true,
        'start_time' => Carbon::now()->addHour(),
    ]);

    actingAs($student);
    $resp = get(route('student.exams.start', $exam));
    $resp->assertRedirect(route('exams.index'));
    $resp->assertSessionHas('message', "The exam time hasn't reached yet.");
});

it('blocks starting an exam after the scheduled time with a missed message', function () {
    $role = Role::query()->firstOrCreate(['name' => 'student']);
    $student = User::factory()->create(['role_id' => $role->id]);

    $course = Course::create(['name' => 'C2']);
    $unit = Unit::create(['course_id' => $course->id, 'title' => 'U2']);
    $student->units()->attach($unit->id);

    $exam = Exam::create([
        'unit_id' => $unit->id,
        'title' => 'Past Exam',
        'duration_minutes' => 30,
        'passing_score' => 50,
        'is_published' => true,
        'start_time' => Carbon::now()->subHour(),
    ]);

    actingAs($student);
    $resp = get(route('student.exams.start', $exam));
    $resp->assertRedirect(route('exams.index'));
    $resp->assertSessionHas('message');
    expect(session('message'))
        ->toStartWith('The exam has already passed.')
        ->and(session('message'))
        ->toContain('missed');
});

it('allows starting only at the exact scheduled minute', function () {
    $role = Role::query()->firstOrCreate(['name' => 'student']);
    $student = User::factory()->create(['role_id' => $role->id]);

    $course = Course::create(['name' => 'C3']);
    $unit = Unit::create(['course_id' => $course->id, 'title' => 'U3']);
    $student->units()->attach($unit->id);

    // Align to current minute (drop seconds) to satisfy equality check
    $now = Carbon::now()->setSeconds(0);
    $exam = Exam::create([
        'unit_id' => $unit->id,
        'title' => 'Exact Time Exam',
        'duration_minutes' => 30,
        'passing_score' => 50,
        'is_published' => true,
        'start_time' => $now,
    ]);

    actingAs($student);
    $resp = get(route('student.exams.start', $exam));
    $resp->assertOk();
});
