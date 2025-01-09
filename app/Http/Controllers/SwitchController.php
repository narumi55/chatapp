<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SwitchController extends Controller
{
    public function get(Request $request)
    {
        // ログインユーザを取得
        $user = Auth::user();

        // データベースから toggles カラムの内容を返す
        // 例: { "switch0State": "off", "switch1State": "off", ... }
        return response()->json($user->toggles ?? []);
    }

    public function save(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // 送られてくる { key: 'switch0State', state: 'on' } 等を取得
        $key   = $request->input('key');
        $state = $request->input('state');

        // DB 上の toggles カラムの中身を取得 (配列として取得可能)
        $toggles = $user->toggles ?? [];

        // 該当スイッチの状態を更新
        $toggles[$key] = $state;

        // 更新して保存
        $user->toggles = $toggles;
        $user->save();

        return response()->json(['message' => 'OK']);
    }
}
