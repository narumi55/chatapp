document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const pin = urlParams.get('pin'); // PINコードを取得

    const pinElement = document.getElementById('room-pin');
    const hostNameElement = document.getElementById('host-user-name');
    const guestNameElement = document.getElementById('guest-user-name');

    if (pinElement) {
        pinElement.textContent = pin; // PINコードを表示
    }

    // データベースからルームデータを取得して表示
    function fetchRoomData() {
        fetch(`/api/room/${pin}`, {
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                return;
            }

            if (data.started) {
                const redirectUrl = `/daihugou?pin=${encodeURIComponent(pin)}&id=${encodeURIComponent(data.guest_user_id)}`;

                // ブラウザをリダイレクト
                window.location.href = redirectUrl;
            }

            // ホストとゲストの名前を更新
            if (hostNameElement) {
                hostNameElement.textContent = data.host_user_name || '未設定';
            }
            if (guestNameElement) {
                guestNameElement.textContent = data.guest_user_name || '未設定';
            }
        })
        .catch(error => {
            console.error('データ取得エラー:', error);
        });
    }

    // 初回データ取得
    fetchRoomData();

    // 5秒ごとにデータを更新
    setInterval(fetchRoomData, 5000);
    
});



