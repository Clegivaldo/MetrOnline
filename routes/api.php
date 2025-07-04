<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\DocumentCategoryController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentDistributionController;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\QualificationController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\CalibrationCertificateController;
use App\Http\Controllers\NonConformityController;
use App\Http\Controllers\InternalAuditController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rotas públicas
Route::post('/auth/login', [AuthController::class, 'login']);

// Rota de teste simples
Route::get('/test', function () {
    return response()->json(['message' => 'API funcionando!']);
});

// Consulta de CNPJ (pública para teste)
Route::get('/cnpj/{cnpj}', function ($cnpj) {
    try {
        $response = Http::timeout(10)->get('https://brasilapi.com.br/api/cnpj/v1/' . preg_replace('/\D/', '', $cnpj));
        if ($response->successful()) {
            $data = $response->json();
            return response()->json([
                'company_name' => $data['razao_social'] ?? null,
                'address' => ($data['logradouro'] ?? '') . ', ' . ($data['numero'] ?? '') . ' ' . ($data['bairro'] ?? ''),
                'city' => $data['municipio'] ?? null,
                'state' => $data['uf'] ?? null,
                'zip_code' => $data['cep'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => ($data['ddd'] ?? '') . ($data['telefone'] ?? ''),
            ]);
        }
        return response()->json(['error' => 'CNPJ não encontrado'], 404);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Erro ao consultar CNPJ: ' . $e->getMessage()], 500);
    }
});

// Rotas públicas para teste (temporárias)
Route::get('/dashboard/test', [DashboardController::class, 'index']);
Route::get('/clients/test', [ClientController::class, 'index']);
Route::get('/certificates/test', [CertificateController::class, 'index']);
Route::get('/users/test', [\App\Http\Controllers\UserController::class, 'index']);
Route::get('/audit-logs/test', [\App\Http\Controllers\AuditController::class, 'index']);
Route::get('/system/settings/test', [SystemController::class, 'getSettings']);
Route::get('/system/email-templates/test', [SystemController::class, 'getEmailTemplates']);
Route::post('/certificates/test', [CertificateController::class, 'store']);
Route::post('/users/{user}/reset-password/test', [\App\Http\Controllers\UserController::class, 'resetPassword']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/advanced', [DashboardController::class, 'advancedStats']);

    // Clientes (apenas admin e user)
    Route::middleware('role:admin,user')->group(function () {
        Route::apiResource('clients', ClientController::class);
        Route::get('/clients/{id}/certificates', [ClientController::class, 'certificates']);
        Route::post('/clients/{id}/reset-password', [ClientController::class, 'resetPassword']);
    });

    // Certificados
    Route::apiResource('certificates', CertificateController::class);
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download']);
    Route::get('/certificates/stats', [CertificateController::class, 'stats']);
    Route::post('/certificates/bulk-upload', [CertificateController::class, 'bulkUpload']);
    Route::post('/certificates/bulk-delete', [CertificateController::class, 'bulkDelete']);
    Route::get('/certificates/export', [CertificateController::class, 'export']);

    // Gestão Documental
    require __DIR__.'/documentos.php';

    // Usuários (apenas admin)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', \App\Http\Controllers\UserController::class);
        Route::post('/users/{user}/reset-password', [\App\Http\Controllers\UserController::class, 'resetPassword']);
    });

    // Sistema (apenas admin)
    Route::middleware('role:admin')->group(function () {
        // Configurações
        Route::get('/system/settings', [SystemController::class, 'getSettings']);
        Route::post('/system/settings', [SystemController::class, 'updateSettings']);
        Route::post('/system/test-email', [SystemController::class, 'testEmail']);
        Route::get('/system/stats', [SystemController::class, 'getSystemStats']);

        // Configurações da Empresa
        Route::get('/company-settings', [\App\Http\Controllers\CompanySettingController::class, 'index']);
        Route::post('/company-settings', [\App\Http\Controllers\CompanySettingController::class, 'store']);

        // Templates de email
        Route::get('/system/email-templates', [SystemController::class, 'getEmailTemplates']);
        Route::put('/system/email-templates/{id}', [SystemController::class, 'updateEmailTemplate']);
        Route::post('/system/test-template', [SystemController::class, 'testTemplateEmail']);

        // Auditoria
        Route::get('/audit-logs', [\App\Http\Controllers\AuditController::class, 'index']);
        Route::get('/audit-logs/export', [\App\Http\Controllers\AuditController::class, 'export']);

        // Backup
        Route::post('/system/backup', [\App\Http\Controllers\BackupController::class, 'create']);
        Route::get('/system/backups', [\App\Http\Controllers\BackupController::class, 'index']);
        Route::get('/system/backups/{backup}/download', [\App\Http\Controllers\BackupController::class, 'download']);
        Route::delete('/system/backups/{backup}', [\App\Http\Controllers\BackupController::class, 'destroy']);
    });

    // Relatórios
    Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index']);
    Route::get('/reports/export/{type}', [\App\Http\Controllers\ReportController::class, 'export']);

    // Perfil do usuário
    Route::get('/profile', [\App\Http\Controllers\UserController::class, 'profile']);
    Route::post('/profile/update', [\App\Http\Controllers\UserController::class, 'updateProfile']);

    // Records
    Route::apiResource('records', RecordController::class);

    // Qualifications
    Route::apiResource('qualifications', QualificationController::class);

    // Trainings
    Route::apiResource('trainings', TrainingController::class);

    // Equipment
    Route::apiResource('equipment', EquipmentController::class);

    // Calibration Certificates
    Route::apiResource('calibration-certificates', CalibrationCertificateController::class);

    // Non-Conformities
    Route::apiResource('non-conformities', NonConformityController::class);

    // Internal Audits
    Route::apiResource('internal-audits', InternalAuditController::class);

    // Permissões
    Route::get('/permissions', [\App\Http\Controllers\PermissionController::class, 'index']);
    Route::post('/permissions', [\App\Http\Controllers\PermissionController::class, 'store']);
    Route::put('/permissions/{permission}', [\App\Http\Controllers\PermissionController::class, 'update']);
    Route::delete('/permissions/{permission}', [\App\Http\Controllers\PermissionController::class, 'destroy']);
    // Usuário - permissões
    Route::get('/users/{user}/permissions', [\App\Http\Controllers\PermissionController::class, 'userPermissions']);
    Route::post('/users/{user}/permissions/toggle', [\App\Http\Controllers\PermissionController::class, 'toggleUserPermission']);
    // Categorias de documentos
    Route::get('/document-categories', [\App\Http\Controllers\DocumentCategoryController::class, 'index']);
    Route::post('/document-categories', [\App\Http\Controllers\DocumentCategoryController::class, 'store']);
    Route::put('/document-categories/{category}', [\App\Http\Controllers\DocumentCategoryController::class, 'update']);
    Route::delete('/document-categories/{category}', [\App\Http\Controllers\DocumentCategoryController::class, 'destroy']);
}); 