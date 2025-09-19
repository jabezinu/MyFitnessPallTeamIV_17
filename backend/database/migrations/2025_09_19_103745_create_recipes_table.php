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
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->integer('prep_time_minutes')->nullable();
            $table->integer('cook_time_minutes')->nullable();
            $table->integer('servings')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_public')->default(false);
            $table->decimal('total_calories', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
