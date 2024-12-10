var ctx;
var carddeck = [];
var trash = [];
var trump = 0;
var cardMoved = false;
var currentPlayer = 0; 
var passcount = 0;
var players = [];
var player = [
    { name: "user", level: 0 },
    { name: "cpu1", level: 0 },
    { name: "cpu2", level: 0 },
    { name: "cpu3", level: 0 }
];

var gemelevel = ["大富豪", "富豪", "貧民", "大貧民"];
var gemerank = 1;
var round = 0;

//ローカルルールのonoff
var kakumei = false;
var suitsibari = false;
var suitsibari0 = false;
let trashsuits = [];
var ranksibari = false;
var ranksibari0 = false;
var kiri = false;
var bakku = false;
var bakku0 = false;
var kaesi = false;
var sukippu = false;
var watasi = false;
var sute = false;
var bonnba = false;
document.addEventListener('DOMContentLoaded', function() {
    // スイッチの状態を取得し、対応する変数を更新する関数
    function updateSwitchState(switchKey) {
        const switchState = localStorage.getItem(switchKey);
        if (switchState === 'on') {
            return  true;
        } else {
            return false;
        }
    }

    // 各スイッチの状態をチェックして変数に反映
    suitsibari = updateSwitchState('switch0State');
    ranksibari = updateSwitchState('switch1State');
    kiri = updateSwitchState('switch2State');
    bakku = updateSwitchState('switch3State');
    kaesi = updateSwitchState('switch4State');
    sukippu = updateSwitchState('switch5State');
    watasi = updateSwitchState('switch6State');
    sute = updateSwitchState('switch7State');
    bonnba = updateSwitchState('switch8State');
});

//カスタムアラート１
function showCustomAlert(message) {
    const alertDiv = document.getElementById("customAlert");
    const messageParagraph = document.getElementById("alertMessage");

    messageParagraph.innerText = message; // メッセージを設定
    alertDiv.style.display = "block"; // ダイアログを表示

    alertDiv.style.left = "415px"; 
    alertDiv.style.top = "686.25px";

    setTimeout(() => {
        alertDiv.style.display = "none";
    }, 1000);
}

//カスタムアラート２
function showCustomAlert2(message) {
    const alertDiv = document.getElementById("customAlert");
    const messageParagraph = document.getElementById("alertMessage");

    messageParagraph.innerText = message;  // メッセージを設定
    alertDiv.style.display = "block";  // アラートを表示

    // 指定位置に設定
    alertDiv.style.left = "415px";
    alertDiv.style.top = "228.7px";

    // 2秒後に非表示にする
    setTimeout(() => {
        alertDiv.style.display = "none";
    }, 1000);
}

//処理を遅延させる
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//カードオブジェクトの定義
function Card(suit, rank, image, backimage) {
    this.suit = suit;
    this.rank = rank;
    this.image = image;
    this.backimage = backimage;
    this.count = 0; // カウント変数を追加
}

function drawCard(card, x, y, faceUp, rotate) {
    const img = new Image();
    img.src = faceUp ? card.image : card.backimage;
    img.onload = () => {
        if (rotate) {
            ctx.save();
            ctx.translate(x + img.width / 2, y + img.height / 2);
            ctx.rotate(Math.PI / 2); // 90度回転
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            ctx.restore();
        } else {
            ctx.drawImage(img, x, y);
        }
    };
}

//ラウンド開始時にカードを交換する処理
async function exchange() {
    ShowBan(0);
    showCustomAlert("ゲームを始める前にカードを交換します");
    await delay(1000);

    // レベル1のプレイヤーとレベル4のプレイヤーを特定
    const level1Player = players.find(p => p.level === 1);
    const level4Player = players.find(p => p.level === 4);

    // レベル2のプレイヤーとレベル3のプレイヤーを特定
    const level2Player = players.find(p => p.level === 2);
    const level3Player = players.find(p => p.level === 3);

    // レベル1とレベル4の交換処理
    if (level1Player && level4Player) {
        // レベル1のプレイヤーの手札でランクが一番と二番目に低いカードを取得
        const lowCards = [...level1Player.hand].sort((a, b) => a.rank - b.rank).slice(0, 2);

        // レベル4のプレイヤーの手札でランクが一番と二番目に高いカードを取得
        const highCards = [...level4Player.hand].sort((a, b) => b.rank - a.rank).slice(0, 2);

        // カードをそれぞれの手札に移動
        level1Player.hand = level1Player.hand.filter(card => !lowCards.includes(card)).concat(highCards);
        level4Player.hand = level4Player.hand.filter(card => !highCards.includes(card)).concat(lowCards);
    }

    // レベル2とレベル3の交換処理
    if (level2Player && level3Player) {
        // レベル2のプレイヤーの手札でランクが一番低いカードを取得
        const lowestCard = [...level2Player.hand].sort((a, b) => a.rank - b.rank)[0];

        // レベル3のプレイヤーの手札でランクが一番高いカードを取得
        const highestCard = [...level3Player.hand].sort((a, b) => b.rank - a.rank)[0];

        // カードをそれぞれの手札に移動
        level2Player.hand = level2Player.hand.filter(card => card !== lowestCard).concat(highestCard);
        level3Player.hand = level3Player.hand.filter(card => card !== highestCard).concat(lowestCard);
    }
    ShowBan(0);
    showCustomAlert("カードを交換しました");
    await delay(1000);
}

