<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome</title>
</head>
<body>
  <h2>Welcome to the Online Exam System</h2>
  <p>Hi {{ $user->name ?? 'there' }},</p>
  <p>Your account has been created successfully. You can now log in and start using the platform.</p>
  <p><strong>Username:</strong> {{ $user->username ?? $user->email }}</p>
  <p>If you didn't request this, please contact support.</p>
  <p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
