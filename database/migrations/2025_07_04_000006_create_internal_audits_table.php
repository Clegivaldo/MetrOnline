<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('internal_audits', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('planned_at')->nullable();
            $table->date('executed_at')->nullable();
            $table->foreignId('auditor_id')->constrained('users');
            $table->enum('status', ['planejada', 'em_execucao', 'concluida'])->default('planejada');
            $table->text('findings')->nullable();
            $table->text('actions')->nullable();
            $table->text('effectiveness_verification')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('internal_audits');
    }
}; 