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

// アカウントモーダルの外側クリックで閉じる
window.addEventListener("click", function (event) {
    var accountModal = document.getElementById("accountModal");
    if (event.target === accountModal) {
        window.closeAccountModal();
    }
});


// ログインモーダルを開く関数
window.openloginModal = function () {
    document.getElementById("loginModal").style.display = "block";
};

// ログインモーダルを閉じる関数
window.closeloginModal = function () {
    document.getElementById("loginModal").style.display = "none";
};



// ログインモーダルの外側クリックで閉じる
window.addEventListener("click", function (event) {
    var loginModal = document.getElementById("loginModal");
    if (event.target === loginModal) {
        window.closeloginModal();
    }
});

// 登録モーダルを開く関数
window.openregisterModal = function () {
    document.getElementById("registerModal").style.display = "block";
};

// 登録モーダルを閉じる関数
window.closeregisterModal = function () {
    document.getElementById("registerModal").style.display = "none";
};

// 登録モーダルの外側クリックで閉じる
window.addEventListener("click", function (event) {
    var registerModal = document.getElementById("registerModal");
    if (event.target === registerModal) {
        window.closeregisterModal();
    }
});

// 一人で練習のページへ遷移
window.openSinglePractice = function () {
    window.location.href = '/daihugou4';
};

window.openMultiplePractice = function () {
    window.location.href = '/daihugou';
};