setInterval(updateGameBoard, 500);
async function updateGameBoard() {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const response = await fetch('/initialize-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`サーバーエラー: ${response.status}`);
        }

        const data = await response.json();
        console.log('レスポンスデータ:', data);

        if (data.gameOver) {
            console.log('ゲームが終了しました');
            // ゲーム終了時の処理をここに追加
            return;
        }

        // サーバーからのデータを基に画面を描画
        const playersData = data.players;
        const currentPlayerIndex = data.currentPlayer;
        const trash = data.trash || []; // サーバーから捨て札情報を受け取る場合

        // ゲーム画面を描画
        ShowBan(currentPlayerIndex, playersData, trash);

    } catch (error) {
        console.error('エラー:', error);
    }
}

function ShowBan(playerIndex, players, trash) {
    // 画面のクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景画像の描画
    const img = kakumei ? document.getElementById('siro2') : document.getElementById('siro1');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 各プレイヤーの情報を描画
    players.forEach((player, index) => {
        const positions = [
            { x: 58, y: 857, levelY: 880, imageId: 'p1' }, // ユーザー
            { x: 58, y: 174, levelY: 197, imageId: 'p2' }, // CPU1
            { x: 772, y: 58, levelY: 81, imageId: 'p2' },  // CPU2
            { x: 772, y: 741, levelY: 764, imageId: 'p2' } // CPU3
        ];

        const pos = positions[index];
        const playerImage = document.getElementById(pos.imageId);

        // プレイヤーアイコンの描画
        ctx.drawImage(playerImage, pos.x - 58, pos.y - 58, 116, 116);
        ctx.fillText(player.name, pos.x, pos.y);

        if (player.level > 0) {
            const levelText = gemelevel[player.level - 1];
            ctx.fillText(levelText, pos.x, pos.levelY);
        }

        // 現在のプレイヤーをハイライト
        if (index === playerIndex) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 60, 0, 2 * Math.PI);
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });

    // 各プレイヤーの手札を描画
    players.forEach(player => {
        if (player.name === "user") {
            drawHand(player.hand, { xStart: 126, y: 809, xStep: 36, faceUp: true });
        } else if (player.name === "cpu1") {
            drawHand(player.hand, { xStart: 21, yStart: 229, yStep: 28, faceUp: false, rotate: true });
        } else if (player.name === "cpu2") {
            drawHand(player.hand, { xStart: 633, y: 10, xStep: -36, faceUp: false });
        } else if (player.name === "cpu3") {
            drawHand(player.hand, { xStart: 736, yStart: 589, yStep: -28, faceUp: false, rotate: true });
        }
    });

    // 捨て札の描画
    drawHand(trash, { xStart: 415 - 35.5 * trash.length, y: 409.5, xStep: 72, faceUp: true });
}

function drawHand(cards, { xStart, yStart, xStep, yStep, faceUp, rotate }) {
    let x = xStart;
    let y = yStart;

    cards.forEach(card => {
        drawCard(card, x, y, faceUp, rotate);
        if (xStep) x += xStep;
        if (yStep) y += yStep;
    });
}

// ユーザーのターンの処理
function userTurn(playerIndex) {
    canvas.onmousedown = function(event) {
        mousePress(event, playerIndex);
    };
    const passButton = document.querySelector("button[onclick='pass()']");
    passButton.disabled = false;

    // パスボタンにイベントリスナーを追加
    passButton.onclick = function() {
        pass(playerIndex); 
    };

    // ユーザーの手札をランク別、同じランクならスート順にソート
    players[playerIndex].hand.sort(function(a, b) {
        if (Math.abs(a.rank) !== Math.abs(b.rank)) {
            return Math.abs(a.rank) - Math.abs(b.rank);
        }
        return a.suit - b.suit;
    });
    // カウントを更新
    updateCardCounts(playerIndex);
    ShowBan(playerIndex);
    showCustomAlert("ユーザーのターン");
}

