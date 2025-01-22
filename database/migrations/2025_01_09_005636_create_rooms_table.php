<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('pin', 4);           // PIN は4桁想定なら ->string('pin',4) などでもOK
            $table->json('toggles')
                  ->nullable()
                  ->default(json_encode([
                      'switch0State' => 'off',
                      'switch1State' => 'off',
                      'switch2State' => 'off',
                      'switch3State' => 'off',
                      'switch4State' => 'off',
                      'switch5State' => 'off',
                      'switch6State' => 'off',
                      'switch7State' => 'off',
                      'switch8State' => 'off',
                  ]));
            $table->unsignedBigInteger('host_user_id');
            $table->string('host_user_name');
            $table->unsignedBigInteger('guest_user_id')->nullable();
            $table->string('guest_user_name')->nullable();
            $table->timestamps();
            $table->boolean('started')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('rooms');
    }
};
