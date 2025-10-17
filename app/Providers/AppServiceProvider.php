<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureTwoFactorFeatureEnabled;
use App\Http\Middleware\LogSensitiveView;
use App\Models\{Course, Exam, Unit, User, Question, ExamSession, Role, Teacher, TeacherUnitAssignment, StudentAnswer, QuestionAnswer};
use App\Observers\GenericCrudObserver;
use App\Policies\{CoursePolicy, ExamPolicy, UnitPolicy, UserPolicy};

class AppServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    // Note: policies are registered in AuthServiceProvider, not here. Left intentionally empty.
    protected $policies = [];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
    // Register route middleware aliases
    Route::aliasMiddleware('fortify.two-factor.enabled', EnsureTwoFactorFeatureEnabled::class);
    Route::aliasMiddleware('audit.view', LogSensitiveView::class);

        // Register model observers for CRUD auditing
        Course::observe(GenericCrudObserver::class);
        Unit::observe(GenericCrudObserver::class);
        Exam::observe(GenericCrudObserver::class);
        Question::observe(GenericCrudObserver::class);
        ExamSession::observe(GenericCrudObserver::class);
        User::observe(GenericCrudObserver::class);
        if (class_exists(Role::class)) {
            Role::observe(GenericCrudObserver::class);
        }
        if (class_exists(Teacher::class)) {
            Teacher::observe(GenericCrudObserver::class);
        }
        if (class_exists(TeacherUnitAssignment::class)) {
            TeacherUnitAssignment::observe(GenericCrudObserver::class);
        }
        if (class_exists(StudentAnswer::class)) {
            StudentAnswer::observe(GenericCrudObserver::class);
        }
        if (class_exists(QuestionAnswer::class)) {
            QuestionAnswer::observe(GenericCrudObserver::class);
        }
    }
}