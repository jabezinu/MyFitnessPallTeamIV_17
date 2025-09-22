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
        Schema::table('weight_logs', function (Blueprint $table) {
            $table->decimal('neck_cm', 5, 2)->nullable()->after('weight_kg');
            $table->decimal('waist_cm', 5, 2)->nullable()->after('neck_cm');
            $table->decimal('hips_cm', 5, 2)->nullable()->after('waist_cm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weight_logs', function (Blueprint $table) {
            $table->dropColumn(['neck_cm', 'waist_cm', 'hips_cm']);
        });
    }
};
