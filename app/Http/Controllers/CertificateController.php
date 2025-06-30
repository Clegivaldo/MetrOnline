<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Client;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Response;

class CertificateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Certificate::with(['client', 'uploadedBy']);

        // Filtro por cliente se o usuário for cliente
        if ($request->user() instanceof \App\Models\Client) {
            $query->where('client_id', $request->user()->id);
        }

        // Filtros
        $query->when($request->search, function ($q, $search) {
            return $q->where('certificate_number', 'like', "%{$search}%")
                    ->orWhere('equipment_name', 'like', "%{$search}%")
                    ->orWhere('equipment_model', 'like', "%{$search}%");
        });

        $query->when($request->client_id, function ($q, $clientId) {
            return $q->where('client_id', $clientId);
        });

        $query->when($request->status, function ($q, $status) {
            if ($status === 'expired') {
                return $q->expired();
            } elseif ($status === 'expiring') {
                return $q->expiringIn(30);
            } elseif ($status === 'valid') {
                return $q->valid();
            }
            return $q;
        });

        $certificates = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($certificates);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'certificate_number' => 'required|string|unique:certificates,certificate_number',
            'equipment_name' => 'required|string|max:255',
            'equipment_model' => 'nullable|string|max:255',
            'equipment_serial' => 'nullable|string|max:255',
            'calibration_date' => 'required|date',
            'expiry_date' => 'required|date|after:calibration_date',
            'next_calibration_date' => 'nullable|date|after:calibration_date',
            'calibration_company' => 'nullable|string|max:255',
            'uncertainty' => 'nullable|string|max:255',
            'measurement_range' => 'nullable|string|max:255',
            'calibration_standard' => 'nullable|string|max:255',
            'environmental_conditions' => 'nullable|string|max:255',
            'traceability' => 'nullable|string|max:255',
            'certificate_type' => 'nullable|string|max:255',
            'accreditation_body' => 'nullable|string|max:255',
            'accreditation_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'certificate' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
        ]);

        try {
            $data = [
                'client_id' => $request->client_id,
                'certificate_number' => $request->certificate_number,
                'equipment_name' => $request->equipment_name,
                'equipment_model' => $request->equipment_model,
                'equipment_serial' => $request->equipment_serial,
                'calibration_date' => $request->calibration_date,
                'expiry_date' => $request->expiry_date,
                'next_calibration_date' => $request->next_calibration_date,
                'calibration_company' => $request->calibration_company,
                'uncertainty' => $request->uncertainty,
                'measurement_range' => $request->measurement_range,
                'calibration_standard' => $request->calibration_standard,
                'environmental_conditions' => $request->environmental_conditions,
                'traceability' => $request->traceability,
                'certificate_type' => $request->certificate_type,
                'accreditation_body' => $request->accreditation_body,
                'accreditation_number' => $request->accreditation_number,
                'notes' => $request->notes,
                'uploaded_by' => $request->user()->id,
            ];

            // Upload do arquivo se fornecido
            if ($request->hasFile('certificate')) {
                $file = $request->file('certificate');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('certificates', $fileName, 'public');
                
                $data['file_path'] = $filePath;
                $data['file_name'] = $fileName;
            }

            $certificate = Certificate::create($data);

            // Log de auditoria
            AuditLog::create([
                'action' => 'Certificado criado',
                'user_email' => $request->user()->email,
                'user_role' => $request->user()->role,
                'details' => "Certificado criado: {$certificate->certificate_number}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json($certificate->load(['client', 'uploadedBy']), 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar certificado: ' . $e->getMessage());
            return response()->json(['error' => 'Erro ao criar certificado: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Certificate $certificate)
    {
        return response()->json($certificate->load(['client', 'uploadedBy']));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Certificate $certificate)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'certificate_number' => ['required', 'string', Rule::unique('certificates')->ignore($certificate->id)],
            'equipment_name' => 'required|string|max:255',
            'equipment_model' => 'nullable|string|max:255',
            'equipment_serial' => 'nullable|string|max:255',
            'calibration_date' => 'required|date',
            'expiry_date' => 'required|date|after:calibration_date',
            'next_calibration_date' => 'nullable|date|after:calibration_date',
            'calibration_company' => 'nullable|string|max:255',
            'uncertainty' => 'nullable|string|max:255',
            'measurement_range' => 'nullable|string|max:255',
            'calibration_standard' => 'nullable|string|max:255',
            'environmental_conditions' => 'nullable|string|max:255',
            'traceability' => 'nullable|string|max:255',
            'certificate_type' => 'nullable|string|max:255',
            'accreditation_body' => 'nullable|string|max:255',
            'accreditation_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'certificate' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $data = $request->only([
            'client_id', 'certificate_number', 'equipment_name', 'equipment_model', 'equipment_serial',
            'calibration_date', 'expiry_date', 'next_calibration_date', 'calibration_company',
            'uncertainty', 'measurement_range', 'calibration_standard', 'environmental_conditions',
            'traceability', 'certificate_type', 'accreditation_body', 'accreditation_number', 'notes'
        ]);

        // Upload de novo arquivo se fornecido
        if ($request->hasFile('certificate')) {
            // Deletar arquivo antigo
            if ($certificate->file_path) {
                Storage::disk('public')->delete($certificate->file_path);
            }

            $file = $request->file('certificate');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('certificates', $fileName, 'public');
            
            $data['file_path'] = $filePath;
            $data['file_name'] = $fileName;
        }

        $certificate->update($data);

        // Log de auditoria
        AuditLog::create([
            'action' => 'Certificado atualizado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'details' => "Certificado atualizado: {$certificate->certificate_number}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($certificate->load(['client', 'uploadedBy']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Certificate $certificate)
    {
        // Deletar arquivo físico
        if ($certificate->file_path) {
            Storage::disk('public')->delete($certificate->file_path);
        }

        $certificateNumber = $certificate->certificate_number;
        $certificate->delete();

        // Log de auditoria
        AuditLog::create([
            'action' => 'Certificado deletado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'details' => "Certificado deletado: {$certificateNumber}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Certificado deletado com sucesso']);
    }

    /**
     * Download do certificado
     */
    public function download(Certificate $certificate)
    {
        if (!Storage::disk('public')->exists($certificate->file_path)) {
            return response()->json(['error' => 'Arquivo não encontrado'], 404);
        }

        return Storage::disk('public')->download($certificate->file_path, $certificate->file_name);
    }

    /**
     * Estatísticas dos certificados
     */
    public function stats(Request $request)
    {
        $query = Certificate::query();

        // Filtro por cliente se o usuário for cliente
        if ($request->user() instanceof \App\Models\Client) {
            $query->where('client_id', $request->user()->id);
        }

        $stats = [
            'total' => $query->count(),
            'valid' => (clone $query)->valid()->count(),
            'expired' => (clone $query)->expired()->count(),
            'expiring_30_days' => (clone $query)->expiringIn(30)->count(),
            'expiring_7_days' => (clone $query)->expiringIn(7)->count(),
            'expiring_today' => (clone $query)->whereDate('expiry_date', today())->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Upload em lote
     */
    public function bulkUpload(Request $request)
    {
        $request->validate([
            'certificates' => 'required|array|min:1',
            'certificates.*.client_id' => 'required|exists:clients,id',
            'certificates.*.certificate_number' => 'required|string|unique:certificates,certificate_number',
            'certificates.*.equipment_name' => 'required|string|max:255',
            'certificates.*.calibration_date' => 'required|date',
            'certificates.*.expiry_date' => 'required|date|after:calibration_date',
            'certificates.*.certificate' => 'required|file|mimes:pdf|max:10240',
        ]);

        $uploaded = [];
        $errors = [];

        foreach ($request->file('certificates') as $index => $certificateData) {
            try {
                $file = $certificateData['certificate'];
                $fileName = time() . '_' . $index . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('certificates', $fileName, 'public');

                $certificate = Certificate::create([
                    'client_id' => $certificateData['client_id'],
                    'certificate_number' => $certificateData['certificate_number'],
                    'equipment_name' => $certificateData['equipment_name'],
                    'calibration_date' => $certificateData['calibration_date'],
                    'expiry_date' => $certificateData['expiry_date'],
                    'file_path' => $filePath,
                    'file_name' => $fileName,
                    'uploaded_by' => $request->user()->id,
                ]);

                $uploaded[] = $certificate;

            } catch (\Exception $e) {
                $errors[] = "Erro no certificado {$index}: " . $e->getMessage();
            }
        }

        // Log de auditoria
        AuditLog::create([
            'action' => 'Upload em lote realizado',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'details' => "Upload em lote: " . count($uploaded) . " certificados enviados",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'uploaded' => $uploaded,
            'errors' => $errors,
            'message' => count($uploaded) . ' certificados enviados com sucesso'
        ]);
    }

    /**
     * Exclusão em lote
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'certificate_ids' => 'required|array|min:1',
            'certificate_ids.*' => 'exists:certificates,id',
        ]);

        $deleted = 0;
        $errors = [];

        foreach ($request->certificate_ids as $id) {
            try {
                $certificate = Certificate::find($id);
                
                if ($certificate->file_path) {
                    Storage::disk('public')->delete($certificate->file_path);
                }
                
                $certificate->delete();
                $deleted++;

            } catch (\Exception $e) {
                $errors[] = "Erro ao deletar certificado {$id}: " . $e->getMessage();
            }
        }

        // Log de auditoria
        AuditLog::create([
            'action' => 'Exclusão em lote realizada',
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'details' => "Exclusão em lote: {$deleted} certificados deletados",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'deleted' => $deleted,
            'errors' => $errors,
            'message' => "{$deleted} certificados deletados com sucesso"
        ]);
    }

    /**
     * Exportar certificados
     */
    public function export(Request $request)
    {
        $query = Certificate::with(['client', 'uploadedBy']);

        // Filtro por cliente se o usuário for cliente
        if ($request->user() instanceof \App\Models\Client) {
            $query->where('client_id', $request->user()->id);
        }

        $certificates = $query->get();

        $filename = 'certificados_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        $callback = function() use ($certificates) {
            $file = fopen('php://output', 'w');
            
            // Cabeçalho
            fputcsv($file, [
                'Número do Certificado',
                'Equipamento',
                'Modelo',
                'Número de Série',
                'Cliente',
                'Data de Calibração',
                'Data de Expiração',
                'Empresa de Calibração',
                'Status',
                'Uploadado por',
                'Data de Criação'
            ]);

            // Dados
            foreach ($certificates as $certificate) {
                fputcsv($file, [
                    $certificate->certificate_number,
                    $certificate->equipment_name,
                    $certificate->equipment_model,
                    $certificate->equipment_serial,
                    $certificate->client->company_name ?? '',
                    $certificate->calibration_date?->format('d/m/Y'),
                    $certificate->expiry_date?->format('d/m/Y'),
                    $certificate->calibration_company,
                    $certificate->status,
                    $certificate->uploadedBy->name ?? '',
                    $certificate->created_at->format('d/m/Y H:i:s')
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
