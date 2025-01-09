window.init = function() {
    // CSRFトークンを取得
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // 部屋を作成 (POST)
    fetch(CREATE_ROOM_URL, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': token,             // LaravelのCSRF対策
            'Content-Type': 'application/json' // JSONで送りたい場合
        },
        body: JSON.stringify({
            // createRoom に送りたいデータがあれば指定
        })
    })
    .then(response => {
        // コントローラが redirect() を返す場合、fetch() は自動でリダイレクトしない
        if (response.redirected) {
            // 302リダイレクトされているなら、手動で画面遷移
            window.location.href = response.url;
        } else {
            // JSONを返す実装の場合はこちらでレスポンスを処理
            return response.json();
        }
    })
    .then(data => {
        console.log(data);  // JSONを返した場合
    })
    .catch(error => {
        console.error('Error:', error);
    });
};

// 5秒ごとにサーバーへゲスト参加状況を確認
setInterval(() => {
    fetch(CHECK_GUEST_URL, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.guest_user_name) {
                document.getElementById('guestNAME').textContent = data.guest_user_name;
            } else {
                document.getElementById('guestNAME').textContent = 'いません';
            }
        })
        .catch((error) => {
            console.error('エラー:', error);
        });
}, 5000);
