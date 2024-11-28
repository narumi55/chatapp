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

//カードの描画
function drawCard(card, x, y, flag, rotate) {
    ctx.save();
    if (rotate) {
        ctx.translate(x + 35.5, y + 48); // カードの中心に移動
        ctx.rotate(Math.PI / 2); // 90度回転（ラジアンで指定）
        ctx.translate(-35.5, -48); // 元の位置に戻す
        x = 0; // x座標を0に
        y = 0; // y座標を0に
    }
    if (flag == true) {
        ctx.drawImage(card.image, 0, 0, card.image.width, card.image.height, x, y, 71, 96);
        // カウントに基づいて枠の色を変更する
        if (card.count === 1) {
            ctx.strokeStyle = "yellow"; // カウントが1以上の場合は黄色
        } else if (card.count === 0){
            ctx.strokeStyle = "blue"; // 通常時は青
        } else if (card.count === -1){
            ctx.strokeStyle = "red"; 
        }
    } else {
        ctx.drawImage(card.backimage, 0, 0, card.image.width, card.image.height, x, y, 71, 96);
    }
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 71, 96);
    ctx.restore();
}

//カードのセットアップと初期化,各カードにスート、ランク、画像を割り当てる。
function cardSet() {
    var backimage = document.getElementById("z1");
    carddeck = [];
    for (var s = 0; s < 4; s++) {
        for (var r = 0; r < 13; r++) {
            var name = "";
            switch (s) {
                case 0: name = "c"; break;
                case 1: name = "d"; break;
                case 2: name = "h"; break;
                case 3: name = "s"; break;
            }
            name = name + (r + 1);
            var image = document.getElementById(name);
            var card = new Card(s, r, image, backimage);
            carddeck.push(card);
        }
    }
    var jImage = document.getElementById("j14"); // ジョーカーの画像
    var jokerCard = new Card(4, 14, jImage, backimage); // スートは-1または特別な値に設定
    carddeck.push(jokerCard);
}

//カードデッキをシャッフルする関数
function cardInitialize() {
    let i = carddeck.length
    while (i > 0) {
        var s = Math.floor(Math.random() * i);
        var temp = carddeck[--i]
        carddeck[i] = carddeck[s]
        carddeck[s] = temp
    }
}

