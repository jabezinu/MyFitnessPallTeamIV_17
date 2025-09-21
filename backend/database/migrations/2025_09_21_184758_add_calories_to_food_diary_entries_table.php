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
        Schema::table('food_diary_entries', function (Blueprint $table) {
            $table->decimal('calories', 8, 2)->nullable()->after('serving_unit');
            $table->foreignId('food_item_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('food_diary_entries', function (Blueprint $table) {
            $table->dropColumn('calories');
            $table->foreignId('food_item_id')->nullable(false)->change();
        });
    }
};
