<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocumentCategoryController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentDistributionController;
use App\Models\DocumentRevision;

// Rotas de Categorias de Documentos
Route::prefix('document-categories')->group(function () {
    Route::get('/', [DocumentCategoryController::class, 'index']);
    Route::get('/tree', [DocumentCategoryController::class, 'tree']);
    Route::post('/', [DocumentCategoryController::class, 'store']);
    Route::get('/{category}', [DocumentCategoryController::class, 'show']);
    Route::put('/{category}', [DocumentCategoryController::class, 'update']);
    Route::delete('/{category}', [DocumentCategoryController::class, 'destroy']);
});

// Rotas de Documentos
Route::prefix('documents')->group(function () {
    Route::get('/', [DocumentController::class, 'index']);
    Route::get('/categories', [DocumentController::class, 'getCategories']);
    Route::post('/', [DocumentController::class, 'store']);
    Route::get('/{document}', [DocumentController::class, 'show']);
    Route::put('/{document}', [DocumentController::class, 'update']);
    Route::delete('/{document}', [DocumentController::class, 'destroy']);
    Route::get('/{document}/download', [DocumentController::class, 'download']);
    
    // Rotas de Revisões
    Route::get('/{document}/revisions', function (\App\Models\Document $document) {
        return response()->json($document->revisions()->with(['creator', 'reviewer'])->get());
    });
    
    Route::get('/revisions/{revision}/download', function (DocumentRevision $revision) {
        if (!\Illuminate\Support\Facades\Storage::exists($revision->file_path)) {
            return response()->json(['message' => 'Arquivo não encontrado.'], 404);
        }
        return \Illuminate\Support\Facades\Storage::download($revision->file_path, $revision->file_name);
    });

    // Rotas de Distribuição
    Route::prefix('{document}/distributions')->group(function () {
        Route::get('/', [DocumentDistributionController::class, 'index']);
        Route::post('/', [DocumentDistributionController::class, 'store']);
    });
});

// Rotas de Distribuição
Route::prefix('document-distributions')->group(function () {
    Route::get('/', [DocumentDistributionController::class, 'index']);
    Route::get('/overdue', [DocumentDistributionController::class, 'getOverdueDistributions']);
    Route::get('/user/{userId}/active', [DocumentDistributionController::class, 'getUserActiveDistributions']);
    Route::get('/{distribution}', [DocumentDistributionController::class, 'show']);
    Route::put('/{distribution}', [DocumentDistributionController::class, 'update']);
    Route::post('/{distribution}/return', [DocumentDistributionController::class, 'returnDocument']);
});