//ゲームの初期化を行う関数。コンピュータとユーザーの手札を配る。
function gameInitialize() {
    round += 1;
    gemerank = 1;
    currentPlayer = 0; 
    passcount = 0;
    trash = [];

    players = [
        { name: "user", hand: [], level: null },
        { name: "cpu1", hand: [], level: null },
        { name: "cpu2", hand: [], level: null },
        { name: "cpu3", hand: [], level: null }
    ];

    kakumei = false;
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

    for (let i = 0; i < players.length; i++) {
        let matchingPlayer = player.find(p => p.name === players[i].name);
    
        if (matchingPlayer) {
            players[i].level = matchingPlayer.level;
        }
    }

    cardInitialize();
    var index = 0;
    
    for (var i = 0; i < 13; i++) {
        players[0].hand.push(carddeck[index++]);
        players[1].hand.push(carddeck[index++]);
        players[2].hand.push(carddeck[index++]);
        players[3].hand.push(carddeck[index++]);
    }
    const randomIndex = Math.floor(Math.random() * 4);
    players[randomIndex].hand.push(carddeck[index]);
    index++;
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

//ゲーム画面を描画する関数。
function ShowBan(playerIndex) {
    // 画面のクリア
    ctx.clearRect(0, 0, 1000, 1000);
    
    // 背景画像の描画
    let img; // 画像を格納する変数を定義

    // kakumei の状態に応じて画像を選択
    if (kakumei) {
        img = document.getElementById('siro2'); // kakumei が true のとき
    } else {
        img = document.getElementById('siro1'); // kakumei が false のとき
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.font = '20px Arial';    // フォントサイズとフォント
    ctx.fillStyle = 'black';     // テキストの色
    ctx.textAlign = 'center';    // テキストの位置（中央揃え）

    const p1Img = document.getElementById('p1');
    ctx.save();
    ctx.drawImage(p1Img, 0, 799, 116, 116); 
    ctx.fillText(player[0].name, 58, 857);
    let displayLevel = player[0].level > 0 ? gemelevel[player[0].level - 1] : "";
    if (displayLevel) {
        ctx.fillText(displayLevel, 58, 880);
    }
    if (players.length > 0) {
        if (players[playerIndex].name === "user") {
            ctx.beginPath();  // 新しいパスを開始
            ctx.arc(58, 857, 60, 0, 2 * Math.PI);  // 円を描画。中心は(58, 857)、半径60
            ctx.strokeStyle = 'yellow';  // 枠線の色を黄色に設定
            ctx.lineWidth = 3;  // 枠線の太さを設定
            ctx.stroke(); // クラスを削除してボーダーを非表示
        }
    }
    ctx.restore();

    const p2Img = document.getElementById('p2');
    ctx.save();
    ctx.drawImage(p2Img, 0, 116, 116, 116);
    ctx.fillText(player[1].name, 58, 174);
    let displayLevel1 = player[1].level > 0 ? gemelevel[player[1].level - 1] : "";
    if (displayLevel1) {
        ctx.fillText(displayLevel1, 58, 197);
    }
    if (players.length > 0) {
        // players 配列が空でない場合にのみ処理を続ける
        if (players[playerIndex].name === "cpu1") {
            ctx.beginPath();  // 新しいパスを開始
            ctx.arc(58, 174, 60, 0, 2 * Math.PI);  // 円を描画。中心は(58, 174)、半径60
            ctx.strokeStyle = 'yellow';  // 枠線の色を黄色に設定
            ctx.lineWidth = 3;  // 枠線の太さを設定
            ctx.stroke();
        }
    }
    ctx.restore();

    const p3Img = document.getElementById('p2');
    ctx.save();
    ctx.drawImage(p3Img, 714, 0, 116, 116);
    ctx.fillText(player[2].name, 772, 58);
    let displayLevel2 = player[2].level > 0 ? gemelevel[player[2].level - 1] : "";
    if (displayLevel2) {
        ctx.fillText(displayLevel2, 772, 81);
    }
    if (players.length > 0) {
        if (players[playerIndex].name === "cpu2") {
            ctx.beginPath();  // 新しいパスを開始
            ctx.arc(772, 58, 60, 0, 2 * Math.PI);  // 円を描画。中心は(772, 58)、半径60
            ctx.strokeStyle = 'yellow';  // 枠線の色を黄色に設定
            ctx.lineWidth = 3;  // 枠線の太さを設定
            ctx.stroke();
        }
    }
    ctx.restore();

    const p4Img = document.getElementById('p2');
    ctx.save();
    ctx.drawImage(p4Img, 714, 683, 116, 116);
    ctx.fillText(player[3].name, 772, 741);
    let displayLevel3 = player[3].level > 0 ? gemelevel[player[3].level - 1] : "";
    if (displayLevel3) {
        ctx.fillText(displayLevel3, 772, 764);
    }
    if (players.length > 0){
        if (players[playerIndex].name === "cpu3") {
            ctx.beginPath();  // 新しいパスを開始
            ctx.arc(772, 741, 60, 0, 2 * Math.PI);  // 円を描画。中心は(772, 741)、半径60
            ctx.strokeStyle = 'yellow';  // 枠線の色を黄色に設定
            ctx.lineWidth = 3;  // 枠線の太さを設定
            ctx.stroke();
        }
    }
    ctx.restore();

    // ユーザーの手札の表示
    let userPlayer = players.find(player => player.name === "user");
    if (userPlayer) {
        let pos = 126;
        for (let i = 0; i < userPlayer.hand.length; i++) {
            drawCard(userPlayer.hand[i], pos, 809, true, false);
            pos += 36;
        }
    }

    // CPU1の手札の表示
    let cpu1Player = players.find(player => player.name === "cpu1");
    if (cpu1Player) {
        let pos1 = 229;
        for (let i = 0; i < cpu1Player.hand.length; i++) {
            drawCard(cpu1Player.hand[i], 21, pos1, false, true);
            pos1 += 28;
        }
    }

    // CPU2の手札の表示
    let cpu2Player = players.find(player => player.name === "cpu2");
    if (cpu2Player) {
        let pos2 = 633;
        for (let i = 0; i < cpu2Player.hand.length; i++) {
            drawCard(cpu2Player.hand[i], pos2, 10, false, false);
            pos2 -= 36;
        }
    }

    // CPU3の手札の表示
    let cpu3Player = players.find(player => player.name === "cpu3");
    if (cpu3Player) {
        let pos3 = 589;
        for (let i = 0; i < cpu3Player.hand.length; i++) {
            drawCard(cpu3Player.hand[i], 736, pos3, false, true);
            pos3 -= 28;
        }
    }

    let pos4 = 415 - (35.5*trash.length);
    for (var i = 0; i < trash.length; i++) {
        drawCard(trash[i], pos4, 409.5, true, false);
        pos4 += 72;
    }
}

// カードのカウントを更新する関数
function updateCardCounts(playerIndex) {
    if (trash.length > 0) {
        var highestTrashRank = Math.max(...trash.map(card => card.rank));
        
        if (suitsibari0) {
            players[playerIndex].hand.forEach(card => {
                if (!trashsuits.includes(card.suit) && card.suit !== 4) {
                    card.count = -1; // トラッシュにないスートを持つカードのカウントを-1に設定
                }
            });
        }

        if (ranksibari0) {
            players[playerIndex].hand.forEach(card => {
                if ((card.rank < highestTrashRank + 1 || card.rank > highestTrashRank + trash.length) && card.suit !== 4) {
                    card.count = -1;
                }
            });
        }

        players[playerIndex].hand.forEach(card => {
            // ランクがトラッシュの最高ランク以下の場合、カウントを-1に設定
            if (card.rank <= highestTrashRank) {
                card.count = -1;
            }
        });

        // スペ3返しの確認
        if (kaesi) {
            if (trash[0].suit === 4 && trash.length === 1) {
                players[playerIndex].hand.forEach(card => {
                    if (card.rank === 0 && card.suit === 3) {
                        card.count = 0;
                    }
                });
            }
        }

        var jokerInPlayer = players[playerIndex].hand.some(card => card.suit === 4); 
        // トラッシュカードが2枚以上ある場合の処理
        if (trash.length > 1 && !jokerInPlayer) {
            var allSameRank = trash.every(card => card.rank === trash[0].rank);

            if (allSameRank) {
                if (ranksibari0) {
                    players[playerIndex].hand.forEach(card => {
                        if (card.rank !== highestTrashRank + 1) {
                            card.count = -1;
                        }
                    });
                }
                var countZeroCards = players[playerIndex].hand.filter(card => card.count === 0);
                countZeroCards.forEach(card => {
                    // 同じランクのカードの数をチェック
                    var sameRankCardsInHand = countZeroCards.filter(c => c.rank === card.rank);
                    if (sameRankCardsInHand.length < trash.length) {
                        card.count = -1;
                    }
                });
            } else {
                var countZeroCards = players[playerIndex].hand.filter(card => card.count === 0);
                countZeroCards.forEach(card => {
                    let integers = [];
                    for (let i = -(trash.length - 1); i <= (trash.length - 1); i++) {
                        if (i !== 0) {
                            integers.push(i);
                        }
                    }

                    let allConditionsMet = false;

                    for (let i = 0; i < trash.length; i++) {
                        for (let j = 0; j < trash.length - 1; j++) {
                            allConditionsMet = true;
                            const targetRank = card.rank + integers[i + j];
                            const targetExists = countZeroCards.some(card1 => card1.count === 0 && card1.rank === targetRank && card.suit === card1.suit);
                            
                            if (!targetExists) {
                                allConditionsMet = false;
                                break; // 内部ループを抜ける
                            }
                        }

                        if (allConditionsMet) {
                            break; // 外部ループを抜ける
                        }
                    }

                    if (!allConditionsMet) {
                        card.count = -1;
                    }
                });
            }
        }

        // ジョーカーがあるとき
        if (trash.length > 1 && jokerInPlayer) {
            var allSameRank = trash.every(card => card.rank === trash[0].rank);
            const newHandWithoutJokers = players[playerIndex].hand.filter(card => card.suit !== 4);
            if (allSameRank) {
                players[playerIndex].hand.forEach(card => {
                    if (card.rank !== highestTrashRank + 1 && card.suit !== 4) {
                        card.count = -1;
                    }
                });
                var countZeroCards = players[playerIndex].hand.filter(card => card.count === 0);
                countZeroCards.forEach(card => {
                    // 同じランクのカードの数をチェック
                    var sameRankCardsInHand = newHandWithoutJokers.filter(c => c.rank === card.rank);
                    if (sameRankCardsInHand.length < trash.length - 1) {
                        card.count = -1;
                    }
                });
            } else {
                var countZeroCards = players[playerIndex].hand.filter(card => card.count === 0);
                countZeroCards.forEach(card => {
                    let integers = [];
                    for (let i = -(trash.length - 1); i <= (trash.length - 1); i++) {
                        if (i !== 0) {
                            integers.push(i);
                        }
                    }

                    let allConditionsMet = false;
                    var allConditionsMetCount = 0;

                    for (let i = 0; i < trash.length; i++) {
                        allConditionsMetCount = 0;
                        for (let j = 0; j < trash.length - 1; j++) {
                            allConditionsMet = true;
                            const targetRank = card.rank + integers[i + j];
                            const targetExists = countZeroCards.some(card1 => card1.count === 0 && card1.rank === targetRank && card.suit === card1.suit);
                            
                            if (!targetExists) {
                                allConditionsMetCount++;
                                if (allConditionsMetCount > 1) {
                                    allConditionsMet = false;
                                    break; // 内部ループを抜ける
                                }                        
                            }
                        }

                        if (allConditionsMet) {
                            break; // 外部ループを抜ける
                        }
                    }

                    if (!allConditionsMet) {
                        card.count = -1; 
                    }
                });
            }
            const handWithoutJokers = players[playerIndex].hand.filter(card => card.suit !== 4);
            // カウント0のカードがあるかどうかをチェック
            const hasCountZero = handWithoutJokers.some(card => card.count === 0);
            // playerHands[playerIndex] 内のジョーカーを見つけてカウントを設定
            players[playerIndex].hand.forEach(card => {
                if (card.suit === 4) { 
                    card.count = hasCountZero ? 0 : -1; 
                }
            });
        }
    }
}

//ゲームの遂行を処理する関数
function gameControl() {
    canvas.onmousedown = null;
    document.querySelector("button[onclick='pass()']").disabled = true;
    
    for (var i = 0; i < players.length; i++){
        players[i].hand.forEach(card => {
            card.count = 0;
        });
    }
    // ユーザーのターン
    if (players[currentPlayer].name === "user") {
        userTurn(currentPlayer);
    } else {
        cpuTurn(currentPlayer);
    }
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

//init: ゲームを初期化して描画を開始する関数
window.init = function init() {
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.onmousedown = mousePress;
    cardSet();
    gameInitialize();
    gameControl();
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