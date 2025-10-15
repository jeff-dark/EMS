<?php

namespace App\Http\Controllers\Settings;

use Laravel\Fortify\Features;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User as AppUser;
use Inertia\{Inertia, Response};

class TwoFactorAuthenticationController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // Conditionally assign the password.confirm middleware to the `show` action
        if (Features::enabled(Features::twoFactorAuthentication()) &&
            Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')) {
            $this->middleware('password.confirm')->only('show');
        }
    }

    /**
     * Show the user's two-factor authentication settings page.
     */
    /**
     * Show the user's two-factor authentication settings page.
     */
    public function show(TwoFactorAuthenticationRequest $request): Response
    {
        $request->ensureStateIsValid();
        $authUser = Auth::user();
        $twoFactorEnabled = $authUser instanceof AppUser
            ? $authUser->hasEnabledTwoFactorAuthentication()
            : false;

        return Inertia::render('settings/two-factor', [
            'twoFactorEnabled' => $twoFactorEnabled,
            'requiresConfirmation' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
        ]);
    }
}
