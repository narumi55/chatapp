<?php

// app/Http/Controllers/SwitchController.php

namespace App\Http\Controllers;

use App\Models\SwitchState;
use Illuminate\Http\Request;

class SwitchController extends Controller
{
    // トグルの状態を保存
    public function saveSwitchState(Request $request)
    {
        // 送信されたデータを取得
        $key = $request->input('key');
        $state = $request->input('state') === 'on';

        // データベースに保存
        SwitchState::updateOrCreate(
            ['key' => $key], 
            ['state' => $state]
        );

        return response()->json(['success' => true]);
    }

    public function getSwitchState(Request $request)
    {
        $states = SwitchState::pluck('state', 'key')->toArray(); // すべての状態を取得
        return response()->json($states);
    }
}
