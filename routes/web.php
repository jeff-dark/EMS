<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AdminController, Controller, CourseController, DashboardController, ExamController, StudentsController, TeacherController, UnitController};
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Ensure nested implicit bindings are scoped to their parent route parameters
    Route::scopeBindings();
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/students', [StudentsController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentsController::class, 'store'])->name('students.store');
    Route::get('/students/create', [StudentsController::class, 'create'])->name('students.create');
    Route::get('/students/{student}/edit', [StudentsController::class, 'edit'])->name('students.edit');
    Route::put('/students/{student}', [StudentsController::class, 'update'])->name('students.update');
    Route::post('/students/{student}/reset-password', [StudentsController::class, 'resetPassword'])->name('students.reset-password');
    // Correct destroy route for students
    Route::delete('/students/{student}', [StudentsController::class, 'destroy'])->name('students.destroy');

    // Teacher management (new Teacher model & assignments)
    Route::get('/teachers', [TeacherController::class, 'index'])->name('teachers.index');
    Route::get('/teachers/create', [TeacherController::class, 'create'])->name('teachers.create');
    Route::post('/teachers', [TeacherController::class, 'store'])->name('teachers.store');
    Route::get('/teachers/{teacher}/edit', [TeacherController::class, 'edit'])->name('teachers.edit');
    Route::put('/teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');
    Route::delete('/teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy');
    Route::post('/teachers/{teacher}/reset-password', [TeacherController::class, 'resetPassword'])->name('teachers.reset-password');
    // Reports
    Route::get('/teachers/{teacher}/load-report', [TeacherController::class, 'loadReport'])->name('teachers.load');
    Route::get('/courses/{course}/teacher-assignments', [TeacherController::class, 'courseAssignments'])->name('courses.teacher.assignments');
    Route::get('/units/{unit}/teacher-assignments', [TeacherController::class, 'unitAssignments'])->name('units.teacher.assignments');

    Route::get('/admins', [App\Http\Controllers\AdminController::class, 'index'])->name('admins.index');
    Route::post('/admins', [App\Http\Controllers\AdminController::class, 'store'])->name('admins.store');
    Route::get('/admins/create', [App\Http\Controllers\AdminController::class, 'create'])->name('admins.create');
    Route::get('/admins/{admin}/edit', [App\Http\Controllers\AdminController::class, 'edit'])->name('admins.edit');
    Route::put('/admins/{admin}', [App\Http\Controllers\AdminController::class, 'update'])->name('admins.update');
    Route::delete('/admins/{admin}', [App\Http\Controllers\AdminController::class, 'destroy'])->name('admins.destroy');
    Route::post('/admins/{admin}/reset-password', [App\Http\Controllers\AdminController::class, 'resetPassword'])->name('admins.reset-password');

    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
    Route::get('/courses/create', [CourseController::class, 'create'])->name('courses.create');
    Route::get('/courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
    Route::put('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
    Route::delete('/courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');

    Route::get('/courses/{course}/units', [UnitController::class, 'index'])->name('units.index');
    Route::get('/courses/{course}/units/create', [UnitController::class, 'create'])->name('units.create');
    Route::post('/courses/{course}/units', [UnitController::class, 'store'])->name('units.store');
    Route::get('/courses/{course}/units/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit');
    Route::put('/courses/{course}/units/{unit}', [UnitController::class, 'update'])->name('units.update');
    Route::delete('/courses/{course}/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
    
    Route::get('/courses/{course}/units/{unit}/exams', [ExamController::class, 'index'])->name('courses.units.exams.index');
    Route::get('/courses/{course}/units/{unit}/exams/create', [ExamController::class, 'create'])->name('courses.units.exams.create');
    Route::post('/courses/{course}/units/{unit}/exams', [ExamController::class, 'store'])->name('courses.units.exams.store');
    Route::get('/courses/{course}/units/{unit}/exams/{exam}/edit', [ExamController::class, 'edit'])->name('courses.units.exams.edit');
    Route::put('/courses/{course}/units/{unit}/exams/{exam}', [ExamController::class, 'update'])->name('courses.units.exams.update');
    Route::delete('/courses/{course}/units/{unit}/exams/{exam}', [ExamController::class, 'destroy'])->name('courses.units.exams.destroy');

    // Question management (teachers/admins)
    Route::get('/exams/{exam}/questions', [App\Http\Controllers\QuestionController::class, 'index'])->middleware('audit.view:view')->name('exams.questions.index');
    Route::get('/exams/{exam}/questions/create', [App\Http\Controllers\QuestionController::class, 'create'])->name('exams.questions.create');
    Route::post('/exams/{exam}/questions', [App\Http\Controllers\QuestionController::class, 'store'])->name('exams.questions.store');
    Route::get('/exams/{exam}/questions/{question}/edit', [App\Http\Controllers\QuestionController::class, 'edit'])->name('exams.questions.edit');
    Route::put('/exams/{exam}/questions/{question}', [App\Http\Controllers\QuestionController::class, 'update'])->name('exams.questions.update');
    Route::delete('/exams/{exam}/questions/{question}', [App\Http\Controllers\QuestionController::class, 'destroy'])->name('exams.questions.destroy');

    // Student exam flow
    Route::get('/exams/{exam}/start', [App\Http\Controllers\StudentExamController::class, 'start'])->name('student.exams.start');
    Route::post('/sessions/{session}/answer', [App\Http\Controllers\StudentExamController::class, 'answer'])->name('student.sessions.answer');
    Route::post('/sessions/{session}/answers/bulk', [App\Http\Controllers\StudentExamController::class, 'bulkAnswer'])->name('student.sessions.answers.bulk');
    Route::post('/sessions/{session}/submit', [App\Http\Controllers\StudentExamController::class, 'submit'])->name('student.sessions.submit');
    Route::get('/student/results', [App\Http\Controllers\StudentExamController::class, 'results'])->name('student.results');

    // Grading routes (teachers)
    Route::get('/grading/exams/submitted', [App\Http\Controllers\GradingController::class, 'index'])->name('grading.index');
    Route::get('/grading/session/{session}', [App\Http\Controllers\GradingController::class, 'session'])->middleware('audit.view:view')->name('grading.session');
    Route::post('/grading/session/{session}/grade', [App\Http\Controllers\GradingController::class, 'grade'])->name('grading.grade');

    // Top-level exams listing (all exams across units/courses)
    Route::get('/exams', [ExamController::class, 'allExamsIndex'])->name('exams.index');
    Route::get('/exams/{exam}/create', [ExamController::class, 'create'])->name('exams.create');
    Route::post('/exams', [ExamController::class, 'store'])->name('exams.store');
    Route::get('/exams/{exam}/edit', [ExamController::class, 'edit'])->name('exams.edit');
    Route::put('/exams/{exam}', [ExamController::class, 'update'])->name('exams.update');
    Route::delete('/exams/{exam}', [ExamController::class, 'destroy'])->name('exams.destroy');
    // Admin logs viewer
    Route::get('/admin/logs', [App\Http\Controllers\Admin\LogController::class, 'index'])->name('admin.logs.index');
    Route::get('/admin/logs/export', [App\Http\Controllers\Admin\LogController::class, 'export'])->name('admin.logs.export');


});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
