<?php

namespace App\Http\Controllers;

use App\Models\{Exam, Question, QuestionAnswer};
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(Exam $exam)
    {
        $this->authorize('viewAny', Question::class);
        // Teachers can only access questions for exams under their units
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $exam->loadMissing('unit.teachers');
            if (!$exam->unit || !$exam->unit->teachers->contains('id', $teacher->id)) {
                abort(403);
            }
        }
	$exam->load('unit.course');
	$questions = $exam->questions()->with('answerKey')->get();
        return inertia('Questions/Index', [
            'exam' => $exam,
            'unit' => $exam->unit,
            'course' => $exam->unit?->course,
            'questions' => $questions,
        ]);
    }

    public function create(Exam $exam)
    {
        $this->authorize('create', Question::class);
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $exam->loadMissing('unit.teachers');
            if (!$exam->unit || !$exam->unit->teachers->contains('id', $teacher->id)) {
                abort(403);
            }
        }
        $exam->load('unit.course');
        return inertia('Questions/Create', [
            'exam' => $exam,
            'unit' => $exam->unit,
            'course' => $exam->unit?->course,
        ]);
    }

    public function store(Request $request, Exam $exam)
    {
        $this->authorize('create', Question::class);
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $exam->loadMissing('unit.teachers');
            if (!$exam->unit || !$exam->unit->teachers->contains('id', $teacher->id)) {
                abort(403);
            }
        }
        $data = $request->validate([
            'prompt' => 'required|string',
            'points' => 'nullable|numeric|min:0',
            'expected_answer' => 'nullable|string',
        ]);

        $question = $exam->questions()->create([
            'prompt' => $data['prompt'],
            'points' => $data['points'] ?? 1,
        ]);

        if (!empty($data['expected_answer'])) {
            $question->answerKey()->create(['answer' => $data['expected_answer']]);
        }

    return redirect()->route('exams.questions.index', $exam)->with('message', 'Question created');
    }

    public function edit(Exam $exam, Question $question)
    {
        $this->authorize('view', $question);
	$user = auth()->user();
	if ($user && $user->hasRole('teacher')) {
	    $teacher = $user->teacher;
	    $exam->loadMissing('unit.teachers');
	    if (!$exam->unit || !$exam->unit->teachers->contains('id', $teacher->id)) {
	        abort(403);
	    }
	}
	$exam->load('unit.course');
	$question->load('answerKey');
        return inertia('Questions/Edit', [
            'exam' => $exam,
            'unit' => $exam->unit,
            'course' => $exam->unit?->course,
            'question' => $question,
            'answerKey' => $question->answerKey,
        ]);
    }

    public function update(Request $request, Exam $exam, Question $question)
    {
        $this->authorize('update', $question);
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $exam->loadMissing('unit.teachers');
            if (!$exam->unit || !$exam->unit->teachers->contains('id', $teacher->id)) {
                abort(403);
            }
        }
        $data = $request->validate([
            'prompt' => 'required|string',
            'points' => 'nullable|numeric|min:0',
            'expected_answer' => 'nullable|string',
        ]);

        $question->update([
            'prompt' => $data['prompt'],
            'points' => $data['points'] ?? $question->points,
        ]);

        // Simplify: keep only one canonical answer row
        $question->answerKey()->delete();
        if (!empty($data['expected_answer'])) {
            $question->answerKey()->create(['answer' => $data['expected_answer']]);
        }

    return redirect()->route('exams.questions.index', $exam)->with('message', 'Question updated');
    }

    public function destroy(Exam $exam, Question $question)
    {
        $this->authorize('delete', $question);
        $user = auth()->user();
        if ($user && $user->hasRole('teacher')) {
            $teacher = $user->teacher;
            $exam->loadMissing('unit.teachers');
            if (!$exam->unit || !$exam->unit->teachers->contains('id', $teacher->id)) {
                abort(403);
            }
        }
        $question->delete();
    return redirect()->route('exams.questions.index', $exam)->with('message', 'Question deleted');
    }
}
