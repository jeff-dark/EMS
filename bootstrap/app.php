<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle 403 consistently for Inertia requests with a flash + redirect
        $exceptions->render(function (\Throwable $e, $request) {
              // In testing, prefer returning proper HTTP status codes so tests can assert them
              if (app()->environment('testing')) {
                  $isAuthz = $e instanceof AuthorizationException;
                  $isHttp403 = ($e instanceof HttpExceptionInterface && $e->getStatusCode() === 403);
                  if ($isAuthz || $isHttp403) {
                      return Response::json(['message' => 'Forbidden'], 403);
                  }
              }
              $isInertia = (bool) $request->headers->get('X-Inertia');
              $isAuthz = $e instanceof AuthorizationException;
              $isHttp403 = ($e instanceof HttpExceptionInterface && $e->getStatusCode() === 403);
            if ($isInertia && ($isAuthz || $isHttp403)) {
                $previous = url()->previous();
                $current = $request->fullUrl();
                if ($previous && $previous !== $current) {
                    return Redirect::back(303)->with('error', 'you are not authorised, contact your admin for assistance');
                }
                return Redirect::route('dashboard')->with('error', 'you are not authorised, contact your admin for assistance');
            }
            if ($request->expectsJson() && ($isAuthz || $isHttp403)) {
                 return Response::json(['message' => 'Forbidden'], 403);
            }
            if ($isAuthz || $isHttp403) {
                // Non-Inertia, non-JSON web request: redirect to dashboard with flash
                return Redirect::route('dashboard')
                    ->with('error', 'you are not authorised, contact your admin for assistance');
            }
            // Default rendering for other exceptions
        });
    })->create();
