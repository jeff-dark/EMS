<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\AuditLogger;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AuditLog::class);

        $query = AuditLog::query()->with('user')->latest('created_at');
        $this->applyFilters($query, $request);

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('Admins/Logs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['from', 'to', 'user', 'type', 'status', 'target_type', 'target_id', 'search']),
        ]);
    }

    public function export(Request $request, AuditLogger $logger): StreamedResponse
    {
        $this->authorize('viewAny', AuditLog::class);
        $query = AuditLog::query()->with('user')->latest('created_at');
        $this->applyFilters($query, $request);

        $filename = 'audit-logs-'.now()->format('Ymd_His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $columns = ['timestamp','user_id','user_name','action_type','action','status','target_type','target_id','ip_address','method','url'];

        $callback = function () use ($query, $columns) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns);
            $query->chunk(500, function ($rows) use ($handle) {
                foreach ($rows as $log) {
                    fputcsv($handle, [
                        optional($log->created_at)->toIso8601String(),
                        $log->user_id,
                        optional($log->user)->name,
                        $log->action_type,
                        $log->action,
                        $log->status,
                        $log->target_type,
                        $log->target_id,
                        $log->ip_address,
                        $log->method,
                        $log->url,
                    ]);
                }
            });
            fclose($handle);
        };

        $response = response()->stream($callback, 200, $headers);

        // fire export audit log
        $logger->log('export', 'Exported audit logs CSV', [
            'status' => 'success',
            'metadata' => $request->only(['from','to','user','type','status','target_type','target_id','search'])
        ], $request);

        return $response;
    }

    private function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->date('from')->startOfDay());
        }
        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->date('to')->endOfDay());
        }
        if ($request->filled('user')) {
            $query->where('user_id', $request->input('user'));
        }
        if ($request->filled('type')) {
            $query->where('action_type', $request->input('type'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('target_type')) {
            $query->where('target_type', $request->input('target_type'));
        }
        if ($request->filled('target_id')) {
            $query->where('target_id', $request->input('target_id'));
        }
        if ($request->filled('search')) {
            $term = '%'.strtolower($request->input('search')).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(action) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(url) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(target_type) LIKE ?', [$term])
                  ->orWhere('target_id', 'LIKE', $term);
            });
        }
    }
}
