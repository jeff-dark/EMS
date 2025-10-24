<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ExamSecurity
{
    public function handle(Request $request, Closure $next)
    {
        // Optionally set headers that discourage caching and embedding
        $response = $next($request);
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        return $response;
    }
}
