<?php

namespace App\Services;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GameService
{
    public function initializeGame()
    {
        Log::info('initializeGame: ゲーム初期化処理開始');

        $getSwitchState = function ($key) {
            $state = DB::table('switch_states')->where('key', $key)->value('state');
            return $state === 'on';
        };
    
        // スイッチ状態変数をDBから読み込む
        $kakumei = false;
        $suitsibari = $getSwitchState('switch0State');
        $ranksibari = $getSwitchState('switch1State');
        $kiri = $getSwitchState('switch2State');
        $bakku = $getSwitchState('switch3State');
        $kaesi = $getSwitchState('switch4State');
        $sukippu = $getSwitchState('switch5State');
        $watasi = $getSwitchState('switch6State');
        $sute = $getSwitchState('switch7State');
        $bonnba = $getSwitchState('switch8State');

        // カードデッキの作成
        $suits = [0, 1, 2, 3];
        $carddeck = [];

        foreach ($suits as $suit) {
            for ($rank = 1; $rank <= 13; $rank++) {
                $carddeck[] = [
                    'suit'  => $suit,
                    'rank'  => $rank,
                    'count' => 0 // カウントを初期化
                ];
            }
        }
        // ジョーカーの追加
        $carddeck[] = [
            'suit'  => 4,
            'rank'  => 14,
            'count' => 0 // ジョーカーのカウントを初期化
        ];

        // シャッフル処理
        shuffle($carddeck);
        Log::debug('initializeGame: デッキシャッフル後のカードデッキ', ['carddeck' => $carddeck]);

        // プレイヤーへの配布
        $players = [
            ['name' => 'user', 'hand' => []],
            ['name' => 'cpu1', 'hand' => []],
            ['name' => 'cpu2', 'hand' => []],
            ['name' => 'cpu3', 'hand' => []]
        ];

        // カードをプレイヤーに配布
        $index = 0;
        for ($i = 0; $i < 13; $i++) {
            foreach ($players as &$player) {
                $player['hand'][] = $carddeck[$index++];
            }
        }
        Log::debug('initializeGame: カード配布後のプレイヤーデータ', ['players' => $players]);

        // 余ったカードをランダムなプレイヤーに追加
        if ($index < count($carddeck)) {
            $randomPlayerIndex = rand(0, count($players) - 1);
            $players[$randomPlayerIndex]['hand'][] = $carddeck[$index];
        }

        // 初期状態をセッションに保存
        session([
            'players'        => $players,
            'currentPlayer'  => 0,
            'gameOver'       => false,
            'kakumei'        => $kakumei,
            'suitsibari'     => $suitsibari,
            'ranksibari'     => $ranksibari,
            'kiri'           => $kiri,
            'bakku'          => $bakku,
            'kaesi'          => $kaesi,
            'sukippu'        => $sukippu,
            'watasi'         => $watasi,
            'sute'           => $sute,
            'bonnba'         => $bonnba
        ]);
        Log::info('initializeGame: 初期化完了。gameControl呼び出しへ');

        // 初期化後、ゲーム進行の処理を呼び出し
        return $this->gameControl();
    }

    public function gameControl()
    {
        Log::info('gameControl: ゲームコントロール処理開始');
        // セッションからゲーム状態を取得
        $players = session('players');
        $currentPlayer = session('currentPlayer');
        $gameOver = session('gameOver');

        // セッションデータの存在確認
        if (is_null($players) || is_null($currentPlayer) || is_null($gameOver)) {
            return response()->json([
                'message' => 'ゲームデータが見つかりません。再度ゲームを初期化してください。',
                'gameOver' => true
            ], 400);
        }

        if ($gameOver) {
            return response()->json([
                'message' => 'ゲームは終了しました。',
                'gameOver' => true
            ]);
        }

        // 現在のプレイヤーの処理
        $currentPlayerData = $players[$currentPlayer] ?? null;

        if (is_null($currentPlayerData)) {
            return response()->json([
                'message' => '現在のプレイヤー情報が見つかりません。',
                'gameOver' => true
            ], 400);
        }

        if ($currentPlayerData['name'] === "user") {
            // ユーザーのターン処理
            return $this->userTurn();
        } else {
            // CPUのターン処理
            return $this->cpuTurn();
        }
    }

