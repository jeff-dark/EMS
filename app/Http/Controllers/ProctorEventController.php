<?php

namespace App\Http\Controllers;

use App\Models\{ExamSession, ProctorEvent};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProctorEventController extends Controller
{
    public function store(Request $request, ExamSession $session)
    {
        $this->authorize('view', $session);

        if (!is_null($session->submitted_at)) {
            return response()->json(['status' => 'forbidden', 'message' => 'Exam already submitted.'], 403);
        }

        $data = $request->validate([
            'type' => 'required|string|max:64',
            'details' => 'nullable|array',
        ]);

        ProctorEvent::create([
            'exam_session_id' => $session->id,
            'user_id' => Auth::id(),
            'type' => $data['type'],
            'details' => $data['details'] ?? null,
        ]);

        return response()->json(['status' => 'ok']);
    }
}
