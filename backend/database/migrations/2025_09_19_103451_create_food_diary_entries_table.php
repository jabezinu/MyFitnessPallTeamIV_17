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
        Schema::create('food_diary_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('food_item_id')->constrained('food_items');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']);
            $table->decimal('quantity', 8, 2);
            $table->string('serving_unit');
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
        Schema::dropIfExists('food_diary_entries');
    }
};
