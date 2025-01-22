<?php

namespace App\Services;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Game;

class GameService
{
    public function initializeGame($room)
    {
        Log::info('initializeGame: ゲーム初期化処理開始');

        $pin = $room->pin;
        $players = [
            [
                'name' => $room->host_user_name,
                'id'   => $room->host_user_id,
                'hand' => [],
            ],
            [
                'name' => $room->guest_user_name,
                'id'   => $room->guest_user_id,
                'hand' => [],
            ],
        ];

        $toggles = $room->toggles;

        $settings = [
            'suitsibari' => ($toggles['switch0State'] ?? 'off') === 'on',
            'ranksibari' => ($toggles['switch1State'] ?? 'off') === 'on',
            'kiri'       => ($toggles['switch2State'] ?? 'off') === 'on',
            'bakku'      => ($toggles['switch3State'] ?? 'off') === 'on',
            'kaesi'      => ($toggles['switch4State'] ?? 'off') === 'on',
            'sukippu'    => ($toggles['switch5State'] ?? 'off') === 'on',
            'watasi'     => ($toggles['switch6State'] ?? 'off') === 'on',
            'sute'       => ($toggles['switch7State'] ?? 'off'),
            'bonnba'     => ($toggles['switch8State'] ?? 'off') === 'on',
        ];

        // カードデッキの作成とシャッフル
        $suits = [0, 1, 2, 3];
        $carddeck = [];
        foreach ($suits as $suit) {
            for ($rank = 1; $rank <= 13; $rank++) {
                $carddeck[] = ['suit' => $suit, 'rank' => $rank];
            }
        }
        $carddeck[] = ['suit' => 4, 'rank' => 14]; // ジョーカー
        shuffle($carddeck);

        // カードを配布
        $index = 0;
        for ($i = 0; $i < 13; $i++) {
            foreach ($players as &$player) {
                $player['hand'][] = $carddeck[$index++];
            }
        }

        // 余ったカードをランダムなプレイヤーに追加
        if ($index < count($carddeck)) {
            $randomPlayerIndex = rand(0, count($players) - 1);
            $players[$randomPlayerIndex]['hand'][] = $carddeck[$index];
        }

        // データベースに保存
        $game = Game::create([
            'pin'        => $pin,
            'players'    => json_encode($players),
            'trash'      => json_encode([]),
            'game_over'  => false,
            'kakumei'    => false,
            'suitsibari' => $settings['suitsibari'],
            'ranksibari' => $settings['ranksibari'],
            'kiri'       => $settings['kiri'],
            'bakku'      => $settings['bakku'],
            'kaesi'      => $settings['kaesi'],
            'sukippu'    => $settings['sukippu'],
            'watasi'     => $settings['watasi'],
            'sute'       => $settings['sute'],
            'bonnba'     => $settings['bonnba'],
        ]);

        Log::info('initializeGame: 初期化完了。gameControl呼び出しへ', ['game' => $game]);

        return $this->gameControl($pin);
    }

    public function gameControl($pin)
    {
        Log::info('gameControl: ゲームコントロール処理開始');
        // データベースからゲーム状態を取得
        $game = Game::where('pin', $pin)->first();

        if (!$game) {
            // ゲームが見つからない場合のエラー処理
            abort(404, 'Game not found.');
        }

        // 必要なゲーム状態を変数に格納
        $players = $game->players; // 配列として取得（モデルの $casts 設定で変換される前提）
        $playerIndex = $game->playerIndex; // デフォルト値を設定
        $gameOver = $game->game_over;

        if ($gameOver) {
            return response()->json([
                'message' => 'ゲームは終了しました。',
                'gameOver' => true
            ]);
        }

        // 現在のプレイヤーの処理
        $currentPlayerData = $players[$playerIndex] ?? null;

        if (is_null($currentPlayerData)) {
            return response()->json([
                'message' => '現在のプレイヤー情報が見つかりません。',
                'gameOver' => true
            ], 400);
        }

        return $this->userTurn($pin);
    }

    private function updateCardCounts($pin)
    {
        // データベースからゲーム状態を取得
        $game = Game::where('pin', $pin)->first();

        if (!$game) {
            // ゲームが見つからない場合のエラー処理
            abort(404, 'Game not found.');
        }

        // 必要なデータをデータベースから取得
        $players = $game->players; // 配列として取得（$casts 設定済み）
        $playerIndex = $game->playerIndex; // デフォルト値を設定
        $trash = $game->trash; // デフォルト値として空配列
        
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

        $game->update([
            'players' => $players, // `$casts` により自動で JSON に変換
        ]);
        return $players;
    }

    public function userTurn($pin)
    {
        Log::info('userTurn: ユーターン処理開始');
       

        // データベースからゲーム状態を取得
        $game = Game::where('pin', $pin)->first();

        if (!$game) {
            // ゲームが見つからない場合のエラー処理
            abort(404, 'Game not found.');
        }

        // 必要なデータをデータベースから取得
        $players = $this->updateCardCounts($pin); // カードカウントを更新する処理
        $playerIndex = $game->playerIndex; // プレイヤーのインデックス
        $trash = $game->trash; // 捨て札
        $kakumei = $game->kakumei;
        $suitsibari = $game->suitsibari;
        $ranksibari = $game->ranksibari;
        $kiri = $game->kiri;
        $bakku = $game->bakku;
        $kaesi = $game->kaesi;
        $sukippu = $game->sukippu;
        $watasi = $game->watasi;
        $sute = $game->sute;
        $bonnba = $game->bonnba;

        // レスポンスデータを準備
        $responseData = [
            'pin'           => $pin,
            'players'       => $players,
            'playerIndex' => $playerIndex,
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

        return response()->json($responseData);
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
            $response['playerIndex'] = ($playerIndex + 1 + $response['sukippuCount']) % count($players);
        } else {
            $response['playerIndex'] = ($playerIndex + $response['sukippuCount']) % count($players);
        }

        return $this->gameControl();
    }
}
