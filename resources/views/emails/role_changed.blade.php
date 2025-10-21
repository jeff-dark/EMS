<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Role Changed</title></head>
<body>
<h2>Your Account Role Changed</h2>
<p>Hi {{ $user->name ?? 'User' }},</p>
<p>Your account role has been updated from <strong>{{ $oldRole }}</strong> to <strong>{{ $newRole }}</strong>.</p>
<p>If you did not expect this change, please contact support.</p>
<p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
