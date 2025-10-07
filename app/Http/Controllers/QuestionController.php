<?php

namespace App\Http\Controllers;

use App\Models\{Exam, Question, QuestionAnswer};
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(Exam $exam)
    {
        $this->authorize('viewAny', Question::class);
    $questions = $exam->questions()->with('answerKey')->get();
        return inertia('Questions/Index', [
            'exam' => $exam->load('unit.course'),
            'questions' => $questions,
        ]);
    }

    public function create(Exam $exam)
    {
        $this->authorize('create', Question::class);
        return inertia('Questions/Create', [
            'exam' => $exam->load('unit.course'),
        ]);
    }

    public function store(Request $request, Exam $exam)
    {
        $this->authorize('create', Question::class);
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
    $question->load('answerKey');
        return inertia('Questions/Edit', [
            'exam' => $exam->load('unit.course'),
            'question' => $question,
            'answerKey' => $question->answerKey,
        ]);
    }

    public function update(Request $request, Exam $exam, Question $question)
    {
        $this->authorize('update', $question);
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
        $question->delete();
    return redirect()->route('exams.questions.index', $exam)->with('message', 'Question deleted');
    }
}
