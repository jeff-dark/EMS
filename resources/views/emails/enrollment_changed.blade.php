<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Enrollment Changed</title></head>
<body>
<h2>Your Course Enrollment Changed</h2>
<p>Hi {{ $student->name ?? 'Student' }},</p>
@if(!empty($coursesAdded))
<p>Added courses:</p>
<ul>
  @foreach($coursesAdded as $c)
    <li>{{ is_array($c) ? ($c['name'] ?? $c['title'] ?? json_encode($c)) : $c }}</li>
  @endforeach
</ul>
@endif
@if(!empty($coursesRemoved))
<p>Removed courses:</p>
<ul>
  @foreach($coursesRemoved as $c)
    <li>{{ is_array($c) ? ($c['name'] ?? $c['title'] ?? json_encode($c)) : $c }}</li>
  @endforeach
</ul>
@endif
<p>Regards,<br>{{ config('app.name') }}</p>
</body>
</html>
