<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Exam Result</title>
  <style>
    :root {
      --brand:#0f172a; /* slate-900 */
      --muted:#64748b; /* slate-500 */
      --accent:#0ea5e9; /* sky-500 */
      --pass:#16a34a; /* green-600 */
      --fail:#dc2626; /* red-600 */
      --border:#e2e8f0; /* slate-200 */
      --bg:#ffffff;
    }
    *{box-sizing:border-box}
    body{font-family: DejaVu Sans, Arial, sans-serif; margin:0; color:#0f172a; background:#fff;}
    .container{padding:28px 32px;}
    .header{display:flex; align-items:center; gap:16px; border-bottom:2px solid var(--brand); padding-bottom:14px; margin-bottom:18px;}
    .logo{width:48px; height:48px; border-radius:8px; background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--brand);}
    .brand{display:flex; flex-direction:column}
    .brand .name{font-size:18px; font-weight:800; letter-spacing:.3px;}
    .brand .platform{font-size:12px; color:var(--muted)}
    .title{margin:0; font-size:20px; font-weight:800;}

    .grid{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
    .section{background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:14px;}
    .section h3{margin:0 0 10px; font-size:13px; letter-spacing:.2px; color:#0f172a; text-transform:uppercase}
    .kv{display:grid; grid-template-columns: 180px 1fr; row-gap:6px; column-gap:10px; font-size:12px}
    .kv .k{color:var(--muted)}
    .kv .v{font-weight:600}

    .metrics{display:grid; grid-template-columns: repeat(3, 1fr); gap:10px}
    .metric{border:1px solid var(--border); border-radius:10px; padding:10px}
    .metric .k{font-size:11px; color:var(--muted); text-transform:uppercase}
    .metric .v{font-size:18px; font-weight:800}
    .status{display:inline-block; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:700; color:#fff}

    .table{width:100%; border-collapse:separate; border-spacing:0; font-size:12px;}
    .table th{background:#f8fafc; text-align:left; font-weight:700; padding:10px; border-top:1px solid var(--border); border-bottom:1px solid var(--border)}
    .table td{padding:10px; border-bottom:1px solid var(--border)}
    .table tr:last-child td{border-bottom:0}

    .footer{display:flex; gap:16px; margin-top:18px}
    .footer .box{flex:1; border:1px solid var(--border); border-radius:10px; padding:12px}
    .muted{color:var(--muted)}
    .small{font-size:11px}
    .sig{height:64px; border:1px dashed var(--border); border-radius:8px;}
    .qr{display:flex; align-items:center; gap:12px}
    .text-right{text-align:right}
    .watermark{
      position: fixed;
      top: 35%; left: 10%; right:10%;
      text-align:center;
      transform: rotate(-25deg);
      opacity: 0.07;
      font-size: 64px;
      font-weight: 900;
      color:#0f172a;
      z-index: 0;
    }
  </style>
</head>
<body>
  <div class="watermark">{{ $appName }} • Official</div>
  <div class="container">
    <div class="header">
      @if(!empty($logoDataUri))
        <img src="{{ $logoDataUri }}" alt="Logo" width="48" height="48" style="border-radius:8px; object-fit:cover;" />
      @else
        <div class="logo">{{ mb_substr($appName,0,2) }}</div>
      @endif
      <div class="brand">
        <div class="name">{{ $appName }}</div>
        <div class="platform">Exam Results</div>
      </div>
      <div style="margin-left:auto; text-align:right">
        <div class="title">Official Exam Result</div>
        <div class="small muted">Generated: {{ $generatedAt->format('Y-m-d H:i') }}</div>
      </div>
    </div>

    <div class="grid">
      <div class="section">
        <h3>Student identification</h3>
        <div class="kv">
          <div class="k">Student Name</div>
          <div class="v">{{ $student->name }}</div>
          <div class="k">Username</div>
          <div class="v">{{ $student->username }}</div>
          <div class="k">Course Name</div>
          <div class="v">{{ $course->name ?? '—' }}</div>
          <div class="k">Unit Name</div>
          <div class="v">{{ $unit->title ?? '—' }}</div>
        </div>
      </div>
      <div class="section">
        <h3>Exam identification</h3>
        <div class="kv">
          <div class="k">Exam Title</div>
          <div class="v">{{ $exam->title }}</div>
          <div class="k">Exam Date</div>
          <div class="v">{{ optional($session->submitted_at ?? $session->started_at)->format('Y-m-d') }}</div>
          <div class="k">Exam Duration</div>
          <div class="v">{{ (int)($exam->duration_minutes ?? 0) }} Minutes</div>
          <div class="k">Teacher Name</div>
          <div class="v">{{ $teacher->name ?? '—' }}</div>
        </div>
      </div>
    </div>

    <div class="section" style="margin-top:14px">
      <h3>Overall performance</h3>
      <div class="metrics">
        <div class="metric">
          <div class="k">Total Marks Possible</div>
          <div class="v">{{ number_format($totalPossible, 2) }}</div>
        </div>
        <div class="metric">
          <div class="k">Total Marks Obtained</div>
          <div class="v">{{ number_format($totalObtained, 2) }}</div>
        </div>
        <div class="metric">
          <div class="k">Percentage / Grade</div>
          <div class="v">
            @if ($percentage !== null)
              {{ rtrim(rtrim(number_format($percentage,2),'0'),'.') }}% @if(!empty($letter)) ({{ $letter }}) @endif
            @else
              —
            @endif
          </div>
        </div>
      </div>
      <div style="margin-top:10px; display:flex; gap:12px; align-items:center">
        <div class="k" style="font-size:12px; color:var(--muted)">Status</div>
        @php($passFail = $isPass === null ? '—' : ($isPass ? 'PASS' : 'FAIL'))
        <div class="status" style="background: {{ $isPass ? 'var(--pass)' : 'var(--fail)' }}">{{ $passFail }}</div>
        <div class="k" style="font-size:12px; color:var(--muted); margin-left:18px">Time Taken</div>
        <div class="v" style="font-size:12px; font-weight:700">{{ $timeTakenMinutes !== null ? ($timeTakenMinutes.' Minutes') : '—' }}</div>
      </div>
    </div>

    <div class="section" style="margin-top:14px">
      <h3>Detailed performance & context</h3>
      <table class="table">
        <thead>
          <tr>
            <th style="width:20%">Question</th>
            <th>Marks Obtained</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          @foreach ($answers as $idx => $ans)
            <tr>
              <td>Q{{ $idx+1 }}</td>
              <td>{{ number_format((float)($ans->points_awarded ?? 0), 2) }}</td>
              <td>{{ number_format((float)($ans->question->points ?? 0), 2) }}</td>
            </tr>
          @endforeach
          <tr>
            <td style="font-weight:700">Totals</td>
            <td style="font-weight:700">{{ number_format($totalObtained, 2) }}</td>
            <td style="font-weight:700">{{ number_format($totalPossible, 2) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="small muted" style="margin-top:6px">Passing Mark Set: {{ $passing !== null ? number_format($passing,2) : 'Not specified' }}</div>
    </div>

    <div class="footer">
      <div class="box">
        <h3>Verification</h3>
        <div class="qr">
          <img src="{{ $qrDataUri }}" alt="QR Code" width="90" height="90" />
          <div>
            <div class="small">Verification Code</div>
            <div style="font-weight:800">{{ $session->verification_code }}</div>
            <div class="small muted">Verify at: {{ $verifyUrl }}</div>
          </div>
        </div>
      </div>
      <div class="box">
        <h3>Official signatory</h3>
        <div class="sig"></div>
        <div class="small muted">Signature</div>
        @if(!empty($signatoryName) || !empty($signatoryTitle))
          <div class="small" style="margin-top:6px"><strong>{{ $signatoryName ?? '' }}</strong>@if(!empty($signatoryTitle)) — {{ $signatoryTitle }} @endif</div>
        @endif
      </div>
      <div class="box">
        <h3>Notes</h3>
        <div class="small muted">This document is generated by {{ $appName }}. If you have questions about grading or appeals, please contact your instructor or the registrar. This record may be provisional subject to institutional policies.</div>
      </div>
    </div>
  </div>
</body>
</html>
