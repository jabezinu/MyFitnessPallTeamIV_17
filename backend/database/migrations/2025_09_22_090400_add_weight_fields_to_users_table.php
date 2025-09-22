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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('current_weight_kg', 5, 2)->nullable()->after('height_cm');
            $table->decimal('goal_weight_kg', 5, 2)->nullable()->after('current_weight_kg');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['current_weight_kg', 'goal_weight_kg']);
        });
    }
};