// CPUのターンの処理
async function cpuTurn(playerIndex) {
    await delay(1000);
    ShowBan(playerIndex);
    // カウントを更新
    await delay(1000);
    updateCardCounts(playerIndex);

    // カウント0のカードをフィルタリング
    const countOneCards = players[playerIndex].hand.filter(card => card.count === 0); 

    // カウント0のカードが存在する場合
    if (countOneCards.length > 0) {
        if (trash.length === 0) {
            // 連続するカードで出せるかの確認
            players[playerIndex].hand.forEach(card => {
                var count0 = 0;
                while (players[playerIndex].hand.some(c => c.rank === card.rank + count0 + 1 && c.suit === card.suit)) { 
                    count0++;
                }
                card.count = count0;
            });

            const maxCount = Math.max(...players[playerIndex].hand.map(card => card.count)); 
            if (maxCount > 1) {
                const maxCountCards = players[playerIndex].hand.filter(card => card.count === maxCount);
                const randomIndex = Math.floor(Math.random() * maxCountCards.length);
                const selectedCard = maxCountCards[randomIndex];
                let selectedCards = [selectedCard];
                for (var i = 1; i <= selectedCard.count; i++) {
                    const nextCard = maxCountCards.find(card => card.rank === selectedCard.rank + i && card.suit === selectedCard.suit);
                    if (nextCard) {
                        selectedCards.push(nextCard);
                    }
                }
                moveCardsToTrash(selectedCards, playerIndex);
            } else {
                // 同じランクのカードで出せるかの確認
                players[playerIndex].hand.forEach(card0 => {
                    card0.count = players[playerIndex].hand.filter(c0 => c0.rank === card0.rank).length;
                });

                const maxCount0 = Math.max(...players[playerIndex].hand.map(card0 => card0.count)); 
                if (maxCount0 > 1) {
                    const maxCountCards = players[playerIndex].hand.filter(card0 => card0.count === maxCount0);
                    const randomIndex = Math.floor(Math.random() * maxCountCards.length);
                    const selectedCard = maxCountCards[randomIndex];
                    const selectedCards = maxCountCards.filter(card0 => card0.rank === selectedCard.rank);
                    moveCardsToTrash(selectedCards, playerIndex);
                } else {
                    const randomIndex = Math.floor(Math.random() * players[playerIndex].hand.length); 
                    const selectedCard = players[playerIndex].hand[randomIndex];
                    // 選んだカードをトラッシュに移動
                    moveCardsToTrash([selectedCard], playerIndex);
                }
            } 
        } else if (trash.length === 1) {
            // ランダムにカウント0のカードを選ぶ
            const randomIndex = Math.floor(Math.random() * countOneCards.length);
            const selectedCard = countOneCards[randomIndex];

            // 選んだカードをトラッシュに移動
            moveCardsToTrash([selectedCard], playerIndex);
        } else if (trash.length > 1) {
            // トラッシュにカードが2枚以上の場合
            var allTrashSameRank = trash.every(card => card.rank === trash[0].rank); // すべてのトラッシュのカードが同じランクかどうか
            if (allTrashSameRank) {
                let selectedCard;
                do {
                    const randomIndex = Math.floor(Math.random() * countOneCards.length);
                    selectedCard = countOneCards[randomIndex];
                } while (selectedCard.suit === 4);
                let sameRankCards = players[playerIndex].hand.filter(card => card.rank === selectedCard.rank); 
                if (sameRankCards.length < trash.length) {
                    countOneCards.forEach(card => {
                        if (card.suit === 4) {
                            card.rank = selectedCard.rank; 
                        }
                    });
                    sameRankCards = players[playerIndex].hand.filter(card => card.rank === selectedCard.rank); 
                } 
                const cardsToTrash = sameRankCards.slice(0, trash.length);
                moveCardsToTrash(cardsToTrash, playerIndex);
            } else {
                let selectedCard;
                do {
                    do {
                        const randomIndex = Math.floor(Math.random() * countOneCards.length);
                        selectedCard = countOneCards[randomIndex];
                    } while (selectedCard.suit === 4);

                    let sameSuitCards = players[playerIndex].hand.filter(card => card.suit === selectedCard.suit); 
                    selectedCards = [selectedCard];
                    let jokerCount = 0;
                    for (let i = 0; i < trash.length - 1; i++) {
                        let randomAction = Math.floor(Math.random() * 2);
                        let maxRank = Math.max(...selectedCards.map(card => card.rank));
                        let minRank = Math.min(...selectedCards.map(card => card.rank));
                        let nextCard = sameSuitCards.find(card => card.rank === maxRank + 1);
                        let prevCard = sameSuitCards.find(card => card.rank === minRank - 1);

                        if (randomAction === 0) {
                            if (nextCard) {
                                selectedCards.push(nextCard);
                            } else if (prevCard) {
                                selectedCards.push(prevCard);
                            } else if (jokerCount === 0) {
                                jokerCount++;
                                let next2Card = sameSuitCards.find(card => card.rank === maxRank + 2);
                                let prev2Card = sameSuitCards.find(card => card.rank === minRank - 2);
                                let jokerAdjustment = 0;

                                if (next2Card && prev2Card) {
                                    jokerAdjustment = Math.floor(Math.random() * 2) === 0 ? maxRank + 1 : maxRank - 1;
                                } else if (prev2Card) {
                                    jokerAdjustment = maxRank - 1;
                                } else {
                                    jokerAdjustment = maxRank + 1;
                                }

                                countOneCards.forEach(card => {
                                    if (card.suit === 4) {
                                        card.rank = jokerAdjustment;
                                        selectedCards.push(card);
                                    }
                                });
                            } else {
                                break;
                            }
                        } else {
                            if (prevCard) {
                                selectedCards.push(prevCard);
                            } else if (nextCard) {
                                selectedCards.push(nextCard);
                            } else if (jokerCount === 0) {
                                jokerCount++;
                                let next2Card = sameSuitCards.find(card => card.rank === maxRank + 2);
                                let prev2Card = sameSuitCards.find(card => card.rank === minRank - 2);
                                let jokerAdjustment = 0;

                                if (next2Card && prev2Card) {
                                    jokerAdjustment = Math.floor(Math.random() * 2) === 0 ? maxRank + 1 : maxRank - 1;
                                } else if (prev2Card) {
                                    jokerAdjustment = maxRank - 1;
                                } else {
                                    jokerAdjustment = maxRank + 1;
                                }

                                countOneCards.forEach(card => {
                                    if (card.suit === 4) {
                                        card.rank = jokerAdjustment;
                                        selectedCards.push(card);
                                    }
                                });
                            } else {
                                break;
                            }
                        }
                    }
                    if (trash.length === selectedCards.length) {
                        selectedCards.sort((a, b) => a.rank - b.rank);
                        moveCardsToTrash(selectedCards, playerIndex);
                    }
                } while (!(trash.length === selectedCards.length));
            }
        }
    } else {
        pass(playerIndex);
    }
}

