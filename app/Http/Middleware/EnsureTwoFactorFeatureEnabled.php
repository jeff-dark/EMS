<?php

namespace App\Http\Middleware;

use Closure;
use Laravel\Fortify\Features;

class EnsureTwoFactorFeatureEnabled
{
    /**
     * Handle an incoming request.
     */
    public function handle($request, Closure $next)
    {
        if (!Features::enabled(Features::twoFactorAuthentication())) {
            abort(403);
        }

        return $next($request);
    }
}
