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
            // Validação dos dados do documento e do arquivo
            $validatedDoc = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category_id' => 'required|exists:document_categories,id',
                'is_controlled' => 'boolean',
                'code' => 'required|string|max:255|unique:documents,code',
                'file' => 'nullable|file|mimes:pdf|max:10240',
            ]);
            Log::info('[DocumentController@store:VALIDACAO_OK]', $validatedDoc);

            // Upload do arquivo, se existir
            $filePath = null;
            $fileName = null;
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = $file->getClientOriginalName();
                $filePath = $file->store('documents', 'public');
                Log::info('[DocumentController@store:UPLOAD_OK]', ['file_name' => $fileName, 'file_path' => $filePath]);
            }

            // Criar documento
            $document = Document::create([
                'code' => $validatedDoc['code'],
                'title' => $validatedDoc['title'],
                'description' => $validatedDoc['description'] ?? null,
                'category_id' => $validatedDoc['category_id'],
                'is_controlled' => $validatedDoc['is_controlled'] ?? true,
                'created_by' => $user?->id,
                'file_path' => $filePath,
                'file_name' => $fileName,
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
        $document->load(['category', 'creator']);
        $latestRevision = $document->revisions()->latest()->first();
        return response()->json([
            'id' => $document->id,
            'title' => $document->title,
            'code' => $document->code,
            'description' => $document->description,
            'category_id' => $document->category_id,
            'category_name' => $document->category ? $document->category->name : null,
            'is_controlled' => $document->is_controlled,
            'file_name' => $latestRevision ? $latestRevision->file_name : $document->file_name,
            'file_path' => $latestRevision ? $latestRevision->file_path : $document->file_path,
            'version' => $latestRevision ? $latestRevision->version : null,
            'created_by' => $document->created_by,
            'created_by_name' => $document->creator ? $document->creator->name : null,
            'created_at' => $document->created_at,
            'updated_at' => $document->updated_at,
        ]);
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
            'is_controlled' => 'boolean',
            'code' => [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('documents', 'code')->ignore($document->id),
            ],
            'file' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        // Upload de novo arquivo, se fornecido
        $filePath = $document->file_path;
        $fileName = $document->file_name;
        if ($request->hasFile('file')) {
            // Deleta o arquivo antigo, se existir
            if ($filePath && \Storage::disk('public')->exists($filePath)) {
                \Log::info('Deletando arquivo antigo ao atualizar documento', ['file_path' => $filePath]);
                \Storage::disk('public')->delete($filePath);
            }
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('documents', 'public');
            \Log::info('Novo arquivo enviado ao atualizar documento', ['file_name' => $fileName, 'file_path' => $filePath]);
        }

        // Atualizar dados do documento
        $document->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'is_controlled' => $validated['is_controlled'] ?? $document->is_controlled,
            'code' => $validated['code'],
            'file_path' => $filePath,
            'file_name' => $fileName,
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
        // Excluir arquivo principal se existir
        if ($document->file_path && \Storage::disk('public')->exists($document->file_path)) {
            \Log::info('Tentando deletar arquivo:', ['file_path' => $document->file_path]);
            \Storage::disk('public')->delete($document->file_path);
        }
        // Excluir arquivos das revisões
        if ($document->revisions && $document->revisions->count()) {
            foreach ($document->revisions as $rev) {
                if ($rev->file_path && \Storage::disk('public')->exists($rev->file_path)) {
                    \Storage::disk('public')->delete($rev->file_path);
                }
            }
        }

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

        return Storage::download($revision->file_path, $revision->file_name);
    }

    // Download do PDF do documento (última revisão ou principal)
    public function download(Request $request, Document $document)
    {
        if (\Gate::denies('view-document', $document)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }

        // Buscar última revisão
        $latestRevision = $document->revisions()->latest()->first();
        $filePath = $latestRevision ? $latestRevision->file_path : $document->file_path;
        $fileName = $latestRevision ? $latestRevision->file_name : $document->file_name;

        if (empty($filePath) || !\Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Arquivo não encontrado.'], 404);
        }

        $user = auth()?->user();
        \App\Models\AuditLog::create([
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

        return \Storage::disk('public')->download($filePath, $fileName);
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
