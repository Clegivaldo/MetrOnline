<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Client;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Relatório de certificados
     */
    public function certificates(Request $request)
    {
        $certificates = Certificate::with(['client', 'uploadedBy'])
            ->when($request->client_id, function ($query, $clientId) {
                return $query->where('client_id', $clientId);
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'expired') {
                    return $query->expired();
                } elseif ($status === 'expiring') {
                    return $query->expiringIn(30);
                } elseif ($status === 'valid') {
                    return $query->valid();
                }
                return $query;
            })
            ->when($request->date_from, function ($query, $date) {
                return $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                return $query->whereDate('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        if ($request->format === 'csv') {
            return $this->exportCertificatesToCsv($certificates);
        }

        return response()->json($certificates);
    }

    /**
     * Relatório de clientes
     */
    public function clients(Request $request)
    {
        $clients = Client::withCount(['certificates' => function ($query) {
                $query->valid();
            }])
            ->withCount(['certificates as expired_certificates' => function ($query) {
                $query->expired();
            }])
            ->withCount(['certificates as expiring_certificates' => function ($query) {
                $query->expiringIn(30);
            }])
            ->when($request->search, function ($query, $search) {
                return $query->where('company_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('cnpj', 'like', "%{$search}%");
            })
            ->orderBy('company_name')
            ->get();

        if ($request->format === 'csv') {
            return $this->exportClientsToCsv($clients);
        }

        return response()->json($clients);
    }

    /**
     * Relatório de expiração
     */
    public function expiry(Request $request)
    {
        $days = $request->get('days', 30);
        
        $certificates = Certificate::with(['client'])
            ->where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>=', now())
            ->orderBy('expiry_date')
            ->get()
            ->groupBy(function ($certificate) {
                return $certificate->expiry_date->diffInDays(now());
            });

        if ($request->format === 'csv') {
            return $this->exportExpiryToCsv($certificates);
        }

        return response()->json($certificates);
    }

    /**
     * Relatório de auditoria
     */
    public function audit(Request $request)
    {
        $logs = AuditLog::query()
            ->when($request->action, function ($query, $action) {
                return $query->where('action', 'like', "%{$action}%");
            })
            ->when($request->user_role, function ($query, $role) {
                return $query->where('user_role', $role);
            })
            ->when($request->date_from, function ($query, $date) {
                return $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                return $query->whereDate('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        if ($request->format === 'csv') {
            return $this->exportAuditToCsv($logs);
        }

        return response()->json($logs);
    }

    /**
     * Exportar certificados para CSV
     */
    private function exportCertificatesToCsv($certificates)
    {
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

    /**
     * Exportar clientes para CSV
     */
    private function exportClientsToCsv($clients)
    {
        $filename = 'clientes_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        $callback = function() use ($clients) {
            $file = fopen('php://output', 'w');
            
            // Cabeçalho
            fputcsv($file, [
                'Empresa',
                'CNPJ',
                'Email',
                'Telefone',
                'Endereço',
                'Certificados Válidos',
                'Certificados Expirados',
                'Certificados Expirando',
                'Data de Cadastro'
            ]);

            // Dados
            foreach ($clients as $client) {
                fputcsv($file, [
                    $client->company_name,
                    $client->cnpj,
                    $client->email,
                    $client->phone,
                    $client->address,
                    $client->certificates_count,
                    $client->expired_certificates,
                    $client->expiring_certificates,
                    $client->created_at->format('d/m/Y H:i:s')
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Exportar expiração para CSV
     */
    private function exportExpiryToCsv($certificates)
    {
        $filename = 'expiracao_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        $callback = function() use ($certificates) {
            $file = fopen('php://output', 'w');
            
            // Cabeçalho
            fputcsv($file, [
                'Dias até Expirar',
                'Número do Certificado',
                'Equipamento',
                'Cliente',
                'Data de Expiração',
                'Empresa de Calibração'
            ]);

            // Dados
            foreach ($certificates as $days => $certList) {
                foreach ($certList as $certificate) {
                    fputcsv($file, [
                        $days,
                        $certificate->certificate_number,
                        $certificate->equipment_name,
                        $certificate->client->company_name ?? '',
                        $certificate->expiry_date->format('d/m/Y'),
                        $certificate->calibration_company
                    ]);
                }
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Exportar auditoria para CSV
     */
    private function exportAuditToCsv($logs)
    {
        $filename = 'auditoria_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Cabeçalho
            fputcsv($file, [
                'Data/Hora',
                'Ação',
                'Usuário',
                'Função',
                'IP',
                'Detalhes'
            ]);

            // Dados
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at->format('d/m/Y H:i:s'),
                    $log->action,
                    $log->user_email,
                    $log->user_role,
                    $log->ip_address,
                    $log->details
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Generate reports based on filters
     */
    public function index(Request $request)
    {
        $query = Certificate::with(['client']);

        // Apply filters
        if ($request->filled('type')) {
            switch ($request->type) {
                case 'expiring':
                    $query->where('expiry_date', '<=', Carbon::now()->addDays(30))
                          ->where('expiry_date', '>', Carbon::now());
                    break;
                case 'expired':
                    $query->where('expiry_date', '<', Carbon::now());
                    break;
                case 'active':
                    $query->where('expiry_date', '>', Carbon::now());
                    break;
            }
        }

        if ($request->filled('dateFrom')) {
            $query->where('created_at', '>=', $request->dateFrom);
        }

        if ($request->filled('dateTo')) {
            $query->where('created_at', '<=', $request->dateTo . ' 23:59:59');
        }

        if ($request->filled('client')) {
            $query->where('client_id', $request->client);
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active':
                    $query->where('expiry_date', '>', Carbon::now());
                    break;
                case 'expiring':
                    $query->where('expiry_date', '<=', Carbon::now()->addDays(30))
                          ->where('expiry_date', '>', Carbon::now());
                    break;
                case 'expired':
                    $query->where('expiry_date', '<', Carbon::now());
                    break;
            }
        }

        $certificates = $query->get();

        $reports = $certificates->map(function ($certificate) {
            $status = 'active';
            if ($certificate->expiry_date < Carbon::now()) {
                $status = 'expired';
            } elseif ($certificate->expiry_date <= Carbon::now()->addDays(30)) {
                $status = 'expiring';
            }

            return [
                'type' => 'Certificado',
                'client_name' => $certificate->client->company_name ?? '',
                'equipment_name' => $certificate->equipment_name,
                'date' => $certificate->created_at,
                'status' => $status,
                'expiry_date' => $certificate->expiry_date,
            ];
        });

        return response()->json($reports);
    }

    /**
     * Export reports
     */
    public function export(Request $request, $type)
    {
        $reports = $this->index($request)->getData();

        if ($type === 'pdf') {
            return $this->exportPdf($reports);
        } elseif ($type === 'excel') {
            return $this->exportExcel($reports);
        }

        return response()->json(['error' => 'Tipo de exportação não suportado'], 400);
    }

    /**
     * Export to PDF
     */
    private function exportPdf($reports)
    {
        // Implementar exportação PDF
        // Por enquanto, retorna um JSON
        return response()->json($reports);
    }

    /**
     * Export to Excel
     */
    private function exportExcel($reports)
    {
        // Implementar exportação Excel
        // Por enquanto, retorna um JSON
        return response()->json($reports);
    }
}
