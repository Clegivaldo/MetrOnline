<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TrainingController extends Controller
{
    public function index(Request $request)
    {
        $query = Training::with('user')->latest();
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        $trainings = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();
        return response()->json($trainings);
    }

    public function store(Request $request)
    {
        Log::info('Tentativa de cadastro de treinamento', [
            'user_id' => auth()->id(),
            'input' => $request->all(),
            'files' => $request->allFiles()
        ]);
        try {
            if (Gate::denies('create-training')) {
                Log::warning('Permissão negada para criar treinamento', ['user_id' => auth()->id()]);
                return response()->json(['message' => 'Ação não autorizada.'], 403);
            }
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'planned_at' => 'nullable|date',
                'executed_at' => 'nullable|date|after_or_equal:planned_at',
                'effectiveness_evaluation' => 'nullable|string',
                'file' => 'nullable|file|max:10240',
            ]);
            $fileData = [];
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $path = $file->store('trainings/' . now()->format('Y/m'));
                $fileData = [
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ];
            }
            $training = Training::create(array_merge($validated, $fileData));
            $user = auth()->user();
            AuditLog::create([
                'action' => 'criação treinamento',
                'user_email' => $user ? $user->email : null,
                'user_role' => $user ? $user->role : null,
                'details' => [
                    'training_id' => $training->id,
                    'title' => $training->title,
                    'operation' => 'Treinamento criado'
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json($training, 201);
        } catch (\Exception $e) {
            Log::error('Erro ao cadastrar treinamento', [
                'user_id' => auth()->id(),
                'input' => $request->all(),
                'files' => $request->allFiles(),
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro interno ao cadastrar treinamento', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Training $training)
    {
        return response()->json($training->load('user'));
    }

    public function update(Request $request, Training $training)
    {
        if (Gate::denies('update-training', $training)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'planned_at' => 'nullable|date',
            'executed_at' => 'nullable|date|after_or_equal:planned_at',
            'effectiveness_evaluation' => 'nullable|string',
            'file' => 'nullable|file|max:10240',
        ]);
        $fileData = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('trainings/' . now()->format('Y/m'));
            $fileData = [
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ];
        }
        $training->update(array_merge($validated, $fileData));
        $user = auth()->user();
        AuditLog::create([
            'action' => 'edição treinamento',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'training_id' => $training->id,
                'title' => $training->title,
                'operation' => 'Treinamento editado'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($training);
    }

    public function destroy(Request $request, Training $training)
    {
        if (Gate::denies('delete-training', $training)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        Storage::delete($training->file_path);
        $training->delete();
        $user = auth()->user();
        AuditLog::create([
            'action' => 'exclusão treinamento',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'training_id' => $training->id,
                'title' => $training->title,
                'operation' => 'Treinamento excluído'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(null, 204);
    }
} 