<?php

namespace App\Http\Controllers;

use App\Models\{Exam, ExamSession, Question, StudentAnswer};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ExamSubmittedMail;
use Inertia\Inertia;
use Dompdf\Dompdf;
use Dompdf\Options as DompdfOptions;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel\ErrorCorrectionLevelHigh;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\View;

class StudentExamController extends Controller
{
    public function start(Exam $exam)
    {
        $user = Auth::user();

        // Students must be registered to the exam's unit to access it
        $exam->loadMissing('unit');
        if (!$exam->unit) {
            \abort(404);
        }
        $isRegisteredToUnit = $user->units()->where('units.id', $exam->unit->id)->exists();
        if (!$isRegisteredToUnit) {
            \abort(403);
        }

        // Ensure the exam is published and only accessible at the exact scheduled start time (to the minute)
        $now = Carbon::now();
        if (!$exam->is_published) {
            return redirect()->route('exams.index')->with('message', 'This exam is not available yet.');
        }

        if (!is_null($exam->start_time)) {
            $start = $exam->start_time instanceof Carbon ? $exam->start_time : Carbon::parse($exam->start_time);
            $sameMinute = $now->isSameDay($start)
                && $now->format('H:i') === $start->format('H:i');

            if (!$sameMinute) {
                // Before start time
                if ($now->lt($start)) {
                    return redirect()->route('exams.index')->with('message', "The exam time hasn't reached yet.");
                }
                // After start time
                $alreadySubmitted = ExamSession::where('exam_id', $exam->id)
                    ->where('user_id', $user->id)
                    ->whereNotNull('submitted_at')
                    ->exists();

                $base = 'The exam has already passed.';
                $suffix = $alreadySubmitted ? ' You have already submitted this exam.' : ' You missed the exam.';
                return redirect()->route('exams.index')->with('message', $base . $suffix);
            }
        }

        // If the student already submitted this exam, block access
        $alreadySubmitted = ExamSession::where('exam_id', $exam->id)
            ->where('user_id', $user->id)
            ->whereNotNull('submitted_at')
            ->exists();
        if ($alreadySubmitted) {
            return redirect()->route('exams.index')->with('message', 'You have already submitted this exam.');
        }

        $session = ExamSession::firstOrCreate(
            ['exam_id' => $exam->id, 'user_id' => $user->id],
            ['started_at' => \now()]
        );
        if (is_null($session->started_at)) {
            $session->update(['started_at' => \now()]);
            $session->refresh();
        }

        $questions = $exam->questions()->orderBy('order')->get();
        $sessionEndAt = optional($session->started_at instanceof Carbon ? $session->started_at : Carbon::parse($session->started_at))
            ->copy()
            ->addMinutes((int) $exam->duration_minutes);

        return Inertia::render('Student/Exam', [
            'exam' => $exam,
            'session' => $session,
            'questions' => $questions,
            'sessionEndAt' => $sessionEndAt?->toIso8601String(),
        ]);
    }

