var ctx;
var carddeck = [];
var trash = [];
var trump = 0;
var cardMoved = false;
var currentPlayer = 0; 
var passcount = 0;
var players = [];
var player = [];

var gemelevel = ["大富豪", "富豪", "貧民", "大貧民"];
var gemerank = 1;
var round = 0;
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const currentUrl = window.location.href;
const urlParams = new URLSearchParams(new URL(currentUrl).search);
const localPin = urlParams.get('pin');
const localUserId = urlParams.get('id');
console.log(`localPin=${localPin}, localUserId=${localUserId}`);

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
    var name = "";
    switch (card.suit) {
        case 0: name = "c"; break;
        case 1: name = "d"; break;
        case 2: name = "h"; break;
        case 3: name = "s"; break;
        case 4: name = "j"; break;
    }
    const cardId = faceUp ? (name + card.rank) : 'z1';
    const img = document.getElementById(cardId);

    if (!img) {
        console.error('対応するカード画像が見つかりません:', card);
        return;
    }

    // カードの表示サイズ
    const cardWidth = 71;
    const cardHeight = 96;

    ctx.save();

    if (rotate) {
        // カード中心を回転中心にするため、中心へ移動後90度回転、再度元位置へ戻す
        ctx.translate(x + cardWidth / 2, y + cardHeight / 2);
        ctx.rotate(Math.PI / 2); // 90度回転
        ctx.translate(-cardWidth / 2, -cardHeight / 2);
        // 回転後の描画基準点を(0,0)にする
        x = 0;
        y = 0;
    }

    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, cardWidth, cardHeight);

    // 枠線色をcountに応じて変更
    if (card.count === 1) {
        ctx.strokeStyle = "yellow";
    } else if (card.count === 0) {
        ctx.strokeStyle = "blue";
    } else if (card.count === -1) {
        ctx.strokeStyle = "red";
    } else {
        // デフォルト色(必要なら設定)
        ctx.strokeStyle = "blue";
    }

    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    ctx.restore();
}

let intervalId;
async function updateGameBoardLoop() {
    try {
        await updateGameBoard();  // ここで fetch 等の処理
    } catch (error) {
        console.error('Error:', error);
    }
    // 処理が終わった後に次の呼び出しを3秒後にセット
    setTimeout(updateGameBoardLoop, 3000);
}
window.onload = function() {
    init();
  };
function init() {
    updateGameBoardLoop();
}
async function updateGameBoard() {
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const response = await fetch('/user-turn', {
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

        if (localPin !== data.original.pin) {
            console.log(`PIN不一致: localPin=${localPin}, serverPin=${data.pin}`);
            return;  // 処理を中断
        }

        clearInterval(intervalId);

        if (data.gameOver) {
            console.log('ゲームが終了しました');
            // ゲーム終了時の処理をここに追加
            return;
        }

        // サーバーからのデータを基に画面を描画
        const players = data.original.players;
        const playerIndex = data.original.playerIndex;
        const trash = data.original.trash; 
        const kakumei = data.original.kakumei;
        const suitsibari = data.original.suitsibari;
        const ranksibari = data.original.ranksibari;
        const kiri = data.original.kiri;
        const bakku = data.original.bakku;
        const kaesi = data.original.kaesi;
        const sukippu = data.original.sukippu;
        const watasi = data.original.watasi;
        const sute = data.original.sute;
        const bonnba = data.original.bonnba;

        const currentPlayerId = players[playerIndex].id;
        if(currentPlayerId == localUserId){
            userTurn(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba);
        } else {
            ShowBan(playerIndex, players, trash);
        }
        
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
            { x: 772, y: 58, levelY: 81, imageId: 'p2' },  // CPU2
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
            // ユーザーの手札
            // 参考コードと同様に、水平方向に右へずらしながら描画
            drawHand(player.hand, { xStart: 126, yStart: 809, xStep: 36, faceUp: true, rotate: false });
        } else if (player.name === "cpu2") {
            // CPU2の手札
            // 参考コードではx=633からスタートし、xStep:-36で左方向へカードを並べていた
            drawHand(player.hand, { xStart: 633, yStart: 10, xStep: -36, faceUp: false, rotate: false });
        }
    });

    console.log("trashcheck: 現在のトラッシュ2:", trash);
    // 捨て札の描画
    drawHand(trash, { xStart: 415 - 35.5 * trash.length, yStart: 409.5, xStep: 72, faceUp: true, rotate: false });
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
function userTurn(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba) {
    canvas.onmousedown = function(event) {
        mousePress(event, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba);
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

    ShowBan(playerIndex, players, trash);
    showCustomAlert("ユーザーのターン");
}

// ユーザーのマウスクリックを処理する関数。
function mousePress(event, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba) {
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
                moveCardsToTrash(countOneCards, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba); // トラッシュに移動
            } else if (countOneCards.length === 2 && sameRankCards.length === 2) {
                moveCardsToTrash(countOneCards, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba); // 両方をトラッシュに移動
            } else if (countOneCards.length >= 3 && (sameRankCards.length === countOneCards.length || (sameSuit && isConsecutive))) {
                moveCardsToTrash(countOneCards, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba); // すべてのカードをトラッシュに移動
            }
        }
        else if (trash.length === 1 && countOneCards.length === 1) {
            moveCardsToTrash(countOneCards, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba); // トラッシュに移動
        }
        else if (trash.length > 1 && countOneCards.length === trash.length) {
            // トラッシュにカードが2枚以上の場合
            var allTrashSameRank = trash.every(card => card.rank === trash[0].rank); // すべてのトラッシュのカードが同じランクかどうか
            var clickedCardRank = countOneCards[0].rank; // クリックしたカードのランク
        
            if (allTrashSameRank && countOneCards.every(card => card.rank === clickedCardRank)) {
                // すべてのトラッシュのカードが同じランクかつクリックしたカードが同じランクの場合
                moveCardsToTrash(countOneCards, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba); // トラッシュに移動
            } else if (!allTrashSameRank && isConsecutive) {
                // トラッシュのカードが同じランクではないが、クリックしたカードが階段の場合
                moveCardsToTrash(countOneCards, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba); // トラッシュに移動
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
    ShowBan(playerIndex, players, trash);
}

// トラッシュの新旧を比較する関数
async function moveCardsToTrash(cards, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba) {
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
    console.log("trashcheck: 現在のトラッシュ:", trash);
    for (var card of cards) {
        card.count = 0; // カウントを0にする
        players[playerIndex].hand.splice(players[playerIndex].hand.indexOf(card), 1); // 指定されたプレイヤーの手札から削除
    }

    cardMoved = true;
    passcount = 0;

    ShowBan(playerIndex, players, trash);

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
        if (trash.length === 1 && trash[0].suit === 3 && trash[0].rank === 1) {
            jokerone = true; 
        } else {
            jokerone = false;
        }
    }
    
    if (jokerone) {
        // スぺ３返しの処理
        showCustomAlert2("スぺ３返し");
        await delay(1000);
        
        turnset(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, players.length - 1);
    } else {
        trashcheck(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba);
    }
}

