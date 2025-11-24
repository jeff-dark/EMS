<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Exam Result</title>
  <style>
    @page { margin: 18px; }
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
  body{font-family: DejaVu Sans, Arial, sans-serif; margin:0; color:#0f172a; background:#fff; font-size:11px;}
  .container{padding:16px 20px;}
  .header{display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--brand); padding-bottom:10px; margin-bottom:12px;}
    .logo{width:48px; height:48px; border-radius:8px; background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--brand);}
    .brand{display:flex; flex-direction:column}
  .brand .name{font-size:16px; font-weight:800; letter-spacing:.3px;}
  .brand .platform{font-size:11px; color:var(--muted)}
  .title{margin:0; font-size:16px; font-weight:800;}

  /* Use table layout for Dompdf compatibility (CSS Grid not supported) */
  .two-col{width:100%; border-collapse:separate; border-spacing:10px 0;}
  .two-col .col{width:50%; vertical-align:top;}
  .section{background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:10px;}
  .section, .header, .footer { page-break-inside: avoid; }
  .section h3{margin:0 0 8px; font-size:12px; letter-spacing:.2px; color:#0f172a; text-transform:uppercase}
  .kv{display:grid; grid-template-columns: 140px 1fr; row-gap:5px; column-gap:8px; font-size:11px}
    .kv .k{color:var(--muted)}
    .kv .v{font-weight:600}

  /* metrics removed per request */

  .table{width:100%; border-collapse:separate; border-spacing:0; font-size:11px;}
  .table th{background:#f8fafc; text-align:left; font-weight:700; padding:6px; border-top:1px solid var(--border); border-bottom:1px solid var(--border)}
  .table td{padding:6px; border-bottom:1px solid var(--border)}
    .table tr:last-child td{border-bottom:0}

  .footer{display:flex; gap:10px; margin-top:12px}
  .footer .box{flex:1; border:1px solid var(--border); border-radius:8px; padding:10px}
    .muted{color:var(--muted)}
  .small{font-size:10px}
  .status-badge{display:inline-block; padding:1px 6px; border-radius:6px; font-size:10px; font-weight:700; border:1px solid currentColor; background: transparent}
  .badge-pass{color: var(--pass)}
  .badge-fail{color: var(--fail)}
  .sig{height:48px; border:1px dashed var(--border); border-radius:8px;}
  .qr{display:flex; align-items:center; gap:8px}
    .text-right{text-align:right}
    .watermark{
      position: fixed;
      top: 35%; left: 10%; right:10%;
      text-align:center;
      transform: rotate(-25deg);
      opacity: 0.05;
      font-size: 48px;
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

    <table class="two-col">
      <tr>
        <td class="col">
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
        </td>
        <td class="col">
          <div class="section">
            <h3>Exam identification</h3>
            <div class="kv">
              <div class="k">Exam Title</div>
              <div class="v">{{ $exam->title }}</div>
              <div class="k">Exam Date</div>
              <div class="v">{{ optional($session->submitted_at ?? $session->started_at)->format('Y-m-d') }}</div>
              <div class="k">Exam Duration</div>
              <div class="v">{{ (int)($exam->duration_minutes ?? 0) }} Minutes</div>
              <div class="k">Instructor Name</div>
              <div class="v">{{ $teacher->name ?? '—' }}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Overall performance section removed as requested to keep a single-page compact layout -->

    <div class="section" style="margin-top:10px">
      <h3>Detailed performance & context</h3>
      <table class="table">
        <thead>
          <tr>
            <th style="width:10%">Q</th>
            <th style="width:15%">Obt</th>
            <th style="width:15%">Total</th>
            <th style="width:10%">Q</th>
            <th style="width:15%">Obt</th>
            <th style="width:15%">Total</th>
          </tr>
        </thead>
        <tbody>
          @php $count = count($answers); @endphp
          @for ($i = 0; $i < $count; $i += 2)
            @php
              $left = $answers[$i];
              $right = $answers[$i+1] ?? null;
            @endphp
            <tr>
              <td>Q{{ $i+1 }}</td>
              <td>{{ number_format((float)($left->points_awarded ?? 0), 2) }}</td>
              <td>{{ number_format((float)($left->question->points ?? 0), 2) }}</td>
              @if ($right)
                <td>Q{{ $i+2 }}</td>
                <td>{{ number_format((float)($right->points_awarded ?? 0), 2) }}</td>
                <td>{{ number_format((float)($right->question->points ?? 0), 2) }}</td>
              @else
                <td></td><td></td><td></td>
              @endif
            </tr>
          @endfor
          <tr>
            <td style="font-weight:700">Totals</td>
            <td style="font-weight:700">{{ number_format($totalObtained, 2) }}</td>
            <td style="font-weight:700">{{ number_format($totalPossible, 2) }}</td>
            <td></td><td></td><td></td>
          </tr>
        </tbody>
      </table>
      <div class="small muted" style="margin-top:4px">
        Passing Mark Set:
        @if ($passing !== null)
          {{ number_format($passing,2) }}
          <span style="margin:0 6px; color:#94a3b8">•</span>
          <span>Status:</span>
          <span class="status-badge {{ $isPass ? 'badge-pass' : 'badge-fail' }}">{{ $isPass ? 'PASS' : 'FAIL' }}</span>
        @else
          Not specified
        @endif
      </div>
    </div>

    <table class="two-col" style="margin-top:10px">
      <tr>
        <td class="col">
          <div class="section">
            <h3>Official signatory</h3>
            <div class="sig"></div>
            <div class="small muted">Signature</div>
            @if(!empty($signatoryName) || !empty($signatoryTitle))
              <div class="small" style="margin-top:6px"><strong>{{ $signatoryName ?? '' }}</strong>@if(!empty($signatoryTitle)) — {{ $signatoryTitle }} @endif</div>
            @endif
          </div>
        </td>
        <td class="col">
          <div class="section">
            <h3>Verification</h3>
            <div class="qr">
              <img src="{{ $qrDataUri }}" alt="QR Code" width="70" height="70" />
              <div>
                <div class="small">Verification Code</div>
                <div style="font-weight:800">{{ $session->verification_code }}</div>
                <div class="small muted">Verify at: {{ $verifyUrl }}</div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
    <div class="small muted" style="margin-top:6px">This document is generated by {{ $appName }}. If you have questions about grading or appeals, please contact your instructor or the registrar. This record may be provisional subject to institutional policies.</div>
  </div>
</body>
</html>
