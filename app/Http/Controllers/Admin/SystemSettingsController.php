<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SystemSettingsController extends Controller
{
    protected function ensureAdmin(): void
    {
        $user = Auth::user();
        if (!$user || !$user->hasRole('admin')) {
            abort(403);
        }
    }

    public function edit()
    {
        $this->ensureAdmin();
        $settings = SystemSetting::query()->first();
        return Inertia::render('Admins/SystemSettings', [
            'settings' => [
                'institution_name' => $settings->institution_name ?? '',
                'institution_logo_url' => $settings?->institution_logo_path ? (Storage::disk('public')->url($settings->institution_logo_path)) : null,
                'signatory_name' => $settings->signatory_name ?? '',
                'signatory_title' => $settings->signatory_title ?? '',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $this->ensureAdmin();

        $data = $request->validate([
            'institution_name' => 'nullable|string|max:255',
            'signatory_name' => 'nullable|string|max:255',
            'signatory_title' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
        ]);

        $settings = SystemSetting::query()->first() ?? new SystemSetting();

        if ($request->hasFile('logo')) {
            // delete old if exists
            if ($settings->institution_logo_path) {
                Storage::disk('public')->delete($settings->institution_logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $settings->institution_logo_path = $path;
        }

        $settings->institution_name = $data['institution_name'] ?? $settings->institution_name;
        $settings->signatory_name = $data['signatory_name'] ?? $settings->signatory_name;
        $settings->signatory_title = $data['signatory_title'] ?? $settings->signatory_title;
        $settings->save();

        return redirect()->route('admin.system-settings.edit')->with('status', 'Settings saved');
    }
}