// ユーザーのマウスクリックを処理する関数。
function mousePress(event, playerIndex) {
    var mX = event.offsetX;
    var mY = event.offsetY;

    var userIndex = -1;
    var pos = 126;

    // ユーザーがクリックしたカードを特定する
    for (var i = 0; i < players[playerIndex].hand.length; i++) {
        if (mX > pos && mX < pos + 36 && mY > 809 && mY < 905) {
            userIndex = i;
            break;
        }
        pos += 36;
    }

    // カードが特定できない場合は何もしない
    if (userIndex < 0) {
        return;
    }

    // カウントがマイナス1のカードをクリックしたときは処理を終了
    if (players[playerIndex].hand[userIndex].count === -1) {
        return;
    }

    cardMoved = false;

    // カウントが0のカードをクリックした場合
    if (event.button === 0 && players[playerIndex].hand[userIndex].count === 0) {
        players[playerIndex].hand[userIndex].count += 1; // カウントを1にする
    } else if (event.button === 0 && players[playerIndex].hand[userIndex].count === 1) {
        // カウントが1のカードをクリックした場合
        var countOneCards = players[playerIndex].hand.filter(card => card.count === 1); // カウントが1のカードを収集

        var jokerInCountOne = countOneCards.some(card => card.suit === 4); // ここではランク14をジョーカーと仮定
        var ranks = countOneCards.map(card => card.rank).sort((a, b) => a - b);
        if (jokerInCountOne && countOneCards.length > 1) {
            var sameRankCards1 = ranks.slice(0, ranks.length - 1).every(rank => rank === ranks[0]);
            if(sameRankCards1){
                countOneCards.forEach(card => {
                    if (card.suit === 4) {
                        card.rank = ranks[0]; 
                    }
                });
            } else {
                countOneCards.forEach(card => {
                    if (card.suit === 4) {  // ジョーカーの処理
                        var comparisoncheck = false;
                        var comparisonCount = 0;
                        var jokerposition = 0;
                                
                        // ランクが階段状になっているか確認
                        for (var j = 0; j < ranks.length - 2; j++) {
                            var comparison = ranks[j + 1] - ranks[j];  // comparison変数を定義
                            if (comparison === 1) {
                                comparisoncheck = true;
                            } else if (comparison === 2 && comparisonCount < 1) {
                                comparisonCount++;
                                jokerposition = j;
                                comparisoncheck = true;
                            } else {
                                comparisoncheck = false;
                                break;
                            }
                        }
                                
                        // comparisoncheckに基づいてジョーカーのランクを決定
                        if (comparisoncheck) {
                            if (comparisonCount === 0) {
                                card.rank = ranks[ranks.length - 2] + 1;  // ジョーカーを最後尾に設定
                            } else {
                                card.rank = ranks[jokerposition] + 1;  // ジョーカーをギャップに設定
                            }
                            ranks = countOneCards.map(card => card.rank).sort((a, b) => a - b);
                        }
                    }
                });
            }
            
        } 
        // 同じランクやスートを確認
        var sameRankCards = countOneCards.filter(card => card.rank === countOneCards[0].rank);
        var isSameSuitType = (card) => [0, 1, 2, 3].includes(card.suit);
        var sameSuit = countOneCards.every(card => 
            isSameSuitType(card) ? card.suit === countOneCards[0].suit : card.suit === 4
        );
        var isConsecutive = ranks.every((rank, index, arr) => index === 0 || rank === arr[index - 1] + 1);

        // トラッシュ処理
        if (trash.length === 0) {
            // トラッシュが空の場合
            if (countOneCards.length === 1) {
                moveCardsToTrash(countOneCards, 0); // トラッシュに移動
            } else if (countOneCards.length === 2 && sameRankCards.length === 2) {
                moveCardsToTrash(countOneCards, 0); // 両方をトラッシュに移動
            } else if (countOneCards.length >= 3 && (sameRankCards.length === countOneCards.length || (sameSuit && isConsecutive))) {
                moveCardsToTrash(countOneCards, 0); // すべてのカードをトラッシュに移動
            } 
        }
        else if (trash.length === 1 && countOneCards.length === 1) {
            moveCardsToTrash(countOneCards, 0); // トラッシュに移動
        }
        else if (trash.length > 1 && countOneCards.length === trash.length) {
            // トラッシュにカードが2枚以上の場合
            var allTrashSameRank = trash.every(card => card.rank === trash[0].rank); // すべてのトラッシュのカードが同じランクかどうか
            var clickedCardRank = countOneCards[0].rank; // クリックしたカードのランク
        
            if (allTrashSameRank && countOneCards.every(card => card.rank === clickedCardRank)) {
                // すべてのトラッシュのカードが同じランクかつクリックしたカードが同じランクの場合
                moveCardsToTrash(countOneCards, 0); // トラッシュに移動
            } else if (!allTrashSameRank && isConsecutive) {
                // トラッシュのカードが同じランクではないが、クリックしたカードが階段の場合
                moveCardsToTrash(countOneCards, 0); // トラッシュに移動
            }
        }
        // カードが移動されなかった場合、手札のすべてのカウントが1のカードをカウント0にする
        if (!cardMoved) {
            players[playerIndex].hand.forEach(card => {
                if (card.count === 1) {
                    card.count = 0; // カウントを0にする
                }
            });
        }

    } else if (event.button === 2 && players[playerIndex].hand[userIndex].count === 1) {
        players[playerIndex].hand[userIndex].count = 0;
    }
    
    // 画面を更新してゲームの状態を表示する
    ShowBan(playerIndex);
}

