<?php

namespace App\Http\Controllers;

use App\Models\Record;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RecordController extends Controller
{
    public function index(Request $request)
    {
        $query = Record::with(['creator', 'certificate'])
            ->latest();
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        $records = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();
        return response()->json($records);
    }

    public function store(Request $request)
    {
        Log::info('Tentativa de cadastro de registro', [
            'user_id' => auth()->id(),
            'input' => $request->all(),
            'files' => $request->allFiles()
        ]);
        try {
            if (Gate::denies('create-record')) {
                Log::warning('Permissão negada para criar registro', ['user_id' => auth()->id()]);
                return response()->json(['message' => 'Ação não autorizada.'], 403);
            }
            $validated = $request->validate([
                'type' => 'required|in:dados_brutos,resultado_calibracao,certificado,relatorio',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'required|file|max:10240',
                'related_equipment_id' => 'nullable|integer',
                'related_certificate_id' => 'nullable|integer',
            ]);
            $file = $request->file('file');
            $path = $file->store('records/' . now()->format('Y/m'));
            $record = Record::create([
                'type' => $validated['type'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'created_by' => auth()->id(),
                'related_equipment_id' => $validated['related_equipment_id'] ?? null,
                'related_certificate_id' => $validated['related_certificate_id'] ?? null,
                'integrity_hash' => hash_file('sha256', $file->getRealPath()),
            ]);
            $user = auth()->user();
            AuditLog::create([
                'action' => 'criação registro',
                'user_email' => $user ? $user->email : null,
                'user_role' => $user ? $user->role : null,
                'details' => [
                    'record_id' => $record->id,
                    'title' => $record->title,
                    'operation' => 'Registro criado'
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json($record, 201);
        } catch (\Exception $e) {
            Log::error('Erro ao cadastrar registro', [
                'user_id' => auth()->id(),
                'input' => $request->all(),
                'files' => $request->allFiles(),
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro interno ao cadastrar registro', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Record $record)
    {
        return response()->json($record->load(['creator', 'certificate']));
    }

    public function update(Request $request, Record $record)
    {
        if (Gate::denies('update-record', $record)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:10240',
            'related_equipment_id' => 'nullable|integer',
            'related_certificate_id' => 'nullable|integer',
        ]);
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('records/' . now()->format('Y/m'));
            $record->update([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'integrity_hash' => hash_file('sha256', $file->getRealPath()),
            ]);
        }
        $record->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'related_equipment_id' => $validated['related_equipment_id'] ?? $record->related_equipment_id,
            'related_certificate_id' => $validated['related_certificate_id'] ?? $record->related_certificate_id,
        ]);
        $user = auth()->user();
        AuditLog::create([
            'action' => 'edição registro',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'record_id' => $record->id,
                'title' => $record->title,
                'operation' => 'Registro editado'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($record);
    }

    public function destroy(Request $request, Record $record)
    {
        if (Gate::denies('delete-record', $record)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        Storage::delete($record->file_path);
        $record->delete();
        $user = auth()->user();
        AuditLog::create([
            'action' => 'exclusão registro',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'record_id' => $record->id,
                'title' => $record->title,
                'operation' => 'Registro excluído'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(null, 204);
    }
} 