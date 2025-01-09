<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Room;

class RoomController extends Controller
{
    //ホスト
    public function createRoom(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'ログインしてください');
        }

        // すでに自分のPINを使った部屋がある場合は再利用する or エラーにする等、仕様次第
        // 今回は新たに作る例
        $room = new Room();
        $room->pin = $user->pin;       // ユーザーのpinを部屋のキーとして利用
        $room->host_user_id = $user->id;
        $room->host_user_name = $user->name;
        $room->guest_user_id = null;
        $room->guest_user_name = null;
        $room->save();

        return redirect()->route('rooms.show', ['room' => $room->id])
                     ->with('status', '部屋を立てました');
    }

    public function checkGuest()
    {
        // ログインユーザーの pin と同じ pin を持つ部屋を取得
        // 例: Roomテーブルに (id, pin, host_user_id, guest_user_id, ...) がある想定
        $user = Auth::user();
        if (!$user) {
            return response()->json(['guest_user_id' => null]);
        }

        // 部屋を検索
        $room = Room::where('pin', $user->pin)->first();

        // 部屋がある場合は guest_user_id を返す、なければ null
        $guest_name = $room ? $room->guest_user_name : null;

        return response()->json(['guest_user_name' => $guest_name]);
    }


    //ゲスト
    public function showJoinForm()
    {
        return view('room.join');
    }

    public function joinRoom(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'ログインしてください');
        }

        // バリデーション
        $request->validate([
            'pin' => 'required|digits:4',
        ]);

        // 入力されたpinを持つ Room レコードを検索
        $pin = $request->input('pin');
        $room = Room::where('pin', $pin)->first();

        if (!$room) {
            // そんなPINの部屋がない
            return redirect()->back()->with('error', 'そのPINの部屋は存在しません。');
        }

        // すでにゲストが埋まっている部屋なら参加不可 (仕様次第)
        if (!is_null($room->guest_user_id)) {
            return redirect()->back()->with('error', 'この部屋はすでに満員です。');
        }

        // 今のユーザーをゲストとしてセットして保存
        $room->guest_user_id = $user->id;
        $room->guest_user_name = $user->name;
        $room->save();

        // マッチング完了！ guest2ページに飛ばす
        $redirectUrl = route('rooms.guest2', ['room' => $room->id]) . '?pin=' . $room->pin;

        if ($request->ajax()) {
            return response()->json([
                'redirect' => $redirectUrl,
                'status' => '部屋に参加しました'
            ]);
        }
        
        return redirect($redirectUrl);        
    }

    public function guest2()
    {
        // 必要なデータを取得してビューを返す
        return view('guest2');
    }
    
    public function getRoomData(Request $request, $pin)
    {
        // 指定された PIN に一致する部屋を検索
        $room = Room::where('pin', $pin)->first();

        if (!$room) {
            return response()->json(['error' => '部屋が見つかりません'], 404);
        }

        return response()->json([
            'host_user_name' => $room->host_user_name,
            'guest_user_name' => $room->guest_user_name,
        ]);
    }
}