// トラッシュの新旧を比較する関数
async function moveCardsToTrash(cards, playerIndex) {
    if (suitsibari && suitsibari0 === false) {
        trashsuits = trash.map(card => card.suit);
    }

    var highestTrashRank = trash.length > 0 ? Math.max(...trash.map(card => card?.rank || 0)) : null;

    var jokerone = false;

    if (kaesi) {
        if (trash.length === 1 && trash[0].suit === 4) {
            jokerone = true; 
        }
    }
    
    // カードが有効な場合のみトラッシュに追加
    trash = [];
    trash.push(...cards.filter(card => card !== undefined)); // undefined のカードを除外

    for (var card of cards) {
        card.count = 0; // カウントを0にする
        players[playerIndex].hand.splice(players[playerIndex].hand.indexOf(card), 1); // 指定されたプレイヤーの手札から削除
    }

    cardMoved = true;
    passcount = 0;

    ShowBan(playerIndex);

    if (suitsibari && suitsibari0 === false) {
        const allMatch = cards.every(card => trashsuits.includes(card.suit));
        if (allMatch) {
            suitsibari0 = true;
            if (ranksibari0) {
                showCustomAlert2("激しば");
                await delay(1000);
            } else {
                showCustomAlert2("しばり");
                await delay(1000);
            }
        } 
    }

    if (ranksibari && ranksibari0 === false) {
        var lowestTrashRank = trash.length > 0 ? Math.min(...trash.map(card => card?.rank || Infinity)) : null;
        if (lowestTrashRank !== null && highestTrashRank !== null && lowestTrashRank === highestTrashRank + 1) {
            ranksibari0 = true;
            if (suitsibari0) {
                showCustomAlert2("激しば");
                await delay(1000);
            } else {
                showCustomAlert2("数しばり");
                await delay(1000);
            }
        }
    }

    if (kaesi && jokerone) {
        if (trash.length === 1 && trash[0].suit === 3 && trash[0].rank === 0) {
            jokerone = true; 
        } else {
            jokerone = false;
        }
    }
    
    if (jokerone) {
        // スぺ３返しの処理
        showCustomAlert2("スぺ３返し");
        await delay(1000);
        
        turnset(playerIndex, players.length - 1);
    } else {
        trashcheck(playerIndex);
    }
}

