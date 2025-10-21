<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        // Eager-load role name when available to avoid N+1 on frontend
        if ($user && !$user->relationLoaded('role')) {
            $user->load('role');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'role' => $user?->role?->name,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'proctoring' => [
                'enabled' => (bool) config('proctoring.enabled'),
                'fullscreen_required' => (bool) config('proctoring.fullscreen_required'),
                'block_contextmenu' => (bool) config('proctoring.block_contextmenu'),
                'block_clipboard' => (bool) config('proctoring.block_clipboard'),
                'block_shortcuts' => (bool) config('proctoring.block_shortcuts'),
                'warn_on_violation' => (bool) config('proctoring.warn_on_violation'),
                'violation_threshold' => (int) config('proctoring.violation_threshold'),
                'disable_devtool' => (bool) config('proctoring.disable_devtool'),
                'nosleep' => (bool) config('proctoring.nosleep'),
                'env' => app()->environment(),
            ],
        ];
    }
}
