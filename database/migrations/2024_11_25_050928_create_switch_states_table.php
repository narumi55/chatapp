<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_xxxxxx_create_switch_states_table.php

    public function up()
    {
        Schema::create('switch_states', function (Blueprint $table) {
            $table->id();
            $table->string('key'); // トグルボタンのキー
            $table->boolean('state'); // トグルの状態（onまたはoff）
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('switch_states');
    }

};
