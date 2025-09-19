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
            $table->dropColumn('name');
            $table->string('username')->unique();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->integer('height_cm')->nullable();
            $table->string('activity_level')->default('sedentary');
            $table->string('timezone')->nullable();
            $table->string('profile_image_url')->nullable();
            $table->boolean('is_premium')->default(false);
            $table->boolean('email_verified')->default(false);
            $table->json('privacy_settings')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'first_name',
                'last_name',
                'date_of_birth',
                'gender',
                'height_cm',
                'activity_level',
                'timezone',
                'profile_image_url',
                'is_premium',
                'email_verified',
                'privacy_settings'
            ]);
            $table->string('name');
        });
    }
};
