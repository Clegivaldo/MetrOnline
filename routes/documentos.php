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
    
    // Rotas de Revisões (RESTful)
    Route::get('/{document}/revisions', [\App\Http\Controllers\DocumentRevisionController::class, 'index']);
    Route::post('/{document}/revisions', [\App\Http\Controllers\DocumentRevisionController::class, 'store']);
    Route::get('/{document}/revisions/{revision}', [\App\Http\Controllers\DocumentRevisionController::class, 'show']);
    Route::get('/{document}/revisions/{revision}/download', [\App\Http\Controllers\DocumentRevisionController::class, 'download']);

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
