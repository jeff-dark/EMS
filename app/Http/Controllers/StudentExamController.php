<?php

namespace App\Http\Controllers;

use App\Models\{Exam, ExamSession, Question, StudentAnswer};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentExamController extends Controller
{
    public function start(Exam $exam)
    {
        $user = Auth::user();

        // Students must be enrolled in the exam's course to access it
        $exam->loadMissing('unit.course');
        $courseId = $exam->unit?->course?->id;
        if (!$courseId) {
            \abort(404);
        }

        // Ensure the authenticated student is enrolled in this course
        $isEnrolled = $user->courses()->where('courses.id', $courseId)->exists();
        if (!$isEnrolled) {
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

    public function submit(ExamSession $session)
    {
        $this->authorize('view', $session);

        $session->update(['submitted_at' => \now()]);

        return redirect()->route('dashboard')->with('status', 'Exam submitted');
    }
}
