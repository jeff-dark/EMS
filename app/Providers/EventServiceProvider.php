<?php

namespace App\Providers;

use App\Listeners\LogAuthEvents;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use Laravel\Fortify\Events\TwoFactorAuthenticationEnabled;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;
use Laravel\Fortify\Events\TwoFactorAuthenticationChallenged;
use Laravel\Fortify\Events\TwoFactorAuthenticationFailed;
use Laravel\Fortify\Events\ValidTwoFactorAuthenticationCodeProvided;
use Laravel\Fortify\Events\RecoveryCodesGenerated;
use Laravel\Fortify\Events\RecoveryCodeReplaced;

class EventServiceProvider extends ServiceProvider
{
    /**
     * We register listeners imperatively in boot to call specific methods on the subscriber class.
     * Leaving $listen empty avoids accidental duplicate handling across Laravel versions.
     */
    protected $listen = [];

    public function boot(): void
    {
        Event::listen(Login::class, [LogAuthEvents::class, 'onLogin']);
        Event::listen(Logout::class, [LogAuthEvents::class, 'onLogout']);
        Event::listen(Failed::class, [LogAuthEvents::class, 'onFailed']);
        Event::listen(Lockout::class, [LogAuthEvents::class, 'onLockout']);
        Event::listen(PasswordReset::class, [LogAuthEvents::class, 'onPasswordReset']);
        Event::listen(Registered::class, [LogAuthEvents::class, 'onRegistered']);

        // Two-factor events from Fortify
        Event::listen(TwoFactorAuthenticationEnabled::class, [LogAuthEvents::class, 'onTwoFactorEnabled']);
        Event::listen(TwoFactorAuthenticationDisabled::class, [LogAuthEvents::class, 'onTwoFactorDisabled']);
        Event::listen(TwoFactorAuthenticationConfirmed::class, [LogAuthEvents::class, 'onTwoFactorConfirmed']);
        Event::listen(TwoFactorAuthenticationChallenged::class, [LogAuthEvents::class, 'onTwoFactorChallenged']);
        Event::listen(TwoFactorAuthenticationFailed::class, [LogAuthEvents::class, 'onTwoFactorFailed']);
        Event::listen(ValidTwoFactorAuthenticationCodeProvided::class, [LogAuthEvents::class, 'onTwoFactorVerified']);
        Event::listen(RecoveryCodesGenerated::class, [LogAuthEvents::class, 'onTwoFactorRecoveryCodesGenerated']);
        Event::listen(RecoveryCodeReplaced::class, [LogAuthEvents::class, 'onTwoFactorRecoveryCodeReplaced']);
    }
}
