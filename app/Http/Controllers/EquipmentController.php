<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipment::latest();
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('identification', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }
        $equipment = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();
        return response()->json($equipment);
    }

    public function store(Request $request)
    {
        Log::info('Tentativa de cadastro de equipamento', [
            'user_id' => auth()->id(),
            'input' => $request->all(),
        ]);
        try {
            if (Gate::denies('create-equipment')) {
                Log::warning('Permissão negada para criar equipamento', ['user_id' => auth()->id()]);
                return response()->json(['message' => 'Ação não autorizada.'], 403);
            }
            $validated = $request->validate([
                'identification' => 'required|string|max:255',
                'manufacturer' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'nullable|string|max:255',
                'location' => 'nullable|string|max:255',
                'status' => 'required|in:em_uso,em_calibracao,em_manutencao,fora_de_servico',
                'last_calibration_at' => 'nullable|date',
                'next_calibration_at' => 'nullable|date|after_or_equal:last_calibration_at',
                'last_maintenance_at' => 'nullable|date',
                'unique_code' => 'required|string|unique:equipment,unique_code',
                'certificate_id' => 'nullable|exists:certificates,id',
                'notes' => 'nullable|string',
            ]);
            $equipment = Equipment::create($validated);
            $user = auth()->user();
            AuditLog::create([
                'action' => 'criação equipamento',
                'user_email' => $user ? $user->email : null,
                'user_role' => $user ? $user->role : null,
                'details' => [
                    'equipment_id' => $equipment->id,
                    'identification' => $equipment->identification,
                    'operation' => 'Equipamento criado'
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json($equipment, 201);
        } catch (\Exception $e) {
            Log::error('Erro ao cadastrar equipamento', [
                'user_id' => auth()->id(),
                'input' => $request->all(),
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro interno ao cadastrar equipamento', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Equipment $equipment)
    {
        return response()->json($equipment);
    }

    public function update(Request $request, Equipment $equipment)
    {
        if (Gate::denies('update-equipment', $equipment)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'identification' => 'required|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'status' => 'required|in:em_uso,em_calibracao,em_manutencao,fora_de_servico',
            'last_calibration_at' => 'nullable|date',
            'next_calibration_at' => 'nullable|date|after_or_equal:last_calibration_at',
            'last_maintenance_at' => 'nullable|date',
            'unique_code' => 'required|string|unique:equipment,unique_code,' . $equipment->id,
            'certificate_id' => 'nullable|exists:certificates,id',
            'notes' => 'nullable|string',
        ]);
        $equipment->update($validated);
        $user = auth()->user();
        AuditLog::create([
            'action' => 'edição equipamento',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'equipment_id' => $equipment->id,
                'identification' => $equipment->identification,
                'operation' => 'Equipamento editado'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($equipment);
    }

    public function destroy(Request $request, Equipment $equipment)
    {
        if (Gate::denies('delete-equipment', $equipment)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $equipment->delete();
        $user = auth()->user();
        AuditLog::create([
            'action' => 'exclusão equipamento',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'equipment_id' => $equipment->id,
                'identification' => $equipment->identification,
                'operation' => 'Equipamento excluído'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(null, 204);
    }
} 