// ローカルルールを処理する関数
async function trashcheck(playerIndex) {
    // 革命の確認
    if (trash.length > 3) {
        for (var i = 0; i < players.length; i++) {
            players[i].hand.forEach(card => {
                if (card.suit !== 4) { 
                    card.rank = -card.rank;
                }
            });
        }
        trash.forEach(card => {
            if (card.suit !== 4) { 
                card.rank = -card.rank;
            }
        });
        if (kakumei) {
            kakumei = false;
        } else {
            kakumei = true;
        }
        showCustomAlert2("革命");
        await delay(1000);
    }

    // 11バックの確認
    if (bakku && bakku0 === false) {
        bakku0 = trash.some(card => Math.abs(card.rank) === 8 && card.suit !== 4);
        if (bakku0) {
            for (var i = 0; i < players.length; i++) {
                players[i].hand.forEach(card => {
                    if (card.suit !== 4) { 
                        card.rank = -card.rank;
                    }
                });
            }
            trash.forEach(card => {
                if (card.suit !== 4) { 
                    card.rank = -card.rank;
                }
            });
            showCustomAlert2("１１バック");
            await delay(1000);
        }
    }

    let rank7Count = 0;
    let rank10Count = 0;
    let rank12Count = 0;

    // 7渡しの確認
    if (watasi) {
        rank7Count = trash.filter(card => Math.abs(card.rank) === 4 && card.suit !== 4).length; 
    }

    // 10捨ての確認
    if (sute) {
        rank10Count = trash.filter(card => Math.abs(card.rank) === 7 && card.suit !== 4).length;   
    }

    // 12ボンバーの確認
    if (bonnba) {
        rank12Count = trash.filter(card => Math.abs(card.rank) === 9 && card.suit !== 4).length;        
    }

    if (rank7Count === 0 && rank10Count === 0 && rank12Count === 0) {
        trashcheck2(playerIndex);
    } else if (players[playerIndex].name === "user") {
        cardto(playerIndex,rank7Count, rank10Count, rank12Count);
    } else {
        cpucardto(playerIndex, rank7Count, rank10Count, rank12Count);
    }
}

// CPUのローカルルール２
async function cpucardto(playerIndex, rank7Count, rank10Count, rank12Count) {
    if (rank7Count > 0 && players[playerIndex].hand.length > 0) {
        showCustomAlert2("７渡し");
        await delay(1000);
        var nextplayer = (playerIndex + 1) % players.length;

        if (rank7Count < players[playerIndex].hand.length) {
            let randomhands = [];
            for (let i = 0; i < rank7Count; i++) {        
                const randomIndex = Math.floor(Math.random() * players[playerIndex].hand.length);
                const selectedCard = players[playerIndex].hand[randomIndex];
                randomhands.push(selectedCard);
                players[playerIndex].hand.splice(randomIndex, 1);
            }
            players[nextplayer].hand.push(...randomhands);
        } else if (rank7Count >= players[playerIndex].hand.length) {
            const allCards = players[playerIndex].hand;
            players[nextplayer].hand.push(...allCards);
            players[playerIndex].hand = [];
        }
        ShowBan(playerIndex);
        showCustomAlert("カードが渡されました");
        await delay(1000);
    }

    if (rank10Count > 0 && players[playerIndex].hand.length > 0) {
        showCustomAlert2("１０捨て");
        await delay(1000);
        if (rank10Count < players[playerIndex].hand.length) {
            let randomhands = [];
            let playerhand = players[playerIndex].hand;
            for (let i = 0; i < rank10Count; i++) {
                const randomIndex = Math.floor(Math.random() * playerhand.length);
                const discardedCard = playerhand[randomIndex];
                randomhands.push(discardedCard);
                playerhand.splice(randomIndex, 1);
            }

            randomhands.forEach(card => {
                players[playerIndex].hand = players[playerIndex].hand.filter(c => c !== card); // 手札から捨てる
            });
        } else if (rank10Count >= players[playerIndex].hand.length) {
            players[playerIndex].hand = [];
        }
        ShowBan(playerIndex);
        showCustomAlert("カードが捨てられました");
        await delay(1000);
    }

    if (rank12Count > 0) {
        showCustomAlert2("１２ボンバー");
        await delay(1000);
        let ranks = [];
        for (let i = 0; i < players.length; i++) {        
            ranks.push(...players[i].hand.map(card => card.rank));
        }
        ranks = [...new Set(ranks)];

        if (rank12Count < ranks.length) {
            const randomRank = [];
            for (let i = 0; i < rank12Count; i++) {        
                const randomIndex = Math.floor(Math.random() * ranks.length);
                randomRank.push(ranks[randomIndex]);
            }
            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < randomRank.length; j++) {        
                    players[i].hand = players[i].hand.filter(card => card.rank !== randomRank[j]);
                }
            }
        } else if (rank12Count >= ranks.length) {
            for (let i = 0; i < players.length; i++) {
                players[i].hand = [];
            }
        }
    }

    trashcheck2(playerIndex);
}

