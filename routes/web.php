<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AdminController, Controller, CourseController, DashboardController, ExamController, StudentsController, TeacherController, UnitController};
use FFI\CData;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/students', [StudentsController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentsController::class, 'store'])->name('students.store');
    Route::get('/students/create', [StudentsController::class, 'create'])->name('students.create');
    Route::get('/students/{student}/edit', [StudentsController::class, 'edit'])->name('students.edit');
    Route::put('/students/{student}', [StudentsController::class, 'update'])->name('students.update');
    Route::delete('/students/create', [StudentsController::class, 'create'])->name('students.create');

    Route::get('/teachers', [TeacherController::class, 'index'])->name('teachers.index');
    Route::post('/teachers', [TeacherController::class, 'store'])->name('teachers.store');
    Route::get('/teachers/create', [TeacherController::class, 'create'])->name('teachers.create');
    Route::get('/teachers/{teacher}/edit', [TeacherController::class, 'edit'])->name('teachers.edit');
    Route::put('/teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');
    Route::delete('/teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy');

    Route::get('/admins', [App\Http\Controllers\AdminController::class, 'index'])->name('admins.index');
    Route::post('/admins', [App\Http\Controllers\AdminController::class, 'store'])->name('admins.store');
    Route::get('/admins/create', [App\Http\Controllers\AdminController::class, 'create'])->name('admins.create');
    Route::get('/admins/{admin}/edit', [App\Http\Controllers\AdminController::class, 'edit'])->name('admins.edit');
    Route::put('/admins/{admin}', [App\Http\Controllers\AdminController::class, 'update'])->name('admins.update');
    Route::delete('/admins/{admin}', [App\Http\Controllers\AdminController::class, 'destroy'])->name('admins.destroy');

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

    Route::get('/exams', [ExamController::class, 'index'])->name('courses.units.exams.index');
    Route::get('/courses/{course}/units/{unit}/exams', [ExamController::class, 'index'])->name('courses.units.exams.index');
    Route::get('/courses/{course}/units/{unit}/exams/create', [ExamController::class, 'create'])->name('courses.units.exams.create');
    Route::post('/courses/{course}/units/{unit}/exams', [ExamController::class, 'store'])->name('courses.units.exams.store');
    Route::get('/courses/{course}/units/{unit}/exams/{exam}/edit', [ExamController::class, 'edit'])->name('courses.units.exams.edit');
    Route::put('/courses/{course}/units/{unit}/exams/{exam}', [ExamController::class, 'update'])->name('courses.units.exams.update');
    Route::delete('/courses/{course}/units/{unit}/exams/{exam}', [ExamController::class, 'destroy'])->name('courses.units.exams.destroy');

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
