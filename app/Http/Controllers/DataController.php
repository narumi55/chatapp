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

    public function initializeGame()
    {
        try {
            // サービスクラスを呼び出してゲームを初期化
            $responseData = $this->gameService->initializeGame();

            return response()->json($responseData);
        } catch (\Exception $e) {
            // エラーハンドリング
            return response()->json([
                'message' => '初期化中にエラーが発生しました。',
                'error'   => $e->getMessage()
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

