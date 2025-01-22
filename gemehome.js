// モーダルを開く関数
function openRulesSettings() {
    document.getElementById("rulesModal").style.display = "block";
}

// モーダルを閉じる関数
function closeRulesSettings() {
    document.getElementById("rulesModal").style.display = "none";
}

// モーダルの外側をクリックしたときに閉じる
window.onclick = function(event) {
    var modal = document.getElementById("rulesModal");
    if (event.target == modal) {
        closeRulesSettings();
    }
}

function opensoundSettings() {
    document.getElementById("soundModal").style.display = "block";
}

function closesoundSettings() {
    document.getElementById("soundModal").style.display = "none";
}

window.onclick = function(event) {
    var modal = document.getElementById("soundModal");
    if (event.target == modal) {
        closesoundSettings();
    }
}

function openSinglePractice() {
    window.location.href = "daihugou4.html"; // 指定したページに遷移
}