// ローカルルールを処理する関数
async function trashcheck(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba) {
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
        bakku0 = trash.some(card => Math.abs(card.rank) === 9 && card.suit !== 4);
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
        rank7Count = trash.filter(card => Math.abs(card.rank) === 5 && card.suit !== 4).length; 
    }

    // 10捨ての確認
    if (sute) {
        rank10Count = trash.filter(card => Math.abs(card.rank) === 8 && card.suit !== 4).length;   
    }

    // 12ボンバーの確認
    if (bonnba) {
        rank12Count = trash.filter(card => Math.abs(card.rank) === 10 && card.suit !== 4).length;        
    }

    if (rank7Count === 0 && rank10Count === 0 && rank12Count === 0) {
        trashcheck2(playerIndex);
    } else if (players[playerIndex].name === "user") {
        cardto(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba,rank7Count, rank10Count, rank12Count);
    }
}

// ユーザーのローカルルール２
async function cardto(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, rank7Count, rank10Count, rank12Count) {
    // すべてのカウントが0の場合は次のターンへ
    if (rank7Count === 0 && rank10Count === 0 && rank12Count === 0) {
        sendGameData(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba);
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
            mousePress2(event, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, rank7Count, rank10Count, rank12Count, 7); 
        };
    } else if (rank10Count > 0 && players[playerIndex].hand.length > 0) {
        showCustomAlert2("１０捨て");
        await delay(1000);
        showCustomAlert("捨てるカードを選択してください");
        canvas.onmousedown = function(event) {
            mousePress2(event, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, rank7Count, rank10Count, rank12Count, 10); 
        };
    } else if (rank12Count > 0 && players[playerIndex].hand.length > 0) {
        showCustomAlert2("１２ボンバー");
        await delay(1000);
        showCustomAlert("選んだカードの数字を持つカードをすべての手札から除外します");
        canvas.onmousedown = function(event) {
            mousePress2(event, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, rank7Count, rank10Count, rank12Count, 12); 
        };
    } else {
        trashcheck2(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba);
    }
}

// ローカルルールのマウスクリックを処理する関数。
function mousePress2(event, playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, rank7Count, rank10Count, rank12Count, setValue) {
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

            cardto(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, 0, rank10Count, rank12Count)
        } else if (setValue === 10 && (countOneCards.length === rank10Count || (players[playerIndex].hand.length < rank10Count && players[playerIndex].hand.length === countOneCards.length))) {
            countOneCards.forEach(card => {
                players[playerIndex].hand = players[playerIndex].hand.filter(c => c !== card);
            });
            cardto(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, rank7Count, 0, rank12Count)
        } else if (setValue === 12 && (countOneCards.length === rank12Count || (players[playerIndex].hand.length < rank12Count && players[playerIndex].hand.length === countOneCards.length))) {
            let ranks =  countOneCards.map(card => card.rank);
            ranks = [...new Set(ranks)];

            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < ranks.length; j++) {        
                    players[i].hand = players[i].hand.filter(card => card.rank !== ranks[j]);
                }
            }
        
            cardto(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba, rank7Count, rank10Count, 0)
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
    
    ShowBan(playerIndex, players, trash);
}

//passを処理する関数
async function pass(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba) {
    playerIndex = (playerIndex + 1) % players.length; 
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

    ShowBan(playerIndex, players, trash);
    showCustomAlert("パスが選択されました");
    await delay(1000);
    gameControl();
}

async function sendGameData(playerIndex, players, trash, kakumei, suitsibari, ranksibari, kiri, bakku, kaesi, sukippu, watasi, sute, bonnba) {
    try {
        const response = await fetch('/updateGame', { // 適切なエンドポイントに変更
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken // LaravelのCSRF保護のため
            },
            body: JSON.stringify({
                playerIndex: playerIndex,
                players: players,
                trash: trash,
                kakumei: kakumei,
                suitsibari: suitsibari,
                ranksibari: ranksibari,
                kiri: kiri,
                bakku: bakku,
                kaesi: kaesi,
                sukippu: sukippu,
                watasi: watasi,
                sute: sute,
                bonnba: bonnba,
            })
        });

        if (!response.ok) {
            throw new Error(`サーバーエラー: ${response.status}`);
        }

        const data = await response.json();
        console.log('サーバーからのレスポンス:', data);
    } catch (error) {
        console.error('データ送信中にエラーが発生しました:', error);
    }
}