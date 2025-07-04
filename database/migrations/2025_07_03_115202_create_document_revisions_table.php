<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('document_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->string('version'); // Ex: REV.000
            $table->date('revision_date'); // Data da revisão
            $table->dateTime('approved_at')->nullable(); // Data de aprovação
            $table->foreignId('approved_by')->nullable()->constrained('users'); // Usuário aprovador
            $table->text('changes')->nullable(); // Mudanças realizadas nesta revisão
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->foreignId('created_by')->constrained('users'); // Quem criou a revisão
            $table->text('observations')->nullable(); // Observações gerais
            $table->enum('status', ['rascunho', 'vigente', 'obsoleto', 'em_revisao', 'rejeitado'])->default('rascunho');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('document_revisions');
    }
};
