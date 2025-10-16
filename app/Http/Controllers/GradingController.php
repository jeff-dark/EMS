<?php

namespace App\Http\Controllers;

use App\Models\{ExamSession, StudentAnswer};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GradingController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', ExamSession::class);
        $user = Auth::user();
        $query = ExamSession::query()
            ->whereNotNull('submitted_at')
            ->where('is_graded', false)
            ->with(['exam.unit', 'user']);

        // If teacher, restrict to their units
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            if ($teacher) {
                $unitIds = $teacher->units()->pluck('units.id');
                $query->whereHas('exam', function ($q) use ($unitIds) {
                    $q->whereIn('unit_id', $unitIds);
                });
            } else {
                // No teacher profile, show nothing
                $query->whereRaw('1=0');
            }
        }

        $sessions = $query->orderByDesc('submitted_at')->get();
        return inertia('Grading/Index', compact('sessions'));
    }

    public function session(ExamSession $session)
    {
        $this->authorize('view', $session);
        $session->load('studentAnswers.question', 'user', 'exam.unit');
        return inertia('Grading/Session', compact('session'));
    }

    public function grade(Request $request, ExamSession $session)
    {
        $this->authorize('view', $session);
        // Additional server-side guard: only assigned unit teachers or exam owner can grade
        $user = Auth::user();
        if ($user?->hasRole('teacher')) {
            $teacher = $user->teacher;
            $session->loadMissing('exam.unit', 'exam.teacher');
            $allowed = false;
            if ($teacher) {
                $allowed = ($session->exam?->teacher?->id === $teacher->id)
                    || ($session->exam?->unit && $teacher->units()->where('units.id', $session->exam->unit->id)->exists());
            }
            if (!$allowed) {
                abort(403);
            }
        }

        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.id' => 'required|exists:student_answers,id',
            'answers.*.points_awarded' => 'nullable|numeric',
            'teacher_comment' => 'nullable|string',
        ]);

        $total = 0;
        foreach ($data['answers'] as $a) {
            $sa = StudentAnswer::find($a['id']);
            $sa->update([
                'points_awarded' => $a['points_awarded'] ?? null,
                // Clear per-question comments now that we use overall comment
                'comments' => null,
            ]);
            $total += floatval($sa->points_awarded ?? 0);
        }

        $graderId = optional(Auth::user()?->teacher)->id;
        $session->update([
            'score' => $total,
            'is_graded' => true,
            'graded_by_teacher_id' => $graderId,
            'teacher_comment' => $data['teacher_comment'] ?? null,
        ]);

        return redirect()->route('grading.index')->with('status', 'Grading saved');
    }
}
