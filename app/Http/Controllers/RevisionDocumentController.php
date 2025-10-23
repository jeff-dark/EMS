<?php

namespace App\Http\Controllers;

use App\Models\{RevisionDocument, Unit, Teacher, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RevisionDocumentController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    // Teacher manage page
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $this->authorize('viewAny', \App\Models\RevisionDocument::class);

        $teacher = $user->hasRole('admin')
            ? Teacher::with('units:id,title')->first() // fallback for admin with no teacher profile
            : $user->teacher;

        $units = $teacher?->units()->get(['units.id','units.title']) ?? collect();

        $documents = RevisionDocument::query()
            ->with('unit:id,title')
            ->when(!$user->hasRole('admin'), fn($q) => $q->where('teacher_id', optional($teacher)->id))
            ->orderByDesc('created_at')
            ->get()
            ->map(function($doc){
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'description' => $doc->description,
                    'unit' => [ 'id' => $doc->unit->id, 'title' => $doc->unit->title ],
                    'created_at' => $doc->created_at->toDateTimeString(),
                    'size' => $doc->file_size,
                    'mime' => $doc->mime,
                ];
            });

        return Inertia::render('Teachers/Revision/Index', [
            'units' => $units,
            'documents' => $documents,
        ]);
    }

    public function store(Request $request)
    {
    /** @var User $user */
    $user = Auth::user();
    $this->authorize('create', \App\Models\RevisionDocument::class);

        $data = $request->validate([
            'unit_id' => 'required|integer|exists:units,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'file' => 'required|file|mimes:pdf|mimetypes:application/pdf|max:20480', // 20MB
        ]);

        // Authorization: teacher must be assigned to the selected unit (unless admin)
        if (!$user->hasRole('admin')) {
            $teacher = $user->teacher;
            if (!$teacher || !$teacher->units()->where('units.id', $data['unit_id'])->exists()) {
                abort(403, 'You are not assigned to this unit.');
            }
        } else {
            $teacher = $user->teacher ?? Teacher::first(); // store admin uploads under any teacher if none
        }

        $file = $data['file'];
        $subdir = 'uploads/revision/'.$data['unit_id'];
        Storage::disk('public')->makeDirectory($subdir);
        $storedPath = $file->store($subdir, 'public'); // hashed name

        $doc = RevisionDocument::create([
            'unit_id' => $data['unit_id'],
            'teacher_id' => $teacher?->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $storedPath, // relative to public disk
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime' => $file->getMimeType() ?? 'application/pdf',
        ]);

        return redirect()->route('revision.index')->with('message', 'Revision document uploaded.');
    }

    public function destroy(RevisionDocument $document)
    {
        $this->authorize('delete', $document);

        // Delete file from storage if exists
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        $document->delete();

        return back()->with('message', 'Revision document deleted.');
    }

    // Student list page
    public function studentIndex()
    {
        /** @var User $user */
        $user = Auth::user();
        $this->authorize('viewAny', \App\Models\RevisionDocument::class);

        $unitIds = $user->hasRole('student')
            ? $user->units()->pluck('units.id')
            : ($user->hasRole('teacher') ? $user->teacher?->units()->pluck('units.id') : collect());

        $documents = RevisionDocument::with('unit:id,title')
            ->whereIn('unit_id', $unitIds)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'title' => $d->title,
                'description' => $d->description,
                'unit' => [ 'id' => $d->unit->id, 'title' => $d->unit->title ],
                'created_at' => $d->created_at->toDateTimeString(),
                'size' => $d->file_size,
            ]);

        return Inertia::render('Student/Revision', [
            'documents' => $documents,
        ]);
    }

    public function download(RevisionDocument $document)
    {
        $this->authorize('view', $document);

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        $absolutePath = Storage::disk('public')->path($document->file_path);
        return response()->download($absolutePath, $document->original_name);
    }

    // Inline view in browser (PDF)
    public function view(RevisionDocument $document)
    {
        $this->authorize('view', $document);

        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        $absolutePath = Storage::disk('public')->path($document->file_path);
        // Let the browser render inline
        // Force a neutral inline filename so the browser tab doesn't show unwanted titles
        $inlineName = 'revision.pdf';
        return response()->file($absolutePath, [
            'Content-Type' => $document->mime ?? 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.addslashes($inlineName).'"',
        ]);
    }
}
