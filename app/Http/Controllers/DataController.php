<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GameService; // サービスクラスをuse
use Illuminate\Support\Facades\Session;


class DataController extends Controller
{
    protected $gameService;

    public function __construct(GameService $gameService)
    {
        $this->gameService = $gameService;
    }

    public function userTurn(Request $request)
    {
        try {
            // サービスクラスの userTurn() を呼んで結果を取得
            $responseData = $this->gameService->userTurn();

            // ここで JSON 化して返却
            return response()->json($responseData);
        } catch (\Exception $e) {
            Log::error('ゲームデータ更新中にエラーが発生:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status'  => 'ERROR',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateGame(Request $request)
    {
        try {
            // GameServiceのturnset関数を呼び出してデータを処理
            $result = $this->gameService->turnset($playerIndex, $players, $trash);
        } catch (\Exception $e) {
            // エラーハンドリング
            Log::error('ゲームデータ更新中にエラーが発生:', [
                'error' => $e->getMessage(),
                'data'  => $validated,
            ]);
        }
    }

}

