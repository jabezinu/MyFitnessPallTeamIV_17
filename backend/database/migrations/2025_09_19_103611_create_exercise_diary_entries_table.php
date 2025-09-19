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
        Schema::create('exercise_diary_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained('exercises');
            $table->integer('duration_minutes')->nullable();
            $table->decimal('calories_burned', 8, 2)->nullable();
            $table->integer('sets')->nullable();
            $table->integer('reps')->nullable();
            $table->decimal('weight_used', 8, 2)->nullable();
            $table->decimal('distance', 8, 2)->nullable();
            $table->string('distance_unit')->nullable();
            $table->date('logged_date');
            $table->timestamp('logged_at')->useCurrent();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'logged_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercise_diary_entries');
    }
};
