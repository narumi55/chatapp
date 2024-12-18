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

    public function cpuTurn($playerIndex)
    {
        Log::info("cpuTurn: CPUプレイヤー（インデックス {$playerIndex}）のターン開始");

        // ゲーム状態をセッションから取得
        $players = session('players');
        $trash = session('trash', []); // トラッシュデッキ
        $currentPlayer = session('currentPlayer');
        $gameOver = session('gameOver');

        // CPUの手札を取得
        $currentPlayerData = $players[$playerIndex];
        $hand = $currentPlayerData['hand'];

        // カウントを更新
        $this->updateCardCounts($playerIndex);

        // カウント0のカードをフィルタリング
        $countZeroCards = array_filter($players[$playerIndex]['hand'], function($card) {
            return $card['count'] === 0;
        });

        if (count($countZeroCards) > 0) {
            if (count($trash) === 0) {
                Log::info("cpuTurn: トラッシュが空。連続するカードの確認を行います。");

                // 連続するカードのカウントを計算
                foreach ($players[$playerIndex]['hand'] as &$card) {
                    $count = 0;
                    while ($this->hasConsecutiveCard($players[$playerIndex]['hand'], $card, $count + 1)) {
                        $count++;
                    }
                    $card['count'] = $count;
                }
                unset($card); // 参照を解除

                // 最大カウントを取得
                $maxCount = max(array_map(function($card) {
                    return $card['count'];
                }, $players[$playerIndex]['hand']));

                if ($maxCount > 1) {
                    // 最大カウントのカードをフィルタリング
                    $maxCountCards = array_filter($players[$playerIndex]['hand'], function($card) use ($maxCount) {
                        return $card['count'] === $maxCount;
                    });

                    // ランダムに選択
                    $selectedCard = $this->getRandomElement($maxCountCards);
                    $selectedCards = [$selectedCard];

                    // 次の連続カードを追加
                    for ($i = 1; $i <= $selectedCard['count']; $i++) {
                        $nextRank = $selectedCard['rank'] + $i;
                        $nextCard = $this->findCard($players[$playerIndex]['hand'], $selectedCard['suit'], $nextRank);
                        if ($nextCard) {
                            $selectedCards[] = $nextCard;
                        }
                    }

                    // カードをトラッシュに移動
                    $this->moveCardsToTrash($selectedCards, $playerIndex);
                    Log::info("cpuTurn: 連続するカードをトラッシュに移動しました。", ['cards' => $selectedCards]);

                } else {
                    Log::info("cpuTurn: 連続するカードが見つからなかったため、同じランクのカードを確認します。");

                    // 同じランクのカードのカウントを計算
                    foreach ($players[$playerIndex]['hand'] as &$card) {
                        $card['count'] = $this->countSameRankCards($players[$playerIndex]['hand'], $card['rank']);
                    }
                    unset($card); // 参照を解除

                    // 最大カウントを取得
                    $maxCount0 = max(array_map(function($card) {
                        return $card['count'];
                    }, $players[$playerIndex]['hand']));

                    if ($maxCount0 > 1) {
                        // 最大カウントのカードをフィルタリング
                        $maxCount0Cards = array_filter($players[$playerIndex]['hand'], function($card) use ($maxCount0) {
                            return $card['count'] === $maxCount0;
                        });

                        // ランダムに選択
                        $selectedCard = $this->getRandomElement($maxCount0Cards);
                        // 同じランクのカードを選択
                        $selectedCards = array_filter($players[$playerIndex]['hand'], function($card) use ($selectedCard) {
                            return $card['rank'] === $selectedCard['rank'];
                        });

                        // カードをトラッシュに移動
                        $this->moveCardsToTrash($selectedCards, $playerIndex);
                        Log::info("cpuTurn: 同じランクのカードをトラッシュに移動しました。", ['cards' => $selectedCards]);

                    } else {
                        // ランダムに1枚選択してトラッシュに移動
                        $selectedCard = $this->getRandomElement($players[$playerIndex]['hand']);
                        $this->moveCardsToTrash([$selectedCard], $playerIndex);
                        Log::info("cpuTurn: ランダムに選択したカードをトラッシュに移動しました。", ['card' => $selectedCard]);
                    }
                }
            } elseif (count($trash) === 1) {
                Log::info("cpuTurn: トラッシュが1枚のみ。カウント0のカードからランダムに選択します。");

                // カウント0のカードからランダムに選択
                $selectedCard = $this->getRandomElement($countZeroCards);
                $this->moveCardsToTrash([$selectedCard], $playerIndex);
                Log::info("cpuTurn: トラッシュが1枚のため、選択したカードをトラッシュに移動しました。", ['card' => $selectedCard]);
            } else if (count($trash) > 1) {
                // すべてのトラッシュカードが同じランクか確認
                $firstTrashRank = $trash[0]['rank'];
                $allTrashSameRank = array_reduce($trash, function($carry, $card) use ($firstTrashRank) {
                    return $carry && ($card['rank'] === $firstTrashRank);
                }, true);
            
                if ($allTrashSameRank) {
                    // トラッシュ内が全て同じランクの場合
            
                    // countOneCardsの中からジョーカー以外をランダム取得
                    $filteredCountOneCards = array_filter($countOneCards, function($card) {
                        return $card['suit'] !== 4; // 4がジョーカー
                    });
            
                    if (empty($filteredCountOneCards)) {
                        // 全てジョーカーの場合の対策（必要に応じて処理）  
                        // ここではとりあえず1枚ランダムに取得
                        $selectedCard = $this->getRandomElement($countOneCards);
                    } else {
                        $selectedCard = $this->getRandomElement($filteredCountOneCards);
                    }
            
                    // 同ランクのカードを取得
                    $sameRankCards = array_filter($players[$playerIndex]['hand'], function($card) use ($selectedCard) {
                        return $card['rank'] === $selectedCard['rank'];
                    });
            
                    // 同ランクカード数がトラッシュ数より少ない場合、ジョーカーのrankを合わせる
                    if (count($sameRankCards) < count($trash)) {
                        foreach ($countOneCards as &$card) {
                            if ($card['suit'] === 4) { 
                                // ジョーカーのランクをselectedCardに合わせる
                                $card['rank'] = $selectedCard['rank'];
                            }
                        }
                        unset($card);
                        // 再取得
                        $sameRankCards = array_filter($players[$playerIndex]['hand'], function($card) use ($selectedCard) {
                            return $card['rank'] === $selectedCard['rank'];
                        });
                    }
            
                    // トラッシュ枚数分のカードを切り出してトラッシュへ移動
                    $cardsToTrash = array_slice($sameRankCards, 0, count($trash));
                    $this->moveCardsToTrash($cardsToTrash, $playerIndex);
            
                } else {
                    // トラッシュ内が同ランクではない場合、同スートの連続性を狙う
                    do {
                        // countOneCardsからジョーカー以外をランダムに選択
                        $filteredCountOneCards = array_filter($countOneCards, function($card) {
                            return $card['suit'] !== 4;
                        });
                        if (empty($filteredCountOneCards)) {
                            // 全ジョーカーの場合の救済処理（必要なら実装）
                            $selectedCard = $this->getRandomElement($countOneCards);
                        } else {
                            $selectedCard = $this->getRandomElement($filteredCountOneCards);
                        }
            
                        $sameSuitCards = array_filter($players[$playerIndex]['hand'], function($card) use ($selectedCard) {
                            return $card['suit'] === $selectedCard['suit'];
                        });
            
                        $selectedCards = [$selectedCard];
                        $jokerCount = 0;
            
                        // トラッシュ枚数分連続カードまたはジョーカーによる補完を試みる
                        for ($i = 0; $i < count($trash) - 1; $i++) {
                            $randomAction = rand(0, 1);
                            $ranks = array_column($selectedCards, 'rank');
                            $maxRank = max($ranks);
                            $minRank = min($ranks);
            
                            // maxRank+1かminRank-1を探す
                            $nextCard = $this->findCardInArray($sameSuitCards, $selectedCard['suit'], $maxRank + 1);
                            $prevCard = $this->findCardInArray($sameSuitCards, $selectedCard['suit'], $minRank - 1);
            
                            // randomActionが0ならnext優先、1ならprev優先
                            if ($randomAction === 0) {
                                if ($nextCard) {
                                    $selectedCards[] = $nextCard;
                                } else if ($prevCard) {
                                    $selectedCards[] = $prevCard;
                                } else if ($jokerCount === 0) {
                                    $jokerCount++;
                                    // jokerを使ってギャップを埋める
                                    $selectedCards = $this->useJokerToFillGap($sameSuitCards, $selectedCards);
                                } else {
                                    // これ以上続かない
                                    break;
                                }
                            } else {
                                if ($prevCard) {
                                    $selectedCards[] = $prevCard;
                                } else if ($nextCard) {
                                    $selectedCards[] = $nextCard;
                                } else if ($jokerCount === 0) {
                                    $jokerCount++;
                                    $selectedCards = $this->useJokerToFillGap($sameSuitCards, $selectedCards);
                                } else {
                                    break;
                                }
                            }
                        }
            
                        // 必要枚数揃ったらトラッシュへ移動
                        if (count($selectedCards) === count($trash)) {
                            // rankでソート
                            usort($selectedCards, function($a, $b) {
                                return $a['rank'] <=> $b['rank'];
                            });
                            $this->moveCardsToTrash($selectedCards, $playerIndex);
                        }
            
                    } while (count($selectedCards) !== count($trash));
                }
            }
        } else {
            Log::info("cpuTurn: カウント0のカードが存在しないため、パスします。");
            $this->pass($playerIndex);
        }
    }

    /**
     * カードの連続を確認するヘルパーメソッド
     */
    private function hasConsecutiveCard($hand, $card, $offset)
    {
        $nextRank = $card['rank'] + $offset;
        return $this->findCard($hand, $card['suit'], $nextRank) !== null;
    }

    /**
     * 特定のスートとランクのカードを手札から探すヘルパーメソッド
     */
    private function findCard($hand, $suit, $rank)
    {
        foreach ($hand as $card) {
            if ($card['suit'] === $suit && $card['rank'] === $rank) {
                return $card;
            }
        }
        return null;
    }

    /**
     * 同じランクのカードの数をカウントするヘルパーメソッド
     */
    private function countSameRankCards($hand, $rank)
    {
        return count(array_filter($hand, function($card) use ($rank) {
            return $card['rank'] === $rank;
        }));
    }

    /**
     * 配列からランダムな要素を取得するヘルパーメソッド
     */
    private function getRandomElement($array)
    {
        if (empty($array)) {
            return null;
        }
        $keys = array_keys($array);
        $randomKey = $keys[array_rand($keys)];
        return $array[$randomKey];
    }

    private function findCardInArray($cards, $suit, $rank) 
    {
        foreach ($cards as $card) {
            if ($card['suit'] === $suit && $card['rank'] === $rank) {
                return $card;
            }
        }
        return null;
    }
    
    private function useJokerToFillGap($sameSuitCards, $selectedCards) 
    {
        // Jokerによるギャップ埋め処理例
        $ranks = array_column($selectedCards, 'rank');
        $maxRank = max($ranks);
        $minRank = min($ranks);
    
        // maxRank+2, minRank-2などを探してJokerランクを決定
        $next2Card = $this->findCardInArray($sameSuitCards, $selectedCards[0]['suit'], $maxRank + 2);
        $prev2Card = $this->findCardInArray($sameSuitCards, $selectedCards[0]['suit'], $minRank - 2);
    
        $jokerAdjustment = 0;
        if ($next2Card && $prev2Card) {
            $jokerAdjustment = rand(0,1) === 0 ? $maxRank + 1 : $maxRank - 1;
        } else if ($prev2Card) {
            $jokerAdjustment = $maxRank - 1;
        } else {
            $jokerAdjustment = $maxRank + 1;
        }
    
        // Jokerのrankを調整
        // $countOneCards等、ジョーカーを含む配列が必要
        global $countOneCards; // グローバル利用はあまり望ましくないため、実際は引数で渡すこと推奨。
        foreach ($countOneCards as &$card) {
            if ($card['suit'] === 4) {
                $card['rank'] = $jokerAdjustment;
                $selectedCards[] = $card;
            }
        }
        unset($card);
    
        return $selectedCards;
    }

    /**
     * パスを処理するヘルパーメソッド
     */
    private function pass($playerIndex)
    {
        Log::info("pass: プレイヤー（インデックス {$playerIndex}）がパスしました。");
        // パスの処理内容に応じて実装
        // 例えば、ターンを次に進めるなど
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
