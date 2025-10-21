<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExamSecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Strengthen page security to reduce trivial cheating vectors
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'no-referrer');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        $response->headers->set('Permissions-Policy', "geolocation=(), camera=(), microphone=(), interest-cohort=()");

        // Light CSP to disallow embedding and plugins; allow inline styles for UI libs
        $csp = "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; frame-ancestors 'none'; object-src 'none'";
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
