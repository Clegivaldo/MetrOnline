<?php

namespace App\Http\Controllers;

use App\Models\CalibrationCertificate;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class CalibrationCertificateController extends Controller
{
    public function index(Request $request)
    {
        $query = CalibrationCertificate::with('equipment')->latest();
        if ($request->has('equipment_id')) {
            $query->where('equipment_id', $request->equipment_id);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                  ->orWhere('laboratory', 'like', "%{$search}%");
            });
        }
        $certificates = $request->has('per_page')
            ? $query->paginate($request->per_page)
            : $query->get();
        return response()->json($certificates);
    }

    public function store(Request $request)
    {
        if (Gate::denies('create-certificate')) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'certificate_number' => 'required|string|unique:calibration_certificates,certificate_number',
            'issued_at' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:issued_at',
            'laboratory' => 'nullable|string|max:255',
            'file' => 'required|file|max:10240',
            'notes' => 'nullable|string',
        ]);
        $file = $request->file('file');
        $path = $file->store('certificates/' . now()->format('Y/m'));
        $certificate = CalibrationCertificate::create([
            'equipment_id' => $validated['equipment_id'],
            'certificate_number' => $validated['certificate_number'],
            'issued_at' => $validated['issued_at'],
            'valid_until' => $validated['valid_until'] ?? null,
            'laboratory' => $validated['laboratory'] ?? null,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'notes' => $validated['notes'] ?? null,
        ]);
        $user = auth()->user();
        AuditLog::create([
            'action' => 'criação certificado',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'certificate_id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'operation' => 'Certificado criado'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($certificate, 201);
    }

    public function show(CalibrationCertificate $calibrationCertificate)
    {
        return response()->json($calibrationCertificate->load('equipment'));
    }

    public function update(Request $request, CalibrationCertificate $calibrationCertificate)
    {
        if (Gate::denies('update-certificate', $calibrationCertificate)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        $validated = $request->validate([
            'certificate_number' => 'required|string|unique:calibration_certificates,certificate_number,' . $calibrationCertificate->id,
            'issued_at' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:issued_at',
            'laboratory' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:10240',
            'notes' => 'nullable|string',
        ]);
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('certificates/' . now()->format('Y/m'));
            $calibrationCertificate->update([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }
        $calibrationCertificate->update([
            'certificate_number' => $validated['certificate_number'],
            'issued_at' => $validated['issued_at'],
            'valid_until' => $validated['valid_until'] ?? null,
            'laboratory' => $validated['laboratory'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);
        $user = auth()->user();
        AuditLog::create([
            'action' => 'edição certificado',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'certificate_id' => $calibrationCertificate->id,
                'certificate_number' => $calibrationCertificate->certificate_number,
                'operation' => 'Certificado editado'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json($calibrationCertificate);
    }

    public function destroy(Request $request, CalibrationCertificate $calibrationCertificate)
    {
        if (Gate::denies('delete-certificate', $calibrationCertificate)) {
            return response()->json(['message' => 'Ação não autorizada.'], 403);
        }
        Storage::delete($calibrationCertificate->file_path);
        $calibrationCertificate->delete();
        $user = auth()->user();
        AuditLog::create([
            'action' => 'exclusão certificado',
            'user_email' => $user ? $user->email : null,
            'user_role' => $user ? $user->role : null,
            'details' => [
                'certificate_id' => $calibrationCertificate->id,
                'certificate_number' => $calibrationCertificate->certificate_number,
                'operation' => 'Certificado excluído'
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        return response()->json(null, 204);
    }
} 