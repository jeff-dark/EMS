<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Result Verification</title>
  <style>
    body{font-family: Arial, sans-serif; margin:24px; color:#0f172a}
    .card{max-width:720px; border:1px solid #e2e8f0; border-radius:12px; padding:18px}
    .muted{color:#64748b}
    .badge{display:inline-block; padding:4px 10px; border-radius:999px; color:#fff; font-weight:700; font-size:12px}
    .pass{background:#16a34a}
    .fail{background:#dc2626}
  </style>
</head>
<body>
  <h1 style="margin:0 0 14px">{{ $appName }} — Result Verification</h1>
  @if (!$session)
    <div class="card">
      <p class="muted">No result found for the provided verification code.</p>
    </div>
  @else
    @php
      $totalPossible = $session->exam?->questions()->sum('points') ?? 0;
      $score = (float) ($session->score ?? 0);
      $pass = isset($session->exam?->passing_score) ? ($score >= (float)$session->exam->passing_score) : null;
    @endphp
    <div class="card">
      <h2 style="margin:0 0 6px">{{ $session->exam?->title }}</h2>
      <div class="muted" style="margin-bottom:10px">Student: {{ $session->user?->name }} ({{ $session->user?->username }})</div>
      <div style="display:flex; gap:18px; align-items:center">
        <div>Score: <strong>{{ number_format($score,2) }}</strong> / {{ number_format($totalPossible,2) }}</div>
        @if ($pass !== null)
          <div class="badge {{ $pass ? 'pass' : 'fail' }}">{{ $pass ? 'PASS' : 'FAIL' }}</div>
        @endif
      </div>
      <div class="muted" style="margin-top:10px">Submitted: {{ optional($session->submitted_at)->format('Y-m-d H:i') ?? '—' }}</div>
      <div class="muted" style="margin-top:4px">Verification Code: <strong>{{ $session->verification_code }}</strong></div>
    </div>
  @endif
</body>
</html>