    private function updateCardCounts()
    {
        // 必要なデータをセッションまたは変数から取得
        $players = Session::get('players');
        $playerIndex = Session::get('currentPlayer');
        $trash = Session::get('trash', []);
        
        if (!empty($trash)) {
            $highestTrashRank = max(array_column($trash, 'rank'));

            

            // ランクがトラッシュの最高ランク以下の場合、カウントを-1に設定
            foreach ($players[$playerIndex]['hand'] as &$card) {
                if ($card['rank'] <= $highestTrashRank) {
                    $card['count'] = -1;
                }
            }

            $jokerInPlayer = !empty(array_filter($players[$playerIndex]['hand'], fn($card) => $card['suit'] === 4));

            // トラッシュカードが2枚以上の場合の処理
            if (count($trash) > 1 && !$jokerInPlayer) {
                $jokerInPlayer = !empty(array_filter($players[$playerIndex]['hand'], fn($card) => $card['suit'] === 4));
                $allSameRank = count(array_unique(array_column($trash, 'rank'))) === 1;

                if ($allSameRank) {
                    foreach ($players[$playerIndex]['hand'] as &$card) {
                        if ($card['rank'] !== $highestTrashRank + 1 && $card['suit'] !== 4) {
                            $card['count'] = -1;
                        }
                    }
                    $countZeroCards = array_filter($players[$playerIndex]['hand'], fn($card) => $card['count'] === 0);
                    foreach ($countZeroCards as &$card) {
                        $sameRankCards = array_filter($countZeroCards, fn($c) => $c['rank'] === $card['rank']);
                        if (count($sameRankCards) < count($trash)) {
                            $card['count'] = -1;
                        }
                    }
                } else {
                    $countZeroCards = array_filter($players[$playerIndex]['hand'], fn($card) => $card['count'] === 0);
                    foreach ($countZeroCards as &$card) {
                        $integers = range(-(count($trash) - 1), count($trash) - 1);
                        $integers = array_filter($integers, fn($i) => $i !== 0);

                        $allConditionsMet = false;
                        foreach ($trash as $trashCard) {
                            foreach ($integers as $j) {
                                $targetRank = $card['rank'] + $j;
                                $targetExists = array_filter($countZeroCards, fn($c) => $c['rank'] === $targetRank && $c['suit'] === $card['suit']);
                                if (!$targetExists) {
                                    $allConditionsMet = false;
                                    break;
                                } else {
                                    $allConditionsMet = true;
                                }
                            }
                            if ($allConditionsMet) break;
                        }
                        if (!$allConditionsMet) {
                            $card['count'] = -1;
                        }
                    }
                }
            }

            if (count($trash) > 1 && $jokerInPlayer) {
                $allSameRank = count(array_unique(array_column($trash, 'rank'))) === 1;
                $highestTrashRank = max(array_column($trash, 'rank'));
    
                $newHandWithoutJokers = array_filter($players[$playerIndex]['hand'], fn($card) => $card['suit'] !== 4);
    
                if ($allSameRank) {
                    foreach ($players[$playerIndex]['hand'] as &$card) {
                        if ($card['rank'] !== $highestTrashRank + 1 && $card['suit'] !== 4) {
                            $card['count'] = -1;
                        }
                    }
    
                    $countZeroCards = array_filter($players[$playerIndex]['hand'], fn($card) => $card['count'] === 0);
    
                    foreach ($countZeroCards as &$card) {
                        $sameRankCardsInHand = array_filter($newHandWithoutJokers, fn($c) => $c['rank'] === $card['rank']);
                        if (count($sameRankCardsInHand) < count($trash) - 1) {
                            $card['count'] = -1;
                        }
                    }
                } else {
                    $countZeroCards = array_filter($players[$playerIndex]['hand'], fn($card) => $card['count'] === 0);
    
                    foreach ($countZeroCards as &$card) {
                        $integers = range(-(count($trash) - 1), count($trash) - 1);
                        $integers = array_filter($integers, fn($i) => $i !== 0);
    
                        $allConditionsMet = false;
    
                        foreach ($trash as $trashCard) {
                            foreach ($integers as $j) {
                                $targetRank = $card['rank'] + $j;
    
                                $targetExists = !empty(array_filter($countZeroCards, fn($c) => $c['rank'] === $targetRank && $c['suit'] === $card['suit']));
    
                                if (!$targetExists) {
                                    $allConditionsMet = false;
                                    break;
                                } else {
                                    $allConditionsMet = true;
                                }
                            }
                            if ($allConditionsMet) break;
                        }
    
                        if (!$allConditionsMet) {
                            $card['count'] = -1;
                        }
                    }
                }
    
                // カウント0のカードがあるかどうかをチェック
                $handWithoutJokers = array_filter($players[$playerIndex]['hand'], fn($card) => $card['suit'] !== 4);
                $hasCountZero = !empty(array_filter($handWithoutJokers, fn($card) => $card['count'] === 0));
    
                foreach ($players[$playerIndex]['hand'] as &$card) {
                    if ($card['suit'] === 4) { // ジョーカーの場合
                        $card['count'] = $hasCountZero ? 0 : -1;
                    }
                }
            }

        }

        // 更新されたプレイヤー情報とトラッシュをセッションに保存
        Session::put([
            'players' => $players,

        ]);
        return $players;
    }

