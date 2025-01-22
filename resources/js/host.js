window.init = function() {
    // CSRFトークンを取得
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch(CREATE_ROOM_URL, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': token,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        // エラーステータスの場合はここでthrowするなどハンドリング
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 正常ならJSONを取得
        return response.json();
      })
      .then(data => {
        // data.redirectToがあればリダイレクト
        if (data.redirectTo) {
          window.location.href = data.redirectTo;
        } else {
          console.log(data.status);
        }
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
