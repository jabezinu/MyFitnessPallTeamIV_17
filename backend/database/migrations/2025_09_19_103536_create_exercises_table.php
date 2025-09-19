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
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['cardio', 'strength', 'flexibility', 'sports']);
            $table->decimal('met_value', 5, 2)->nullable();
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->json('muscle_groups')->nullable();
            $table->json('equipment_needed')->nullable();
            $table->string('difficulty_level')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