    public function answer(Request $request, ExamSession $session)
    {
    $this->authorize('view', $session);

        // Block answering if time has expired (auto-submit if not already)
        $exam = $session->exam()->first();
        if ($exam && $session->started_at) {
            $endAt = Carbon::parse($session->started_at)->addMinutes((int) $exam->duration_minutes);
            if (Carbon::now()->greaterThanOrEqualTo($endAt)) {
                if (is_null($session->submitted_at)) {
                    $session->update(['submitted_at' => Carbon::now()]);
                }
                return response()->json(['status' => 'forbidden', 'message' => 'Time expired. Exam auto-submitted.'], 403);
            }
        }

        if (!is_null($session->submitted_at)) {
            return response()->json(['status' => 'forbidden', 'message' => 'Exam already submitted.'], 403);
        }

        $data = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer_text' => 'nullable|string',
        ]);

        StudentAnswer::updateOrCreate(
            ['exam_session_id' => $session->id, 'question_id' => $data['question_id']],
            ['answer_text' => $data['answer_text'] ?? null]
        );

        return response()->json(['status' => 'saved']);
    }

    public function bulkAnswer(Request $request, ExamSession $session)
    {
        $this->authorize('view', $session);
        // Block answering if time has expired (auto-submit if not already)
        $exam = $session->exam()->first();
        if ($exam && $session->started_at) {
            $endAt = Carbon::parse($session->started_at)->addMinutes((int) $exam->duration_minutes);
            if (Carbon::now()->greaterThanOrEqualTo($endAt)) {
                if (is_null($session->submitted_at)) {
                    $session->update(['submitted_at' => Carbon::now()]);
                }
                return response()->json(['status' => 'forbidden', 'message' => 'Time expired. Exam auto-submitted.'], 403);
            }
        }
        if (!is_null($session->submitted_at)) {
            return response()->json(['status' => 'forbidden', 'message' => 'Exam already submitted.'], 403);
        }

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.answer_text' => 'nullable|string',
        ]);

        foreach ($data['answers'] as $ans) {
            StudentAnswer::updateOrCreate(
                ['exam_session_id' => $session->id, 'question_id' => $ans['question_id']],
                ['answer_text' => $ans['answer_text'] ?? null]
            );
        }

        return response()->json(['status' => 'saved']);
    }

    public function submit(ExamSession $session)
    {
        $this->authorize('view', $session);
        if (!is_null($session->submitted_at)) {
            return redirect()->route('exams.index')->with('status', 'You have already submitted this exam.');
        }

        $session->update(['submitted_at' => \now()]);

        // Student answers remain in student_answers; teachers access them during grading.

        // Notify the student (submission confirmation)
        try {
            $student = $session->user()->first();
            if ($student && $student->email) {
                if (config('queue.default') === 'sync') {
                    Mail::to($student->email)->send(new ExamSubmittedMail($session));
                } else {
                    Mail::to($student->email)->queue(new ExamSubmittedMail($session));
                }
            }
        } catch (\Throwable $e) {
            // Swallow mail errors so submission flow is not blocked
            Log::warning('Exam submission email failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
        }

        return redirect()->route('exams.index')->with('status', 'Exam submitted');
    }

    public function results()
    {
        $user = Auth::user();
        if (!$user) abort(401);
        // Student can see their own sessions (submitted) and grading status
        $sessions = ExamSession::where('user_id', $user->id)
            ->whereNotNull('submitted_at')
            ->with(['exam:id,title'])
            ->orderByDesc('submitted_at')
            ->get(['id','exam_id','user_id','submitted_at','is_graded','score']);

        return Inertia::render('Student/Results', [ 'sessions' => $sessions ]);
    }

    /**
     * Render the student's graded exam result as a PDF (inline display in browser).
     */
    public function resultPdf(ExamSession $session)
    {
        $this->authorize('view', $session);

        // Ensure the result exists and is graded
        if (!$session->is_graded) {
            abort(404, 'Result not available yet.');
        }

        // Load full context
        $session->load(['user', 'exam.unit.course', 'exam.teacher.user', 'studentAnswers.question']);
        $exam = $session->exam;

        // Compute aggregates
        $totalPossible = $exam->questions->sum(fn($q) => floatval($q->points ?? 0));
        $totalObtained = floatval($session->score ?? 0);
        $percentage = $totalPossible > 0 ? round(($totalObtained / $totalPossible) * 100, 2) : null;
        $letter = null;
        if ($percentage !== null) {
            $p = $percentage;
            $letter = $p >= 90 ? 'A' : ($p >= 85 ? 'A-' : ($p >= 80 ? 'B+' : ($p >= 75 ? 'B' : ($p >= 70 ? 'B-' : ($p >= 65 ? 'C+' : ($p >= 60 ? 'C' : ($p >= 55 ? 'D+' : ($p >= 50 ? 'D' : 'F'))))))));
        }
        $passing = isset($exam->passing_score) ? floatval($exam->passing_score) : null; // absolute score
        $isPass = $passing !== null ? ($totalObtained >= $passing) : null;

        // Time taken
        $timeTakenMinutes = null;
        if ($session->started_at && $session->submitted_at) {
            $timeTakenMinutes = $session->started_at->diffInMinutes($session->submitted_at);
        }

        // Stable verification code per session
        if (!$session->verification_code) {
            $session->verification_code = Str::upper(Str::random(10));
            $session->save();
        }

        // Build a verification URL (simple placeholder endpoint for now)
        $verifyUrl = route('results.verify', ['code' => $session->verification_code]);

        // Generate QR PNG as data URI
        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($verifyUrl)
            ->encoding(new Encoding('UTF-8'))
            ->size(180)
            ->margin(0)
            ->build();
        $qrDataUri = 'data:image/png;base64,' . base64_encode($result->getString());

        // Optional institution logo from public/logo.png as data URI
        $logoDataUri = null;
        $logoPath = public_path('logo.png');
        if (is_file($logoPath)) {
            $logoDataUri = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
        }

        // Prepare view data
        $viewHtml = View::make('pdf.exam_result', [
            'appName' => config('app.name'),
            'appUrl' => config('app.url'),
            'logoDataUri' => $logoDataUri,
            'session' => $session,
            'exam' => $exam,
            'student' => $session->user,
            'teacher' => $exam->teacher?->user,
            'course' => $exam->unit?->course,
            'unit' => $exam->unit,
            'answers' => $session->studentAnswers->sortBy(fn($a) => $a->question?->order ?? PHP_INT_MAX)->values(),
            'totalPossible' => $totalPossible,
            'totalObtained' => $totalObtained,
            'percentage' => $percentage,
            'letter' => $letter,
            'passing' => $passing,
            'isPass' => $isPass,
            'timeTakenMinutes' => $timeTakenMinutes,
            'generatedAt' => now(),
            'verifyUrl' => $verifyUrl,
            'qrDataUri' => $qrDataUri,
        ])->render();

        // Configure Dompdf
        $options = new DompdfOptions();
        $options->set('isRemoteEnabled', true);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($viewHtml);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = 'Exam_Result_'.$session->id.'.pdf';
        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            // Inline so it opens in a new tab; user can download from viewer
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    /**
     * Public verification endpoint by code.
     */
    public function verify(Request $request)
    {
        $code = (string) $request->query('code');
        $session = null;
        if ($code !== '') {
            $session = ExamSession::with(['user:id,name,username', 'exam:id,title,passing_score', 'exam.unit.course'])
                ->where('verification_code', $code)
                ->first();
        }

        return view('public.result_verify', [
            'session' => $session,
            'appName' => config('app.name'),
        ]);
    }
}
