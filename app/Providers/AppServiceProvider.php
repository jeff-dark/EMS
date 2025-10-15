<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureTwoFactorFeatureEnabled;
use App\Models\{Course, Exam, Unit, User};
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
        // Register route middleware alias for two-factor feature check
        Route::aliasMiddleware('fortify.two-factor.enabled', EnsureTwoFactorFeatureEnabled::class);
    }
}