<?php

namespace App\Http\Controllers;

use App\Models\InternalAudit;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class InternalAuditController extends Controller
{
    public function index(Request $request)
    {
        $query = InternalAudit::with('auditor')->latest();
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $audits = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();
        return response()->json($audits);
    }

    public function store(Request $request)
    {
        if (Gate::denies('create-internal-audit')) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'planned_at' => 'nullable|date',
            'executed_at' => 'nullable|date|after_or_equal:planned_at',
            'auditor_id' => 'required|exists:users,id',
            'status' => 'required|in:planejada,em_execucao,concluida',
            'findings' => 'nullable|string',
            'actions' => 'nullable|string',
            'effectiveness_verification' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $audit = InternalAudit::create($validated);
        $user = auth()->user();
        AuditLog::create([
            'action' => 'criação auditoria interna',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'internal_audit_id' => $audit->id,
                'title' => $audit->title,
                'operation' => 'Auditoria interna criada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($audit, 201);
    }

    public function show(InternalAudit $internalAudit)
    {
        return response()->json($internalAudit->load('auditor'));
    }

    public function update(Request $request, InternalAudit $internalAudit)
    {
        if (Gate::denies('update-internal-audit', $internalAudit)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'planned_at' => 'nullable|date',
            'executed_at' => 'nullable|date|after_or_equal:planned_at',
            'auditor_id' => 'required|exists:users,id',
            'status' => 'required|in:planejada,em_execucao,concluida',
            'findings' => 'nullable|string',
            'actions' => 'nullable|string',
            'effectiveness_verification' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $internalAudit->update($validated);
        $user = auth()->user();
        AuditLog::create([
            'action' => 'edição auditoria interna',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'internal_audit_id' => $internalAudit->id,
                'title' => $internalAudit->title,
                'operation' => 'Auditoria interna editada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($internalAudit);
    }

    public function destroy(Request $request, InternalAudit $internalAudit)
    {
        if (Gate::denies('delete-internal-audit', $internalAudit)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $internalAudit->delete();
        $user = auth()->user();
        AuditLog::create([
            'action' => 'exclusão auditoria interna',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'internal_audit_id' => $internalAudit->id,
                'title' => $internalAudit->title,
                'operation' => 'Auditoria interna excluída'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(null, 204);
    }
} 