<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exam Submission Confirmation</title>
</head>
<body>
  <h2>Exam Submitted</h2>
  <p>Hi {{ $student->name ?? 'Student' }},</p>
  <p>Your submission for the exam <strong>{{ $exam->title }}</strong> has been received on {{ optional($session->submitted_at)->format('Y-m-d H:i') }}.</p>
  <p>We will notify you once grading is complete.</p>
  <p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
