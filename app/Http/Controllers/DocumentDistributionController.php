<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentDistribution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Gate;

class DocumentDistributionController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentDistribution::with(['document', 'user', 'distributedBy', 'returnedTo'])
            ->latest('distributed_at');

        // Filtros
        if ($request->has('document_id')) {
            $query->where('document_id', $request->document_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_returned', false);
            } elseif ($request->status === 'returned') {
                $query->where('is_returned', true);
            }
        }

        if ($request->has('start_date')) {
            $query->where('distributed_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('distributed_at', '<=', $request->end_date . ' 23:59:59');
        }

        $distributions = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();

        return response()->json($distributions);
    }

    public function store(Request $request)
    {
        if (Gate::denies('distribute-document')) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'document_id' => 'required|exists:documents,id',
            'user_id' => 'required|exists:users,id',
            'distributed_at' => 'required|date',
            'expected_return_date' => 'required|date|after:distributed_at',
            'notes' => 'nullable|string',
        ]);

        // Verificar se o documento já está em posse do usuário
        $activeDistribution = DocumentDistribution::where('document_id', $validated['document_id'])
            ->where('user_id', $validated['user_id'])
            ->where('is_returned', false)
            ->exists();

        if ($activeDistribution) {
            return response()->json([
                'message' => 'Este documento já está em posse do usuário selecionado.'
            ], 422);
        }

        // Verificar se o documento está disponível para distribuição
        $document = Document::findOrFail($validated['document_id']);
        if (!$document->is_controlled) {
            return response()->json([
                'message' => 'Este documento não é controlado e não pode ser distribuído.'
            ], 422);
        }

        // Criar distribuição
        $distribution = DocumentDistribution::create([
            'document_id' => $validated['document_id'],
            'user_id' => $validated['user_id'],
            'distributed_at' => $validated['distributed_at'],
            'expected_return_date' => $validated['expected_return_date'],
            'notes' => $validated['notes'] ?? null,
            'distributed_by' => auth()->id(),
            'is_returned' => false,
        ]);

        $user = auth()->user();
        AuditLog::create([
            'action' => 'distribuição',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'distribution_id' => $distribution->id,
                'document_id' => $distribution->document_id,
                'user_id' => $distribution->user_id,
                'operation' => 'Documento distribuído'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($distribution->load('document', 'user', 'distributedBy'), 201);
    }

    public function show(DocumentDistribution $distribution)
    {
        return response()->json($distribution->load('document', 'user', 'distributedBy', 'returnedTo'));
    }

    public function update(Request $request, DocumentDistribution $distribution)
    {
        if (Gate::denies('update-distribution', $distribution)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'distributed_at' => 'required|date',
            'expected_return_date' => 'required|date|after:distributed_at',
            'returned_at' => 'nullable|date|after_or_equal:distributed_at',
            'is_returned' => 'boolean',
            'return_notes' => 'nullable|required_if:is_returned,true|string',
        ]);

        // Se estiver marcando como devolvido
        if ($request->has('is_returned') && $request->is_returned && !$distribution->is_returned) {
            $validated['returned_at'] = $validated['returned_at'] ?? now();
            $validated['returned_to'] = auth()->id();
        }

        $distribution->update($validated);

        $user = auth()->user();
        AuditLog::create([
            'action' => 'atualização distribuição',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'distribution_id' => $distribution->id,
                'document_id' => $distribution->document_id,
                'user_id' => $distribution->user_id,
                'operation' => 'Distribuição atualizada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($distribution->load('document', 'user', 'distributedBy', 'returnedTo'));
    }

    public function returnDocument(Request $request, DocumentDistribution $distribution)
    {
        if (Gate::denies('return-distribution', $distribution)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        if ($distribution->is_returned) {
            return response()->json([
                'message' => 'Este documento já foi devolvido anteriormente.'
            ], 422);
        }

        $validated = $request->validate([
            'returned_at' => 'required|date|after_or_equal:distributed_at',
            'notes' => 'nullable|string',
        ]);

        $distribution->update([
            'returned_at' => $validated['returned_at'],
            'is_returned' => true,
            'returned_to' => auth()->id(),
            'notes' => $validated['notes'] ?? $distribution->notes,
        ]);

        $user = auth()->user();
        AuditLog::create([
            'action' => 'devolução',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'distribution_id' => $distribution->id,
                'document_id' => $distribution->document_id,
                'user_id' => $distribution->user_id,
                'operation' => 'Documento devolvido'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($distribution->load('document', 'user', 'distributedBy', 'returnedTo'));
    }

    public function getOverdueDistributions()
    {
        $overdue = DocumentDistribution::with(['document', 'user', 'distributedBy'])
            ->where('is_returned', false)
            ->where('expected_return_date', '<', now())
            ->orderBy('expected_return_date')
            ->get();

        return response()->json($overdue);
    }

    public function getUserActiveDistributions($userId)
    {
        $distributions = DocumentDistribution::with(['document', 'distributedBy'])
            ->where('user_id', $userId)
            ->where('is_returned', false)
            ->orderBy('expected_return_date')
            ->get();

        return response()->json($distributions);
    }
}
