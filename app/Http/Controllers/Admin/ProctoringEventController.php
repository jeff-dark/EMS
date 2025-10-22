<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{ProctorEvent, ExamSession, Exam, User};
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProctoringEventController extends Controller
{
    public function index(Request $request)
    {
        $filters = [
            'exam_id' => $request->integer('exam_id'),
            'session_id' => $request->integer('session_id'),
            'user_id' => $request->integer('user_id'),
            'type' => $request->string('type')->toString() ?: null,
            'from' => $request->date('from'),
            'to' => $request->date('to'),
        ];

        $query = ProctorEvent::query()
            ->with(['session.exam:id,title', 'user:id,name,email'])
            ->when($filters['exam_id'], fn($q, $v) => $q->whereHas('session', fn($qq) => $qq->where('exam_id', $v)))
            ->when($filters['session_id'], fn($q, $v) => $q->where('exam_session_id', $v))
            ->when($filters['user_id'], fn($q, $v) => $q->where('user_id', $v))
            ->when($filters['type'], fn($q, $v) => $q->where('type', $v))
            ->when($filters['from'], fn($q, $v) => $q->where('created_at', '>=', $v))
            ->when($filters['to'], fn($q, $v) => $q->where('created_at', '<=', $v))
            ->orderByDesc('created_at');

        $events = $query->paginate(50)->withQueryString();

        // Summary counts by type and by session
        $summaryByType = ProctorEvent::selectRaw('type, COUNT(*) as count')
            ->when($filters['exam_id'], fn($q, $v) => $q->whereHas('session', fn($qq) => $qq->where('exam_id', $v)))
            ->when($filters['session_id'], fn($q, $v) => $q->where('exam_session_id', $v))
            ->when($filters['user_id'], fn($q, $v) => $q->where('user_id', $v))
            ->when($filters['from'], fn($q, $v) => $q->where('created_at', '>=', $v))
            ->when($filters['to'], fn($q, $v) => $q->where('created_at', '<=', $v))
            ->groupBy('type')->orderByDesc('count')->get();

        $summaryBySession = ProctorEvent::selectRaw('exam_session_id, COUNT(*) as count')
            ->when($filters['exam_id'], fn($q, $v) => $q->whereHas('session', fn($qq) => $qq->where('exam_id', $v)))
            ->when($filters['user_id'], fn($q, $v) => $q->where('user_id', $v))
            ->when($filters['from'], fn($q, $v) => $q->where('created_at', '>=', $v))
            ->when($filters['to'], fn($q, $v) => $q->where('created_at', '<=', $v))
            ->groupBy('exam_session_id')->orderByDesc('count')->limit(50)->get();

        $exams = Exam::select('id','title')->orderBy('title')->get();

        return Inertia::render('Admins/Proctoring/Events/Index', [
            'events' => $events,
            'filters' => $filters,
            'summaryByType' => $summaryByType,
            'summaryBySession' => $summaryBySession,
            'exams' => $exams,
        ]);
    }
}
