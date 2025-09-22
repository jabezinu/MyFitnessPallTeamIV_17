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
            $table->text('about_me')->nullable()->after('profile_image_url');
            $table->text('fitness_motivation')->nullable()->after('about_me');
            $table->json('friends')->nullable()->after('fitness_motivation');
            $table->json('inspirations')->nullable()->after('friends');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['about_me', 'fitness_motivation', 'friends', 'inspirations']);
        });
    }
};
