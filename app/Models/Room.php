<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    // テーブル名が 'rooms' であることを明示的に指定（通常は不要）
    protected $table = 'rooms';

    protected $casts = [
        'toggles' => 'array',
    ];

    // マスアサインメントを許可するカラム
    protected $fillable = [
        'pin',
        'host_user_id',
        'host_user_name',
        'guest_user_id',
        'guest_user_name',
    ];

    // ホストユーザーとのリレーション
    public function hostUser()
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    // ゲストユーザーとのリレーション
    public function guestUser()
    {
        return $this->belongsTo(User::class, 'guest_user_id');
    }
}

