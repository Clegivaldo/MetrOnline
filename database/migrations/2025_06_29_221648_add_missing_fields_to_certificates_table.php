<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->string('equipment_model')->nullable()->after('equipment_name');
            $table->string('equipment_serial')->nullable()->after('equipment_model');
            $table->date('next_calibration_date')->nullable()->after('expiry_date');
            $table->string('calibration_company')->nullable()->after('next_calibration_date');
            $table->string('uncertainty')->nullable()->after('calibration_company');
            $table->string('measurement_range')->nullable()->after('uncertainty');
            $table->string('calibration_standard')->nullable()->after('measurement_range');
            $table->string('environmental_conditions')->nullable()->after('calibration_standard');
            $table->string('traceability')->nullable()->after('environmental_conditions');
            $table->string('certificate_type')->nullable()->after('traceability');
            $table->string('accreditation_body')->nullable()->after('certificate_type');
            $table->string('accreditation_number')->nullable()->after('accreditation_body');
            $table->text('notes')->nullable()->after('accreditation_number');
            $table->string('status')->default('válido')->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn([
                'equipment_model',
                'equipment_serial',
                'next_calibration_date',
                'calibration_company',
                'uncertainty',
                'measurement_range',
                'calibration_standard',
                'environmental_conditions',
                'traceability',
                'certificate_type',
                'accreditation_body',
                'accreditation_number',
                'notes',
                'status'
            ]);
        });
    }
};
