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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('pin')->unique();
            $table->json('players');
            $table->json('trash')->nullable();
            $table->boolean('game_over')->default(false);
            $table->boolean('kakumei')->default(false);
            $table->string('suitsibari')->default('off');
            $table->string('ranksibari')->default('off');
            $table->string('kiri')->default('off');
            $table->string('bakku')->default('off');
            $table->string('kaesi')->default('off');
            $table->string('sukippu')->default('off');
            $table->string('watasi')->default('off');
            $table->string('sute')->default('off');
            $table->string('bonnba')->default('off');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