    public function userTurn()
    {
        Log::info('userTurn: ユーターン処理開始');
       

        // カードのカウントを更新
        $players = $this->updateCardCounts();
        $currentPlayer = Session::get('currentPlayer');
        $trash = Session::get('trash', []);
        $kakumei    = Session::get('kakumei');
        $suitsibari = Session::get('suitsibari');
        $ranksibari = Session::get('ranksibari');
        $kiri       = Session::get('kiri');
        $bakku      = Session::get('bakku');
        $kaesi      = Session::get('kaesi');
        $sukippu    = Session::get('sukippu');
        $watasi     = Session::get('watasi');
        $sute       = Session::get('sute');
        $bonnba     = Session::get('bonnba');
        
        // レスポンスデータを準備
        $responseData = [
            'players'       => $players,
            'currentPlayer' => $currentPlayer,
            'trash'         => $trash,
            'kakumei'       => $kakumei,
            'suitsibari'    => $suitsibari,
            'ranksibari'    => $ranksibari,
            'kiri'          => $kiri,
            'bakku'         => $bakku,
            'kaesi'         => $kaesi,
            'sukippu'       => $sukippu,
            'watasi'        => $watasi,
            'sute'          => $sute,
            'bonnba'        => $bonnba
        ];

        // レスポンスデータをログ出力
        Log::debug('userTurn: レスポンスデータ', $responseData);

        // 準備したデータを返す
        return $responseData;
    }

    public function turnset($playerIndex, $players, $trash)
    {
        // 5スキップの処理
        $rank5Count = 0;
        foreach ($trash as $card) {
            if (abs($card['rank']) === 2 && $card['suit'] !== 4) {
                $rank5Count++;
            }
        }

        if ($rank5Count > 0) {
            $playerCount = count($players);
            if ($rank5Count >= ($playerCount - 1)) {
                $response['sukippuCount'] = $playerCount - 1;
            } else {
                $response['sukippuCount'] = $rank5Count;
                $response['passcount']    = $rank5Count;
            }
        }

        // 8切りの確認
        if ($kiri) {
            $kiri0 = false;
            foreach ($trash as $card) {
                if (abs($card['rank']) === 5 && $card['suit'] !== 4) {
                    $kiri0 = true;
                    break;
                }
            }

            if ($kiri0) {
                // sukippuCountの設定
                $playerCount = count($players);
                $response['sukippuCount'] = $playerCount - 1;
            }
        }

        // rememberedNameの取得
        if (isset($players[$playerIndex])) {
            $rememberedName = $players[$playerIndex]['name'];
        } else {
            // エラーハンドリング
            throw new \Exception("Invalid playerIndex: $playerIndex");
        }

        // sukippuCountが players.length - 1 と一致する場合の処理
        if ($response['sukippuCount'] === (count($players) - 1)) {
            $trash = [];
            $response['passcount'] = 0;
            $suitsibari0 = false;
            $ranksibari0 = false;

            if ($bakku0) {
                for ($i = 0; $i < count($players); $i++) {
                    foreach ($players[$i]['hand'] as &$card) {
                        if ($card['suit'] !== 4) {
                            $card['rank'] = -$card['rank'];
                        }
                    }
                }
                $bakku0 = false;
            }
        }

        // プレイヤーの手札が空かどうかを確認し、処理を行う
        $hand0 = $playerIndex;
        $playerCount = count($players);
        for ($i = 0; $i < $playerCount; $i++) {
            if (count($players[$hand0]['hand']) === 0) {
                // プレイヤーのレベルを更新
                foreach ($players as $j => $player) {
                    if ($player['name'] === $players[$hand0]['name']) {
                        $players[$j]['level'] = $gemerank;
                        $gemerank++;
                        $response['passcount'] = -1;
                        $response['messages'][] = '上がりました';
                        // ShowBan(playerIndex) と showCustomAlert はフロントエンドで処理
                        break;
                    }
                }

                // プレイヤーを削除
                array_splice($players, $hand0, 1);

                // 残りプレイヤーが1人になった場合の処理
                if (count($players) === 1) {
                    foreach ($players as $j => $player) {
                        if ($player['name'] === $players[0]['name']) {
                            $players[$j]['level'] = $gemerank;
                            break;
                        }
                    }
                    $response['messages'][] = 'ラウンドを終了します';
                    $this->roundset();
                    return $response;
                }

                // hand0のインデックス調整
                if ($hand0 >= count($players)) {
                    $hand0 = 0;
                }
            } else {
                $hand0 = ($hand0 + 1) % count($players);
            }
        }

        // currentPlayerの設定
        $playerNames = array_column($players, 'name');
        if (in_array($rememberedName, $playerNames)) {
            $response['currentPlayer'] = ($playerIndex + 1 + $response['sukippuCount']) % count($players);
        } else {
            $response['currentPlayer'] = ($playerIndex + $response['sukippuCount']) % count($players);
        }

        return $this->gameControl();
    }
}
