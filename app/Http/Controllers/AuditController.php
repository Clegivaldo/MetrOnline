<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AuditController extends Controller
{
    /**
     * Listar logs de auditoria
     */
    public function index(Request $request)
    {
        $logs = AuditLog::query()
            ->when($request->search, function ($query, $search) {
                return $query->where('action', 'like', "%{$search}%")
                            ->orWhere('user_email', 'like', "%{$search}%")
                            ->orWhere('details', 'like', "%{$search}%");
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
            ->paginate(20);

        return response()->json($logs);
    }

    /**
     * Exportar logs de auditoria
     */
    public function export(Request $request)
    {
        $logs = AuditLog::query()
            ->when($request->date_from, function ($query, $date) {
                return $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                return $query->whereDate('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
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
                'User Agent',
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
                    $log->user_agent,
                    $log->details
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
