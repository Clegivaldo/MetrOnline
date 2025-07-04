<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('identification');
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('location')->nullable();
            $table->enum('status', ['em_uso', 'em_calibracao', 'em_manutencao', 'fora_de_servico'])->default('em_uso');
            $table->date('last_calibration_at')->nullable();
            $table->date('next_calibration_at')->nullable();
            $table->date('last_maintenance_at')->nullable();
            $table->string('unique_code')->unique();
            $table->foreignId('certificate_id')->nullable()->constrained('certificates');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('equipment');
    }
}; 