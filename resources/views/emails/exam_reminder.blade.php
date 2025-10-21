<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Exam Reminder</title></head>
<body>
<h2>Exam Reminder</h2>
<p>Reminder ({{ $timing }}): The exam <strong>{{ $exam->title }}</strong> is scheduled for the unit <strong>{{ $exam->unit->title }}</strong>.</p>
@if($exam->start_time)
<p>Starts at: {{ $exam->start_time->format('Y-m-d H:i') }}</p>
@endif
<p>Good luck!</p>
<p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
