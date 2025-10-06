<?php

namespace App\Http\Controllers;

use App\Models\{ExamSession, StudentAnswer};
use Illuminate\Http\Request;

class GradingController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', ExamSession::class);
        $sessions = ExamSession::whereNotNull('submitted_at')->where('is_graded', false)->with('exam', 'user')->get();
        return inertia('Grading/Index', compact('sessions'));
    }

    public function session(ExamSession $session)
    {
        $this->authorize('view', $session);
        $session->load('studentAnswers.question.answerKey', 'user', 'exam');
        return inertia('Grading/Session', compact('session'));
    }

    public function grade(Request $request, ExamSession $session)
    {
        $this->authorize('view', $session);

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.id' => 'required|exists:student_answers,id',
            'answers.*.points_awarded' => 'nullable|numeric',
            'answers.*.comments' => 'nullable|string',
        ]);

        $total = 0;
        foreach ($data['answers'] as $a) {
            $sa = StudentAnswer::find($a['id']);
            $sa->update([
                'points_awarded' => $a['points_awarded'] ?? null,
                'comments' => $a['comments'] ?? null,
            ]);
            $total += floatval($sa->points_awarded ?? 0);
        }

        $session->update(['score' => $total, 'is_graded' => true]);

        return redirect()->route('grading.index')->with('status', 'Grading saved');
    }
}
