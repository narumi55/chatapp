<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'pin', 'players', 'trash', 'game_over', 
        'kakumei', 'suitsibari', 'ranksibari', 'kiri', 
        'bakku', 'kaesi', 'sukippu', 'watasi', 'sute', 'bonnba'
    ];

    protected $casts = [
        'players' => 'array',
        'trash'   => 'array',
        'game_over' => 'boolean',
        'kakumei' => 'boolean',
        'suitsibari' => 'string',
        'ranksibari' => 'string',
        'kiri' => 'string',
        'bakku' => 'string',
        'kaesi' => 'string',
        'sukippu' => 'string',
        'watasi' => 'string',
        'sute' => 'string',
        'bonnba' => 'string',
    ];
}

