<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Results Updated</title></head>
<body>
<h2>Your Exam Results Were Updated</h2>
<p>Hi {{ $student->name ?? 'Student' }},</p>
<p>Your results for <strong>{{ $exam->title }}</strong> were updated. Please log in to view the latest details.</p>
<p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
