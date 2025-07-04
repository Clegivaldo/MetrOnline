<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('records', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['dados_brutos', 'resultado_calibracao', 'certificado', 'relatorio']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('related_equipment_id')->nullable()->constrained('equipment');
            $table->foreignId('related_certificate_id')->nullable()->constrained('certificates');
            $table->string('integrity_hash')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('records');
    }
}; 