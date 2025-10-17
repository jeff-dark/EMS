<?php

namespace App\Providers;

use App\Listeners\LogAuthEvents;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [
            [LogAuthEvents::class, 'onLogin'],
        ],
        Logout::class => [
            [LogAuthEvents::class, 'onLogout'],
        ],
        Failed::class => [
            [LogAuthEvents::class, 'onFailed'],
        ],
        Lockout::class => [
            [LogAuthEvents::class, 'onLockout'],
        ],
        PasswordReset::class => [
            [LogAuthEvents::class, 'onPasswordReset'],
        ],
    ];
}
