<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\DocumentRevision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['category', 'creator', 'reviewer'])
            ->latest();

        // Filtros
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $documents = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();

        return response()->json($documents);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        Log::info('[DocumentController@store:INICIO]', ['user_id' => $user?->id, 'role' => $user?->role, 'email' => $user?->email]);
        try {
            Log::info('[DocumentController@store:ANTES_PERMISSAO]', ['user_id' => $user?->id, 'role' => $user?->role]);
            if (Gate::denies('create-document')) {
                Log::warning('[DocumentController@store:PERMISSAO_NEGADA]', ['user_id' => $user?->id, 'role' => $user?->role]);
                return response()->json(['message' => 'Ação não autorizada.'], 403);
            }
            Log::info('[DocumentController@store:PERMISSAO_OK]', ['user_id' => $user?->id, 'role' => $user?->role]);
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category_id' => 'required|exists:document_categories,id',
                'version' => 'required|string|max:50',
                'effective_date' => 'required|date',
                'review_date' => 'required|date|after:effective_date',
                'file' => 'required|file|max:10240', // 10MB max
                'is_controlled' => 'boolean'
            ]);
            Log::info('[DocumentController@store:VALIDACAO_OK]', $validated);

            // Gerar código único para o documento
            $category = DocumentCategory::findOrFail($validated['category_id']);
            $code = $this->generateDocumentCode($category);

            // Fazer upload do arquivo
            $file = $request->file('file');
            $path = $file->store('documents/' . now()->format('Y/m'), 'public');

            // Criar documento
            $document = Document::create([
                'code' => $code,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'category_id' => $validated['category_id'],
                'version' => $validated['version'],
                'status' => 'rascunho',
                'effective_date' => $validated['effective_date'],
                'review_date' => $validated['review_date'],
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'created_by' => auth()?->id(),
                'is_controlled' => $validated['is_controlled'] ?? true,
            ]);

            // Criar primeira revisão
            $document->revisions()->create([
                'version' => $validated['version'],
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'created_by' => auth()?->id(),
                'status' => 'rascunho',
            ]);

            $user = auth()?->user();
            AuditLog::create([
                'action' => 'criação',
                'user_email' => $user?->email,
                'user_role' => $user?->role,
                'details' => [
                    'document_id' => $document->id,
                    'title' => $document->title,
                    'operation' => 'Documento criado'
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json($document->load('category', 'creator'), 201);
        } catch (\Exception $e) {
            Log::error('[DocumentController@store:ERRO]', ['exception' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Erro interno ao cadastrar documento', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Document $document)
    {
        return response()->json($document->load([
            'category', 
            'creator', 
            'reviewer', 
            'revisions.creator', 
            'revisions.reviewer'
        ]));
    }

    public function update(Request $request, Document $document)
    {
        if (Gate::denies('update-document', $document)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:document_categories,id',
            'version' => 'required|string|max:50',
            'status' => 'required|in:rascunho,em_revisao,aprovado,obsoleto',
            'effective_date' => 'required|date',
            'review_date' => 'required|date|after:effective_date',
            'review_notes' => 'required_if:status,aprovado,obsoleto|nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
            'changes' => 'nullable|string',
            'is_controlled' => 'boolean'
        ]);

        // Se houver um novo arquivo, fazer upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('documents/' . now()->format('Y/m'), 'public');

            // Atualizar informações do arquivo
            $document->update([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            // Criar nova revisão
            $document->revisions()->create([
                'version' => $validated['version'],
                'changes' => $validated['changes'] ?? 'Atualização de arquivo',
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'created_by' => auth()?->id(),
                'status' => $validated['status'],
                'reviewed_by' => $validated['status'] === 'aprovado' ? auth()?->id() : null,
                'reviewed_at' => $validated['status'] === 'aprovado' ? now() : null,
                'review_notes' => $validated['review_notes'] ?? null,
            ]);
        }

        // Atualizar informações do documento
        $document->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'version' => $validated['version'],
            'status' => $validated['status'],
            'effective_date' => $validated['effective_date'],
            'review_date' => $validated['review_date'],
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_by' => $validated['status'] === 'aprovado' ? auth()?->id() : $document->reviewed_by,
            'reviewed_at' => $validated['status'] === 'aprovado' ? now() : $document->reviewed_at,
            'is_controlled' => $validated['is_controlled'] ?? $document->is_controlled,
        ]);

        $user = auth()?->user();
        AuditLog::create([
            'action' => 'edição',
            'user_email' => $user?->email,
            'user_role' => $user?->role,
            'details' => [
                'document_id' => $document->id,
                'title' => $document->title,
                'operation' => 'Documento editado'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($document->load('category', 'creator', 'reviewer'));
    }

    public function destroy(Request $request, Document $document)
    {
        if (Gate::denies('delete-document', $document)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        // Verificar se o documento pode ser excluído
        if ($document->distributions()->where('is_returned', false)->exists()) {
            return response()->json([
                'message' => 'Não é possível excluir um documento que possui distribuições ativas.'
            ], 422);
        }

        // Excluir arquivos físicos
        Storage::delete([
            $document->file_path,
            ...$document->revisions->pluck('file_path')->toArray()
        ]);

        // Excluir registros do banco de dados
        $document->revisions()->delete();
        $document->distributions()->delete();
        $document->delete();

        $user = auth()?->user();
        AuditLog::create([
            'action' => 'exclusão',
            'user_email' => $user?->email,
            'user_role' => $user?->role,
            'details' => [
                'document_id' => $document->id,
                'title' => $document->title,
                'operation' => 'Documento excluído'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(null, 204);
    }

    public function download(Request $request, Document $document)
    {
        if (Gate::denies('view-document', $document)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        if (!Storage::exists($document->file_path)) {
            return response()->json(['message' => 'Arquivo não encontrado.'], 404);
        }

        $user = auth()?->user();
        AuditLog::create([
            'action' => 'download',
            'user_email' => $user?->email,
            'user_role' => $user?->role,
            'details' => [
                'document_id' => $document->id,
                'title' => $document->title,
                'operation' => 'Download do documento'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return Storage::download($document->file_path, $document->file_name);
    }

    public function downloadRevision(DocumentRevision $revision)
    {
        if (!Storage::exists($revision->file_path)) {
            return response()->json(['message' => 'Arquivo não encontrado.'], 404);
        }

        return Storage::download($revision->file_path, $revision->file_name);
    }

    public function getCategories()
    {
        $categories = DocumentCategory::orderBy('name')->get();
        return response()->json($categories);
    }

    protected function generateDocumentCode(DocumentCategory $category)
    {
        $prefix = strtoupper(Str::slug($category->code, '_')) . '-';
        $number = 1;
        do {
            $code = $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
            $exists = Document::where('code', $code)->exists();
            $number++;
        } while ($exists);

        return $code;
    }
}
