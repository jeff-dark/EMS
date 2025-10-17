<?php

namespace App\Providers;

use App\Models\{Course, Exam, Unit, User, Question, ExamSession, AuditLog};
use App\Policies\{CoursePolicy, ExamPolicy, UnitPolicy, UserPolicy, QuestionPolicy, ExamSessionPolicy, AuditLogPolicy};
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
    AuditLog::class => AuditLogPolicy::class,
        
        // --- USER MANAGEMENT POLICY ---
        // Admins and Teachers can manage users. Students are restricted to self-management.
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Note: Gate definitions can be placed here if you decide to use them.
    }
}