// ユーザーのローカルルール２
async function cardto(playerIndex, rank7Count, rank10Count, rank12Count) {
    // すべてのカウントが0の場合は次のターンへ
    if (rank7Count === 0 && rank10Count === 0 && rank12Count === 0) {
        trashcheck2(playerIndex);
        return; // 処理終了
    }

    // 既存のmousedownイベントリスナーを削除
    canvas.onmousedown = null;
    players[playerIndex].hand.forEach(card => {
        card.count = 0;
    });

    // 条件に応じてcanvasのmousedownイベントを追加
    if (rank7Count > 0 && players[playerIndex].hand.length > 0) {
        showCustomAlert2("７渡し");
        await delay(1000);
        showCustomAlert("相手に渡すカードを選択してください");
        canvas.onmousedown = function(event) {
            mousePress2(event, playerIndex, rank7Count, rank10Count, rank12Count, 7); 
        };
    } else if (rank10Count > 0 && players[playerIndex].hand.length > 0) {
        showCustomAlert2("１０捨て");
        await delay(1000);
        showCustomAlert("捨てるカードを選択してください");
        canvas.onmousedown = function(event) {
            mousePress2(event, playerIndex, rank7Count, rank10Count, rank12Count, 10); 
        };
    } else if (rank12Count > 0 && players[playerIndex].hand.length > 0) {
        showCustomAlert2("１２ボンバー");
        await delay(1000);
        showCustomAlert("選んだカードの数字を持つカードをすべての手札から除外します");
        canvas.onmousedown = function(event) {
            mousePress2(event, playerIndex, rank7Count, rank10Count, rank12Count, 12); 
        };
    } else {
        trashcheck2(playerIndex);
    }
}

// ローカルルールのマウスクリックを処理する関数。
function mousePress2(event, playerIndex, rank7Count, rank10Count, rank12Count, setValue) {
    var mX = event.offsetX;
    var mY = event.offsetY;

    var userIndex = -1;
    var pos = 126;

    for (var i = 0; i < players[playerIndex].hand.length; i++) {
        if (mX > pos && mX < pos + 36 && mY > 809 && mY < 905) {
            userIndex = i;
            break;
        }
        pos += 36;
    }

    if (userIndex < 0) {
        return;
    }

    if (players[playerIndex].hand[userIndex].count === -1) {
        return;
    }

    var cardMoved = false;

    if (event.button === 0 && players[playerIndex].hand[userIndex].count === 0) {
        players[playerIndex].hand[userIndex].count += 1;
    } else if (event.button === 0 && players[playerIndex].hand[userIndex].count === 1) {
        var countOneCards = players[playerIndex].hand.filter(card => card.count === 1);
        
        if(setValue === 7 && (countOneCards.length === rank7Count || (players[playerIndex].hand.length < rank7Count && players[playerIndex].hand.length === countOneCards.length))){
            var move = (playerIndex + 1) % players.length;  

            countOneCards.forEach(card => {
                players[playerIndex].hand = players[playerIndex].hand.filter(c => c !== card);
                players[move].hand.push(card);
            });

            cardto(playerIndex, 0, rank10Count, rank12Count)
        } else if (setValue === 10 && (countOneCards.length === rank10Count || (players[playerIndex].hand.length < rank10Count && players[playerIndex].hand.length === countOneCards.length))) {
            countOneCards.forEach(card => {
                players[playerIndex].hand = players[playerIndex].hand.filter(c => c !== card);
            });
            cardto(playerIndex, rank7Count, 0, rank12Count)
        } else if (setValue === 12 && (countOneCards.length === rank12Count || (players[playerIndex].hand.length < rank12Count && players[playerIndex].hand.length === countOneCards.length))) {
            let ranks =  countOneCards.map(card => card.rank);
            ranks = [...new Set(ranks)];

            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < ranks.length; j++) {        
                    players[i].hand = players[i].hand.filter(card => card.rank !== ranks[j]);
                }
            }
        
            cardto(playerIndex, rank7Count, rank10Count, 0)
        }
        
        if (!cardMoved) {
            players[playerIndex].hand.forEach(card => {
                if (card.count === 1) {
                    card.count = 0;
                }
            });
        }

    } else if (event.button === 2 && players[playerIndex].hand[userIndex].count === 1) {
        players[playerIndex].hand[userIndex].count = 0;
    }
    
    ShowBan(playerIndex);
}

