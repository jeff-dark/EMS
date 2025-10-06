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
        return inertia('Questions/Index', compact('exam', 'questions'));
    }

    public function create(Exam $exam)
    {
        $this->authorize('create', Question::class);
        return inertia('Questions/Create', compact('exam'));
    }

    public function store(Request $request, Exam $exam)
    {
        $this->authorize('create', Question::class);
        $data = $request->validate([
            'content' => 'required|string',
            'points' => 'nullable|numeric',
            'order' => 'nullable|integer',
            'expected_answer' => 'nullable|string',
            'rubric' => 'nullable|string',
        ]);

        $question = $exam->questions()->create([
            'content' => $data['content'],
            'points' => $data['points'] ?? 1,
            'order' => $data['order'] ?? null,
        ]);

        if (!empty($data['expected_answer']) || !empty($data['rubric'])) {
            $question->answerKey()->create([
                'expected_answer' => $data['expected_answer'] ?? null,
                'rubric' => $data['rubric'] ?? null,
            ]);
        }

        return redirect()->route('courses.units.exams.edit', [$exam->unit->course, $exam->unit, $exam]);
    }

    public function edit(Exam $exam, Question $question)
    {
        $this->authorize('view', $question);
        $question->load('answerKey');
        return inertia('Questions/Edit', compact('exam', 'question'));
    }

    public function update(Request $request, Exam $exam, Question $question)
    {
        $this->authorize('update', $question);
        $data = $request->validate([
            'content' => 'required|string',
            'points' => 'nullable|numeric',
            'order' => 'nullable|integer',
            'expected_answer' => 'nullable|string',
            'rubric' => 'nullable|string',
        ]);

        $question->update([
            'content' => $data['content'],
            'points' => $data['points'] ?? $question->points,
            'order' => $data['order'] ?? $question->order,
        ]);

        $question->answerKey()->updateOrCreate([], [
            'expected_answer' => $data['expected_answer'] ?? null,
            'rubric' => $data['rubric'] ?? null,
        ]);

        return redirect()->route('courses.units.exams.edit', [$exam->unit->course, $exam->unit, $exam]);
    }

    public function destroy(Exam $exam, Question $question)
    {
        $this->authorize('delete', $question);
        $question->delete();
        return back();
    }
}
