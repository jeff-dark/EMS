<?php

namespace App\Http\Controllers;

use App\Models\{Exam, ExamSession, Question, StudentAnswer};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ExamSubmittedMail;
use Inertia\Inertia;

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

        // Ensure the exam is published and within availability window (if set)
        $now = \now();
        if (!$exam->is_published) {
            \abort(403);
        }
        if (!is_null($exam->start_time) && $exam->start_time->gt($now)) {
            \abort(403);
        }
        if (!is_null($exam->end_time) && $exam->end_time->lt($now)) {
            \abort(403);
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

        $questions = $exam->questions()->orderBy('order')->get();

        return Inertia::render('Student/Exam', compact('exam', 'session', 'questions'));
    }

    public function answer(Request $request, ExamSession $session)
    {
    $this->authorize('view', $session);

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
}
