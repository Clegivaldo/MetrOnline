<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Document;
use App\Models\DocumentRevision;
use App\Models\DocumentCategory;
use App\Models\User;
use Illuminate\Support\Str;

class DocumentSeeder extends Seeder
{
    public function run()
    {
        $category = DocumentCategory::firstOrCreate([
            'code' => 'MQ',
            'name' => 'Manuais da Qualidade'
        ]);

        $user = User::first();

        $document = Document::create([
            'code' => 'MQ-0001',
            'title' => 'Manual da Qualidade',
            'description' => 'Documento principal do SGQ',
            'category_id' => $category->id,
            'is_controlled' => true,
        ]);

        DocumentRevision::create([
            'document_id' => $document->id,
            'version' => 'REV.000',
            'revision_date' => now()->subMonths(6),
            'file_path' => 'documents/sample/MQ-0001-REV000.pdf',
            'file_name' => 'MQ-0001-REV000.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 123456,
            'created_by' => $user?->id,
            'observations' => 'Primeira versão do manual.',
            'status' => 'vigente',
        ]);

        // Documento com revisões múltiplas
        $document2 = Document::create([
            'code' => 'MQ-0002',
            'title' => 'Procedimento de Auditoria',
            'description' => 'Procedimento para auditorias internas',
            'category_id' => $category->id,
            'is_controlled' => true,
        ]);

        DocumentRevision::create([
            'document_id' => $document2->id,
            'version' => 'REV.000',
            'revision_date' => now()->subMonths(12),
            'file_path' => 'documents/sample/MQ-0002-REV000.pdf',
            'file_name' => 'MQ-0002-REV000.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 234567,
            'created_by' => $user?->id,
            'observations' => 'Versão inicial.',
            'status' => 'obsoleto',
        ]);
        DocumentRevision::create([
            'document_id' => $document2->id,
            'version' => 'REV.001',
            'revision_date' => now()->subMonths(3),
            'file_path' => 'documents/sample/MQ-0002-REV001.pdf',
            'file_name' => 'MQ-0002-REV001.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 245678,
            'created_by' => $user?->id,
            'observations' => 'Atualização para revisão 001.',
            'status' => 'vigente',
        ]);
    }
}
