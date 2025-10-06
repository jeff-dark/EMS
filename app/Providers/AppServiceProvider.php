<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\{Course, Exam, Unit};
use App\Policies\{CoursePolicy, ExamPolicy, UnitPolicy};

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Registering the Policies here
        Course::class => CoursePolicy::class,
        Unit::class => UnitPolicy::class,
        Exam::class => ExamPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}