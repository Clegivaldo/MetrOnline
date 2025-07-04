<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentRevision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\AuditLog;

class DocumentRevisionController extends Controller
{
    public function store(Request $request, $documentId)
    {
        $user = $request->user();
        Log::info('[DocumentRevisionController@store:INICIO]', ['user_id' => $user?->id, 'document_id' => $documentId]);
        $document = Document::findOrFail($documentId);
        if (Gate::denies('create-revision', $document)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'version' => 'required|string|max:50',
            'revision_date' => 'required|date',
            'file' => 'required|file|mimes:pdf|max:10240',
            'observations' => 'nullable|string',
            'status' => 'required|in:rascunho,vigente,obsoleto,em_revisao,rejeitado',
        ]);
        // Garante que só uma revisão "vigente" por documento
        if ($validated['status'] === 'vigente') {
            DocumentRevision::where('document_id', $document->id)
                ->where('status', 'vigente')
                ->update(['status' => 'obsoleto']);
        }
        $file = $request->file('file');
        $path = $file->store('documents/' . now()->format('Y/m'), 'public');
        $revision = $document->revisions()->create([
            'version' => $validated['version'],
            'revision_date' => $validated['revision_date'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'created_by' => $user?->id,
            'observations' => $validated['observations'] ?? null,
            'status' => $validated['status'],
        ]);
        AuditLog::create([
            'action' => 'nova_revisao',
            'user_email' => $user?->email,
            'user_role' => $user?->role,
            'details' => [
                'document_id' => $document->id,
                'revision_id' => $revision->id,
                'operation' => 'Nova revisão criada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($revision->load('creator'), 201);
    }

    public function index($documentId)
    {
        $document = Document::findOrFail($documentId);
        $revisions = $document->revisions()->with('creator')->orderByDesc('revision_date')->get();
        return response()->json($revisions);
    }

    public function show($documentId, $revisionId)
    {
        $revision = DocumentRevision::where('document_id', $documentId)->findOrFail($revisionId);
        return response()->json($revision->load('creator'));
    }

    public function download($documentId, $revisionId)
    {
        $revision = DocumentRevision::where('document_id', $documentId)->findOrFail($revisionId);
        if (!Storage::exists($revision->file_path)) {
            return response()->json(['message' => 'Arquivo não encontrado.'], 404);
        }
        return Storage::download($revision->file_path, $revision->file_name);
    }
}
