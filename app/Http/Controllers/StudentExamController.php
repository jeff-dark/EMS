<?php

namespace App\Http\Controllers;

use App\Models\{Exam, ExamSession, Question, StudentAnswer};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentExamController extends Controller
{
    public function start(Exam $exam)
    {
        $user = Auth::user();

        $session = ExamSession::firstOrCreate(
            ['exam_id' => $exam->id, 'user_id' => $user->id],
            ['started_at' => now()]
        );

        $questions = $exam->questions()->orderBy('order')->get();

        return inertia('Student/Exam', compact('exam', 'session', 'questions'));
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

        $session->update(['submitted_at' => now()]);

        return redirect()->route('dashboard')->with('status', 'Exam submitted');
    }
}