// ローカルルール３
async function trashcheck2(playerIndex) {
    let sukippuCount = 0;

    // 5スキの確認
    if (sukippu) {
        const rank5Count = trash.filter(card => Math.abs(card.rank) === 2 && card.suit !== 4).length;

        if (rank5Count > 0) {
            showCustomAlert2("５スキップ");
            await delay(1000);

            if (rank5Count >= players.length - 1) {
                sukippuCount = players.length - 1;
            } else {
                sukippuCount = rank5Count;
                passcount = rank5Count;
            }
        }
    }

    // 8切りの確認
    if (kiri) {
        const kiri0 = trash.some(card => Math.abs(card.rank) === 5 && card.suit !== 4);

        if (kiri0) {
            showCustomAlert2("８切り");
            await delay(1000);
            sukippuCount = players.length - 1;
        }
    }

    turnset(playerIndex, sukippuCount);
}

// 次のプレイヤーを決める関数
async function turnset(playerIndex, sukippuCount) {
    const rememberedName = players[playerIndex].name;

    if (sukippuCount === players.length - 1) {
        trash = [];
        passcount = 0;
        suitsibari0 = false;
        ranksibari0 = false;

        if (bakku0) {
            for (let i = 0; i < players.length; i++) {
                players[i].hand.forEach(card => {
                    if (card.suit !== 4) {
                        card.rank = -card.rank;
                    }
                });
            }
            bakku0 = false;  
        }
    }

    let hand0 = playerIndex;
    for (let i = 0; i < players.length; i++) {
        if (players[hand0].hand.length === 0) {
            for (var j = 0; j < player.length; j++) {
                if (player[j].name === players[hand0].name) {
                    player[j].level = gemerank;
                    gemerank++;
                    passcount = -1;
                    ShowBan(playerIndex);
                    showCustomAlert("上がりました");
                    await delay(1000);
                    break;
                }
            }
            players.splice(hand0, 1);

            if (players.length === 1) {
                for (var j = 0; j < player.length; j++) {
                    if (player[j].name === players[0].name) {
                        player[j].level = gemerank;
                        break;
                    }
                }
                showCustomAlert("ラウンドを終了します");
                await delay(1000);
                roundset();
                return;
            }

            if (hand0 === players.length) {
                hand0 = 0;
            }
        } else {
            hand0 = (hand0 + 1) % players.length;
        }
    }
    
    if (players.some(player => player.name === rememberedName)) {
        currentPlayer = (playerIndex + 1 + sukippuCount) % players.length;
    } else {
        currentPlayer = (playerIndex + sukippuCount) % players.length;
    }
    
    gameControl();
}

//passを処理する関数
async function pass(playerIndex) {
    currentPlayer = (currentPlayer + 1) % players.length; 
    passcount ++;
    if(passcount > players.length - 2){
        trash = [];
        passcount = 0;
        suitsibari0 = false;
        ranksibari0 = false;
        if (bakku0){
            for (var i = 0; i < players.length; i++){
                players[i].hand.forEach(card => {
                    if (card.suit !== 4) { 
                        card.rank = - card.rank;
                    }
                });
            }
            bakku0 = false;
        }
    }

    ShowBan(playerIndex);
    showCustomAlert("パスが選択されました");
    await delay(1000);
    gameControl();
}

window.init = async function init() {
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.onmousedown = mousePress;

    // CSRFトークンを取得
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
        const response = await fetch('/initialize-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken  // CSRFトークンをヘッダーに追加
            }
        });

        if (!response.ok) {
            throw new Error(`サーバーエラー: ${response.status}`);
        } 
    } catch (error) {
        console.error('エラー:', error);
    }
};

//２ラウンド目以降のゲームを開始する関数
async function roundset() {
    if (round === 3) {
        showCustomAlert("ホーム画面に戻ります");
        await delay(1000);

        window.location.href = "gemehome.html";
        return;
    }
    cardSet();
    gameInitialize();
    await exchange();
    gameControl();
}