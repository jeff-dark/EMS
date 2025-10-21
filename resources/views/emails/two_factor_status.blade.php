<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Two-Factor Notification</title></head>
<body>
<h2>Two-Factor Authentication Update</h2>
<p>Hi {{ $user->name ?? 'User' }},</p>
<p>Your two-factor authentication status event: <strong>{{ ucfirst($event) }}</strong>.</p>
<p>If this wasn’t you, please secure your account immediately.</p>
<p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
