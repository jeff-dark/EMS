<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Exam Published</title></head>
<body>
<h2>New Exam Published</h2>
<p>An exam titled <strong>{{ $exam->title }}</strong> has been published for the unit <strong>{{ $exam->unit->title }}</strong>@if($exam->unit->course) ({{ $exam->unit->course->name }})@endif.</p>
@if($exam->start_time)
<p>Starts at: {{ $exam->start_time->format('Y-m-d H:i') }}</p>
@endif
@if($exam->end_time)
<p>Ends at: {{ $exam->end_time->format('Y-m-d H:i') }}</p>
@endif
<p>Log in to view details and prepare accordingly.</p>
<p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
