<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('document_distributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->date('distributed_at');
            $table->date('returned_at')->nullable();
            $table->boolean('is_returned')->default(false);
            $table->text('notes')->nullable();
            $table->foreignId('distributed_by')->constrained('users');
            $table->foreignId('returned_to')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('document_distributions');
    }
};
