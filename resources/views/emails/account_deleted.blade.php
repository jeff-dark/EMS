<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Deleted</title>
</head>
<body>
  <h2>Account Deleted</h2>
  <p>Hi {{ $name }},</p>
  <p>This is to inform you that your account on {{ config('app.name') }} has been deleted.</p>
  <p>If this was not expected, please reach out to our support team.</p>
  <p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
