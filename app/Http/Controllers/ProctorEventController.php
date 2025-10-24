<?php

namespace App\Http\Controllers;

use App\Models\ExamSession;
use App\Models\ProctorEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProctorEventController extends Controller
{
    public function store(Request $request, ExamSession $session)
    {
        $user = Auth::user();
        // Only the session owner can post client-side events
        if (!$user || (int)$session->user_id !== (int)$user->id) {
            abort(403);
        }

        $data = $request->validate([
            'type' => ['required','string','max:100'],
            'details' => ['nullable','array'],
        ]);

        ProctorEvent::create([
            'exam_session_id' => $session->id,
            'user_id' => $user->id,
            'type' => $data['type'],
            'details' => $data['details'] ?? null,
        ]);

        return response()->json(['status' => 'ok']);
    }
}
