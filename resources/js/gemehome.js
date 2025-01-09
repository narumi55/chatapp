// ルール設定モーダルを開く関数
window.openRulesSettings = function () {
    document.getElementById("rulesModal").style.display = "block";
};

// ルール設定モーダルを閉じる関数
window.closeRulesSettings = function () {
    document.getElementById("rulesModal").style.display = "none";
};

// ルール設定モーダルの外側クリックで閉じる
window.addEventListener("click", function (event) {
    var rulesModal = document.getElementById("rulesModal");
    if (event.target === rulesModal) {
        window.closeRulesSettings();
    }
});

// アカウントモーダルを開く関数
window.openAccountModal = function () {
    document.getElementById("accountModal").style.display = "block";
};

// アカウントモーダルを閉じる関数
window.closeAccountModal = function () {
    document.getElementById("accountModal").style.display = "none";
};

// 友達と対戦モーダルを開く関数
window.openMultiplePractice = function () {
    document.getElementById("multiplayerModal").style.display = "block";
};

// 友達と対戦モーダルを閉じる関数
window.closeMultiplePractice = function () {
    document.getElementById("multiplayerModal").style.display = "none";
};

// 友達と対戦モーダルの外側クリックで閉じる
window.addEventListener("click", function (event) {
    var multiplayerModal = document.getElementById("multiplayerModal");
    if (event.target === multiplayerModal) {
        window.closeMultiplePractice();
    }
});

// アカウントモーダルの外側クリックで閉じる
window.addEventListener("click", function (event) {
    var accountModal = document.getElementById("accountModal");
    if (event.target === accountModal) {
        window.closeAccountModal();
    }
});

// 一人で練習のページへ遷移
window.openSinglePractice = function () {
    window.location.href = '/daihugou4';
};

window.openLoginPage = function() {
    window.location.href = '/auth/login';
};

window.openRegisterPage = function() {
    window.location.href = '/auth/register';
};

window.createRoom = function() {
    window.location.href = '/host';
};

window.joinRoom = function() {
    window.location.href = '/guest';
};