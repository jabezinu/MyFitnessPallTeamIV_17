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
        Schema::create('food_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->decimal('serving_size', 8, 2);
            $table->string('serving_unit');
            $table->decimal('calories_per_serving', 8, 2);
            $table->decimal('protein_g', 8, 2)->nullable();
            $table->decimal('carbs_g', 8, 2)->nullable();
            $table->decimal('fat_g', 8, 2)->nullable();
            $table->decimal('fiber_g', 8, 2)->nullable();
            $table->decimal('sugar_g', 8, 2)->nullable();
            $table->decimal('sodium_mg', 8, 2)->nullable();
            $table->json('vitamins')->nullable();
            $table->json('minerals')->nullable();
            $table->foreignId('food_category_id')->nullable()->constrained('food_categories');
            $table->boolean('verified')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_items');
    }
};
