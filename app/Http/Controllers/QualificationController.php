<?php

namespace App\Http\Controllers;

use App\Models\Qualification;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class QualificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Qualification::with('user')->latest();
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        $qualifications = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();
        return response()->json($qualifications);
    }

    public function store(Request $request)
    {
        if (Gate::denies('create-qualification')) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:competencia,autorizacao',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'issued_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:issued_at',
            'issued_by' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:10240',
        ]);
        $fileData = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('qualifications/' . now()->format('Y/m'));
            $fileData = [
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ];
        }
        $qualification = Qualification::create(array_merge($validated, $fileData));
        $user = auth()->user();
        AuditLog::create([
            'action' => 'criação qualificação',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'qualification_id' => $qualification->id,
                'name' => $qualification->name,
                'operation' => 'Qualificação criada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($qualification, 201);
    }

    public function show(Qualification $qualification)
    {
        return response()->json($qualification->load('user'));
    }

    public function update(Request $request, Qualification $qualification)
    {
        if (Gate::denies('update-qualification', $qualification)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'issued_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:issued_at',
            'issued_by' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:10240',
        ]);
        $fileData = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('qualifications/' . now()->format('Y/m'));
            $fileData = [
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ];
        }
        $qualification->update(array_merge($validated, $fileData));
        $user = auth()->user();
        AuditLog::create([
            'action' => 'edição qualificação',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'qualification_id' => $qualification->id,
                'name' => $qualification->name,
                'operation' => 'Qualificação editada'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($qualification);
    }

    public function destroy(Request $request, Qualification $qualification)
    {
        if (Gate::denies('delete-qualification', $qualification)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        Storage::delete($qualification->file_path);
        $qualification->delete();
        $user = auth()->user();
        AuditLog::create([
            'action' => 'exclusão qualificação',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'qualification_id' => $qualification->id,
                'name' => $qualification->name,
                'operation' => 'Qualificação excluída'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(null, 204);
    }
} 