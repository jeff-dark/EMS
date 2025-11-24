<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exam Results Available</title>
</head>
<body>
  <h2>Your Exam Results Are Available</h2>
  <p>Hi {{ $student->name ?? 'Student' }},</p>
  <p>Your results for the exam <strong>{{ $exam->title }}</strong> are now available.</p>
  <p>
    <strong>Score:</strong> {{ $session->score !== null ? number_format($session->score, 2) : 'N/A' }}<br>
    <strong>Status:</strong> {{ $session->score !== null && isset($exam->passing_score) ? ($session->score >= $exam->passing_score ? 'Passed' : 'Failed') : 'Graded' }}
  </p>
  @if(!empty($session->teacher_comment))
    <p><strong>Instructor comments:</strong> {{ $session->teacher_comment }}</p>
  @endif
  <p>You can log in to view full details.</p>
  <p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
