<?php

namespace App\Http\Controllers;

use App\Models\NonConformity;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class NonConformityController extends Controller
{
    public function index(Request $request)
    {
        $query = NonConformity::with(['opener', 'closer'])->latest();
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        $nonConformities = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();
        return response()->json($nonConformities);
    }

    public function store(Request $request)
    {
        if (Gate::denies('create-non-conformity')) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'type' => 'required|in:interna,externa',
            'category' => 'nullable|string|max:255',
            'description' => 'required|string',
            'root_cause' => 'nullable|string',
            'corrective_action' => 'nullable|string',
            'preventive_action' => 'nullable|string',
            'effectiveness_verification' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $nonConformity = NonConformity::create(array_merge($validated, [
            'opened_by' => auth()->id(),
            'status' => 'aberta',
        ]));
        $user = auth()->user();
        AuditLog::create([
            'action' => 'criação não conformidade',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'non_conformity_id' => $nonConformity->id,
                'type' => $nonConformity->type,
                'operation' => 'Não conformidade criada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($nonConformity, 201);
    }

    public function show(NonConformity $nonConformity)
    {
        return response()->json($nonConformity->load(['opener', 'closer']));
    }

    public function update(Request $request, NonConformity $nonConformity)
    {
        if (Gate::denies('update-non-conformity', $nonConformity)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'category' => 'nullable|string|max:255',
            'description' => 'required|string',
            'root_cause' => 'nullable|string',
            'corrective_action' => 'nullable|string',
            'preventive_action' => 'nullable|string',
            'effectiveness_verification' => 'nullable|string',
            'status' => 'required|in:aberta,em_andamento,encerrada',
            'notes' => 'nullable|string',
        ]);
        $updateData = $validated;
        if ($validated['status'] === 'encerrada' && !$nonConformity->closed_at) {
            $updateData['closed_by'] = auth()->id();
            $updateData['closed_at'] = now();
        }
        $nonConformity->update($updateData);
        $user = auth()->user();
        AuditLog::create([
            'action' => 'edição não conformidade',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'non_conformity_id' => $nonConformity->id,
                'type' => $nonConformity->type,
                'operation' => 'Não conformidade editada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($nonConformity);
    }

    public function destroy(Request $request, NonConformity $nonConformity)
    {
        if (Gate::denies('delete-non-conformity', $nonConformity)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $nonConformity->delete();
        $user = auth()->user();
        AuditLog::create([
            'action' => 'exclusão não conformidade',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'non_conformity_id' => $nonConformity->id,
                'type' => $nonConformity->type,
                'operation' => 'Não conformidade excluída'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(null, 204);
    }
} 