<?php

namespace App\Providers;

use App\Models\{Course, Exam, Unit, User, Question, ExamSession};
use App\Policies\{CoursePolicy, ExamPolicy, UnitPolicy, UserPolicy, QuestionPolicy, ExamSessionPolicy};
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // --- CONTENT MANAGEMENT POLICIES ---
        // Teachers and Admins can manage these
        Course::class => CoursePolicy::class,
        Unit::class => UnitPolicy::class,
        Exam::class => ExamPolicy::class,
    Question::class => QuestionPolicy::class,
    ExamSession::class => ExamSessionPolicy::class,
        
        // --- USER MANAGEMENT POLICY ---
        // Admins and Teachers can manage users. Students are restricted to self-management.
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Define an "Admin" Gate for simple checks anywhere in the app
        // Although policies are preferred, gates are sometimes useful.
        // Gate::define('is-admin', function (User $user) {
        //     return $user->hasRole('admin');
        // });
        
        // Note: Gate definitions go here if you decide to use them.
    }
}