<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Exam, ProctorEvent};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProctoringEventController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->hasRole('admin')) {
            abort(403);
        }

        $filters = [
            'exam_id' => $request->integer('exam_id') ?: null,
            'session_id' => $request->integer('session_id') ?: null,
            'user_id' => $request->integer('user_id') ?: null,
            'type' => $request->string('type')->toString() ?: null,
            'from' => $request->string('from')->toString() ?: null,
            'to' => $request->string('to')->toString() ?: null,
        ];

        $query = ProctorEvent::query()
            ->with(['user:id,name,email', 'session.exam:id,title']);

        if ($filters['exam_id']) {
            $examId = $filters['exam_id'];
            $query->whereHas('session.exam', fn($q) => $q->where('exams.id', $examId));
        }
        if ($filters['session_id']) {
            $query->where('exam_session_id', $filters['session_id']);
        }
        if ($filters['user_id']) {
            $query->where('user_id', $filters['user_id']);
        }
        if ($filters['type']) {
            $query->where('type', $filters['type']);
        }
        if ($filters['from']) {
            $query->whereDate('created_at', '>=', $filters['from']);
        }
        if ($filters['to']) {
            $query->whereDate('created_at', '<=', $filters['to']);
        }

        $events = $query->orderByDesc('created_at')->paginate(25)->withQueryString();

        $summaryByType = (clone $query)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit(20)
            ->get();

        $summaryBySession = (clone $query)
            ->selectRaw('exam_session_id, COUNT(*) as count')
            ->groupBy('exam_session_id')
            ->orderByDesc('count')
            ->limit(20)
            ->get();

        $exams = Exam::query()->select('id','title')->orderBy('title')->get();

        return Inertia::render('Admins/Proctoring/Events/Index', [
            'events' => $events,
            'filters' => $filters,
            'exams' => $exams,
            'summaryByType' => $summaryByType,
            'summaryBySession' => $summaryBySession,
        ]);
    }
}
