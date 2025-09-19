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
        Schema::create('user_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('goal_type', ['weight_loss', 'weight_gain', 'maintain', 'muscle_gain']);
            $table->decimal('target_weight_kg', 5, 2)->nullable();
            $table->date('target_date')->nullable();
            $table->decimal('weekly_goal_kg', 4, 2)->nullable();
            $table->integer('daily_calorie_goal')->nullable();
            $table->decimal('daily_protein_goal', 6, 2)->nullable();
            $table->decimal('daily_carbs_goal', 6, 2)->nullable();
            $table->decimal('daily_fat_goal', 6, 2)->nullable();
            $table->integer('daily_exercise_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_goals');
    }
};
