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
            $table->unsignedBigInteger('host_user_id');
            $table->string('host_user_name');
            $table->unsignedBigInteger('guest_user_id')->nullable();
            $table->string('guest_user_name')->nullable();
            $table->timestamps();
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
