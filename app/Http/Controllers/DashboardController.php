<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Certificate;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obter dados do dashboard
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Se for cliente, retornar apenas seus certificados
            if ($user instanceof \App\Models\Client) {
                $stats = [
                    'total_clients' => 1, // O próprio cliente
                    'total_certificates' => Certificate::where('client_id', $user->id)->count(),
                    'expiring_certificates' => Certificate::where('client_id', $user->id)
                                                          ->where('expiry_date', '<=', now()->addDays(30))
                                                          ->where('expiry_date', '>=', now())
                                                          ->count(),
                ];

                // Certificados do cliente
                $recentCertificates = Certificate::where('client_id', $user->id)
                                                ->with(['client', 'uploadedBy'])
                                                ->orderBy('created_at', 'desc')
                                                ->limit(5)
                                                ->get()
                                                ->map(function ($certificate) {
                                                    $certificate->status = $this->getCertificateStatus($certificate);
                                                    return $certificate;
                                                });

                // Atividades do cliente
                $recentActivities = AuditLog::where('user_email', $user->email)
                                           ->orderBy('created_at', 'desc')
                                           ->limit(10)
                                           ->get();

                return response()->json([
                    'stats' => $stats,
                    'recent_certificates' => $recentCertificates,
                    'recent_activities' => $recentActivities,
                ]);
            }

            // Para usuários e administradores
            $stats = [
                'total_clients' => Client::count(),
                'total_certificates' => Certificate::count(),
                'expiring_certificates' => Certificate::where('expiry_date', '<=', now()->addDays(30))
                                                      ->where('expiry_date', '>=', now())
                                                      ->count(),
            ];

            // Certificados recentes (simplificado)
            $recentCertificates = Certificate::with(['client', 'uploadedBy'])
                                            ->orderBy('created_at', 'desc')
                                            ->limit(5)
                                            ->get()
                                            ->map(function ($certificate) {
                                                $certificate->status = $this->getCertificateStatus($certificate);
                                                return $certificate;
                                            });

            // Atividades recentes (simplificado)
            $recentActivities = AuditLog::orderBy('created_at', 'desc')
                                       ->limit(10)
                                       ->get();

            // Gráfico de certificados por mês (simplificado para SQLite)
            $certificatesByMonth = Certificate::selectRaw('strftime("%m", created_at) as month, COUNT(*) as count')
                                             ->whereYear('created_at', now()->year)
                                             ->groupBy('month')
                                             ->orderBy('month')
                                             ->get();

            return response()->json([
                'stats' => $stats,
                'recent_certificates' => $recentCertificates,
                'recent_activities' => $recentActivities,
                'certificates_by_month' => $certificatesByMonth,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro no dashboard: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Obter estatísticas avançadas (apenas para admin)
     */
    public function advancedStats(Request $request)
    {
        if (!($request->user() instanceof \App\Models\User) || $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        // Estatísticas de usuários (apenas da tabela users)
        $userStats = [
            'total_users' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'regular_users' => User::where('role', 'user')->count(),
        ];

        // Estatísticas de clientes (apenas da tabela clients)
        $clientStats = [
            'total_clients' => \App\Models\Client::count(),
        ];

        // Estatísticas de certificados por cliente
        $certificatesByClient = Certificate::with('client')
                                          ->selectRaw('client_id, COUNT(*) as count')
                                          ->groupBy('client_id')
                                          ->orderBy('count', 'desc')
                                          ->limit(10)
                                          ->get();

        // Atividades por tipo
        $activitiesByType = AuditLog::selectRaw('action, COUNT(*) as count')
                                   ->groupBy('action')
                                   ->orderBy('count', 'desc')
                                   ->get();

        // Certificados expirando por cliente
        $expiringByClient = Certificate::with('client')
                                      ->where('expiry_date', '<=', now()->addDays(30))
                                      ->where('expiry_date', '>=', now())
                                      ->selectRaw('client_id, COUNT(*) as count')
                                      ->groupBy('client_id')
                                      ->orderBy('count', 'desc')
                                      ->get();

        // Estatísticas adicionais
        $totalAuditLogs = AuditLog::count();
        $failedLoginAttempts = \App\Models\LoginAttempt::where('success', false)->count();

        return response()->json([
            'user_stats' => $userStats,
            'client_stats' => $clientStats,
            'certificates_by_client' => $certificatesByClient,
            'activities_by_type' => $activitiesByType,
            'expiring_by_client' => $expiringByClient,
            'total_audit_logs' => $totalAuditLogs,
            'failed_login_attempts' => $failedLoginAttempts,
        ]);
    }

    /**
     * Determinar status do certificado
     */
    private function getCertificateStatus($certificate)
    {
        $expiryDate = \Carbon\Carbon::parse($certificate->expiry_date);
        $now = \Carbon\Carbon::now();

        if ($expiryDate->isPast()) {
            return 'Expirado';
        } elseif ($expiryDate->diffInDays($now) <= 30) {
            return 'Expirando';
        } else {
            return 'Válido';
        }
    }
}
